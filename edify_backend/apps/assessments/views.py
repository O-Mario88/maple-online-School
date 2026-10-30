from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AssessmentWindow, Question
from .serializers import AssessmentWindowSerializer, QuestionSerializer

from django.db.models import Q
from institutions.models import InstitutionMembership

class TenantFilterMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_superuser:
            return qs
        user_institutions = InstitutionMembership.objects.filter(
            user=self.request.user, status='active'
        ).values_list('institution_id', flat=True)
        if not user_institutions:
            return qs.none()
        
        # Determine the related field path to institution_id based on the model
        model_name = self.queryset.model.__name__
        if model_name == 'AssessmentWindow':
            return qs.filter(class_reference__institution_id__in=user_institutions)
        elif model_name == 'Assessment':
            return qs.filter(
                Q(window__class_reference__institution_id__in=user_institutions) |
                Q(target_group__institution_id__in=user_institutions)
            )
        elif model_name == 'Question':
            return qs.filter(
                Q(assessment__window__class_reference__institution_id__in=user_institutions) |
                Q(assessment__target_group__institution_id__in=user_institutions)
            )
        elif model_name == 'Submission':
            return qs.filter(
                Q(assessment__window__class_reference__institution_id__in=user_institutions) |
                Q(assessment__target_group__institution_id__in=user_institutions)
            )
        return qs

class AssessmentWindowViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = AssessmentWindow.objects.select_related('class_reference').all()
    serializer_class = AssessmentWindowSerializer
    permission_classes = [IsAuthenticated]

class QuestionViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    queryset = Question.objects.select_related('assessment').all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
