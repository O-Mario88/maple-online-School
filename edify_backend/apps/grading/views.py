from rest_framework import viewsets, permissions, exceptions
from .models import SubjectGrade, ReportCard
from .serializers import SubjectGradeSerializer, ReportCardSerializer
from institutions.models import InstitutionMembership
from edify_core.permissions import SCHOOL_ADMIN_ROLES, ACADEMIC_LEADER_ROLES, TEACHER_ROLES
from django.utils import timezone


class SubjectGradeViewSet(viewsets.ModelViewSet):
    """
    Teachers upload continuous assessment results into Subjects here.
    """
    serializer_class = SubjectGradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        staff_institutions = InstitutionMembership.objects.filter(
            user=user,
            role__in=SCHOOL_ADMIN_ROLES + ACADEMIC_LEADER_ROLES + TEACHER_ROLES,
            status='active'
        ).values_list('institution_id', flat=True)

        if staff_institutions.exists():
            return SubjectGrade.objects.filter(assigned_class__institution_id__in=staff_institutions)

        return SubjectGrade.objects.filter(student=user)


class ReportCardViewSet(viewsets.ModelViewSet):
    """
    Master Reporting endpoint.
    Strict Privacy: Students only see their own PUBLISHED report cards.
    Administrators orchestrate the Draft -> Publish state.
    """
    serializer_class = ReportCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        staff_institutions = InstitutionMembership.objects.filter(
            user=user,
            role__in=SCHOOL_ADMIN_ROLES + ACADEMIC_LEADER_ROLES + TEACHER_ROLES,
            status='active'
        ).values_list('institution_id', flat=True)

        if staff_institutions.exists():
            # Staff can see Draft and Published reports within their tracked institution bounds
            return ReportCard.objects.filter(institution_id__in=staff_institutions).order_by('-generated_at')

        # Students ONLY see explicit published ones
        return ReportCard.objects.filter(student=user, is_published=True).order_by('-published_at')

    def perform_update(self, serializer):
        user = self.request.user

        # Verify execution context mapping to Institution Admin
        report_card = self.get_object()

        is_admin = InstitutionMembership.objects.filter(
            user=user,
            institution=report_card.institution,
            role__in=ACADEMIC_LEADER_ROLES,
            status='active'
        ).exists()

        if not is_admin:
            raise exceptions.PermissionDenied("Only the Headteacher or Institution Administrator can modify/publish official Report Cards.")

        # If toggling publish state for the first time
        if serializer.validated_data.get('is_published', False) and not report_card.is_published:
            serializer.save(published_at=timezone.now())
        else:
            serializer.save()
