from rest_framework import viewsets, permissions
from .models import LessonAttendance
from .serializers import LessonAttendanceSerializer
from institutions.models import InstitutionMembership
from edify_core.permissions import SCHOOL_ADMIN_ROLES, ACADEMIC_LEADER_ROLES, TEACHER_ROLES

class LessonAttendanceViewSet(viewsets.ModelViewSet):
    """
    Exposes the Period-Truancy checker. Allows detection of lesson skipping.
    """
    serializer_class = LessonAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 1. Staff Members (Admins & Teachers)
        staff_institutions = InstitutionMembership.objects.filter(
            user=user, 
            role__in=SCHOOL_ADMIN_ROLES + ACADEMIC_LEADER_ROLES + TEACHER_ROLES,
            status='active'
        ).values_list('institution_id', flat=True)
        
        if staff_institutions.exists():
            # A lesson is tied to a Class, which is tied to an Institution.
            return LessonAttendance.objects.filter(lesson__parent_class__institution_id__in=staff_institutions).order_by('-timestamp')
            
        # 2. Students
        return LessonAttendance.objects.filter(student=user).order_by('-timestamp')
