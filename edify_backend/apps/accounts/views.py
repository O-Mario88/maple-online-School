from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import StudentProfile

# Sign-up, activation, student onboarding and password reset are served by
# the Go API (api/internal/signup).

User = get_user_model()


from .serializers import PublicProfileSerializer
from intelligence.models import UserBadge
from django.shortcuts import get_object_or_404

class PublicProfileView(APIView):
    """
    Public endpoint to view a user's profile, badges, and certificates.
    Requires no authentication.
    """
    permission_classes = [AllowAny]

    def get(self, request, username, *args, **kwargs):
        # We will lookup by a system_username or prefix of email for demo purposes
        user = None
        # Try to find by student profile system_username first
        student_profile = StudentProfile.objects.filter(system_username=username).first()
        if student_profile:
            user = student_profile.user
        else:
            # Fallback to finding by email prefix
            user = User.objects.filter(email__startswith=username).first()

        if not user:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Gather badges
        user_badges = UserBadge.objects.filter(user=user).select_related('badge')
        badges_data = []
        for ub in user_badges:
            badges_data.append({
                'id': f"b-{ub.badge.id}",
                'name': ub.badge.name,
                'description': ub.badge.description,
                'rarity': ub.badge.rarity,
                'unlockedAt': ub.earned_at.isoformat() if ub.earned_at else None
            })

        # Mock certificates for now (we can add a Certificate model later)
        certificates_data = []
        if user_badges.count() > 3:
            certificates_data.append({
                'id': f"cert-{user.id}-1",
                'title': "Platform Foundation Graduate",
                'issuedTo': user.full_name,
                'issuedDate': user.date_joined.isoformat(),
                'issuerLogo': "/icons/maple.png",
                'verificationHash': f"0x{user.id}A8B9C"
            })

        profile_data = {
            'name': user.full_name,
            'username': username,
            'bio': "Dedicated learner on the Edify platform." if user.role == 'student' else "Educational professional.",
            'location': "Uganda" if user.country_code.lower() == 'ug' else "Unknown",
            'avatar': f"https://ui-avatars.com/api/?name={user.full_name.replace(' ', '+')}&size=160&background=f8f9fa",
            'joinedDate': user.date_joined.isoformat(),
            'badges': badges_data,
            'certificates': certificates_data
        }

        serializer = PublicProfileSerializer(data=profile_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings as dj_settings
from rest_framework.exceptions import AuthenticationFailed


class VerifiedEmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT login serializer that enforces email verification when REQUIRE_EMAIL_VERIFICATION is on."""

    def validate(self, attrs):
        data = super().validate(attrs)
        if getattr(dj_settings, 'REQUIRE_EMAIL_VERIFICATION', False) and not self.user.email_verified:
            raise AuthenticationFailed(
                detail={'code': 'email_not_verified', 'detail': 'Please verify your email before signing in.'},
            )
        return data


class VerifiedEmailTokenObtainPairView(TokenObtainPairView):
    """Drop-in replacement for the default JWT login view."""
    serializer_class = VerifiedEmailTokenObtainPairSerializer


from rest_framework.permissions import IsAuthenticated
from .models import PilotFeedback
from .serializers import PilotFeedbackSerializer


class PilotFeedbackCreateView(APIView):
    """POST /api/v1/feedback/ — capture bug reports + comments from pilot users.

    Authenticated-only (so we always know who it came from and can follow
    up). Read is via Django admin at /admin/accounts/pilotfeedback/ —
    there's no list endpoint by design; we don't want a 'see everyone's
    complaints' leak.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PilotFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        PilotFeedback.objects.create(
            user=request.user,
            user_role=getattr(request.user, 'role', '') or '',
            severity=serializer.validated_data['severity'],
            message=serializer.validated_data['message'],
            page_url=serializer.validated_data.get('page_url', '')[:500],
            user_agent=(request.META.get('HTTP_USER_AGENT') or '')[:500],
        )
        return Response({'message': 'Thanks — logged.'}, status=status.HTTP_201_CREATED)
