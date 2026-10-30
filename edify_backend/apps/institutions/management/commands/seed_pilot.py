"""`manage.py seed_pilot` — deterministic 5-user pilot setup.

Creates (or updates in place) exactly what the pilot needs:

  - 1 institution ("Maple Pilot School")
  - 2 teachers: teacher.a@pilot.maple, teacher.b@pilot.maple
  - 2 students: student.a@pilot.maple, student.b@pilot.maple
  - 1 parent:   parent.a@pilot.maple, linked to student.a
  - 1 class:    "S3 East" (visibility=public so lesson queries work)
  - 3 lessons on that class
  - 1 published sample assignment on the class's topic

Idempotent: running twice won't duplicate anyone. Safe to run on
prod before each pilot cohort.

All accounts use PilotPass! by default. Override with
    PILOT_PASSWORD=... ./manage.py seed_pilot
"""
import os
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Deterministic 5-user pilot dataset. Idempotent.'

    def handle(self, *args, **options):
        # Local imports so model registry is ready.
        from institutions.models import Institution, InstitutionMembership
        from curriculum.models import (
            Country, CurriculumTrack, EducationLevel, ClassLevel,
        )
        from classes.models import Class, ClassEnrollment
        from lessons.models import Lesson
        from assessments.models import Assessment
        from accounts.models import TeacherProfile, StudentProfile, ParentProfile
        from parent_portal.models import ParentStudentLink

        password = os.environ.get('PILOT_PASSWORD', 'PilotPass!')

        with transaction.atomic():
            # ── Curriculum scaffolding (minimal) ───────────────────────
            country, _ = Country.objects.get_or_create(
                code='UG', defaults={'name': 'Uganda'}
            )
            track, _ = CurriculumTrack.objects.get_or_create(
                country=country, name='NCDC'
            )
            level, _ = EducationLevel.objects.get_or_create(
                track=track, name='Lower Secondary'
            )
            class_level, _ = ClassLevel.objects.get_or_create(
                level=level, name='S3', defaults={'internal_canonical_grade': 10}
            )

            # ── Institution ────────────────────────────────────────────
            inst, _ = Institution.objects.get_or_create(
                name='Maple Pilot School'
            )

            # ── Current term (the register needs one) ──────────────────
            from scheduling.models import AcademicTerm
            today = timezone.localdate()
            AcademicTerm.objects.update_or_create(
                institution=inst, name='Pilot term',
                defaults={
                    'start_date': today - timedelta(days=30),
                    'end_date': today + timedelta(days=90),
                    'is_active': True,
                },
            )

            # ── Users ──────────────────────────────────────────────────
            def ensure_user(email, full_name, role):
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'full_name': full_name,
                        'country_code': 'UG',
                        'role': role,
                    },
                )
                if created or not user.check_password(password):
                    user.set_password(password)
                user.full_name = full_name
                user.role = role
                user.country_code = 'UG'
                user.email_verified = True  # pilot users skip the activation click
                user.email_verified_at = user.email_verified_at or timezone.now()
                user.save()
                return user

            teacher_a = ensure_user('teacher.a@pilot.maple', 'Teacher Adongo', 'teacher')
            teacher_b = ensure_user('teacher.b@pilot.maple', 'Teacher Bamuli',  'teacher')
            student_a = ensure_user('student.a@pilot.maple', 'Amina Student',   'student')
            student_b = ensure_user('student.b@pilot.maple', 'Brian Student',   'student')
            parent_a  = ensure_user('parent.a@pilot.maple',  'Parent Apio',     'parent')

            # Role profile rows (side-effect-free if they already exist).
            TeacherProfile.objects.get_or_create(user=teacher_a)
            TeacherProfile.objects.get_or_create(user=teacher_b)
            StudentProfile.objects.get_or_create(user=student_a)
            StudentProfile.objects.get_or_create(user=student_b)
            ParentProfile.objects.get_or_create(user=parent_a)

            # ── Institution memberships (scopes assessments + grades) ─
            for user, inst_role in (
                (teacher_a, 'subject_teacher'),
                (teacher_b, 'subject_teacher'),
                (student_a, 'student'),
                (student_b, 'student'),
                (parent_a,  'parent'),
            ):
                InstitutionMembership.objects.update_or_create(
                    user=user, institution=inst,
                    defaults={'role': inst_role, 'status': 'active'},
                )

            # ── Parent-student link ───────────────────────────────────
            ParentStudentLink.objects.update_or_create(
                parent_profile=parent_a.parent_profile,
                student_profile=student_a.student_profile,
                defaults={
                    'relationship_type': 'mother',
                    'consent_status': 'approved',
                },
            )

            # ── A class taught by teacher_a with both students enrolled
            klass, _ = Class.objects.update_or_create(
                institution=inst,
                teacher=teacher_a,
                title='S3 East',
                defaults={
                    'class_level': class_level,
                    'visibility': 'public',
                    'is_published': True,
                },
            )
            for s in (student_a, student_b):
                ClassEnrollment.objects.update_or_create(
                    enrolled_class=klass, student=s,
                    defaults={'status': 'active'},
                )

            # ── Three lessons on the class ─────────────────────────────
            now = timezone.now()
            for i, title in enumerate([
                'Week 1 — Orientation and Expectations',
                'Week 2 — Core Concepts',
                'Week 3 — Practice and Review',
            ], start=1):
                Lesson.objects.update_or_create(
                    parent_class=klass, title=title,
                    defaults={
                        'access_mode': 'published',
                        'scheduled_at': now + timedelta(days=i * 7),
                    },
                )

            # ── One sample published assignment from teacher_a ────────
            Assessment.objects.update_or_create(
                created_by=teacher_a,
                title='Welcome assignment — tell us about yourself',
                defaults={
                    'instructions': (
                        'Write 5-8 sentences introducing yourself. '
                        'What subject are you most excited about this term and why? '
                        'What is one thing you hope to learn?'
                    ),
                    'type': 'assignment',
                    'source': 'manual_school_test',
                    'max_score': 100,
                    'is_published': True,
                },
            )

        # ── Summary ──────────────────────────────────────────────────
        w = self.stdout.write
        w(self.style.SUCCESS('\nPilot dataset ready. Hand these credentials to your 5 users:\n'))
        w(f"  Password (all accounts): {password}\n")
        w("  Teachers:")
        w("    teacher.a@pilot.maple  (Teacher Adongo — owns the S3 East class)")
        w("    teacher.b@pilot.maple  (Teacher Bamuli — second teacher)")
        w("  Students:")
        w("    student.a@pilot.maple  (Amina — Parent Apio's child)")
        w("    student.b@pilot.maple  (Brian)")
        w("  Parent:")
        w("    parent.a@pilot.maple   (Parent Apio — linked to Amina)")
        w("\n  Pre-seeded:")
        w("    1 institution (Maple Pilot School)")
        w("    1 class (S3 East) with 3 lessons + both students enrolled")
        w("    1 published assignment (Welcome assignment)")
        w(self.style.WARNING('\n  Re-run this command any time to reset the pilot fixtures in place.'))
