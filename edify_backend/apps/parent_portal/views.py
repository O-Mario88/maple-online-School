from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import ParentStudentLink, RiskAlert, WeeklySummary
from .serializers import ParentStudentLinkSerializer, RiskAlertSerializer, WeeklySummarySerializer


# Parent links decide who may see a child's records, so they are only made
# by onboarding and school staff, never through this API. People see only
# their own links (as the parent or the student) and what hangs off them.


class ParentStudentLinkViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ParentStudentLinkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ParentStudentLink.objects.filter(parent_profile__user=user) | ParentStudentLink.objects.filter(
            student_profile__user=user
        )


class WeeklySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WeeklySummarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WeeklySummary.objects.filter(link__parent_profile__user=self.request.user, link__consent_status='approved')


class RiskAlertViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RiskAlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        children = ParentStudentLink.objects.filter(
            parent_profile__user=user, consent_status='approved'
        ).values_list('student_profile__user_id', flat=True)
        return RiskAlert.objects.filter(student=user) | RiskAlert.objects.filter(student_id__in=children)
