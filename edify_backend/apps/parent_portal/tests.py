"""Parent links decide who may see a child's grades, attendance and fees, so
nobody may create or approve one through the API, and people only ever see
their own links, summaries and alerts."""
from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import ParentProfile, StudentProfile
from parent_portal.models import ParentStudentLink, RiskAlert, WeeklySummary

User = get_user_model()


def person(email, role):
    return User.objects.create_user(email=email, full_name=email.split('@')[0], country_code='UG', password='Pass!2026xyz', role=role)


class ParentLinkTests(TestCase):
    LINKS = '/api/v1/parent-portal/parent-student-link/'

    def setUp(self):
        self.client = APIClient()
        self.child = person('child@family.test', 'student')
        self.child_profile = StudentProfile.objects.create(user=self.child)
        self.mum = person('mum@family.test', 'parent')
        self.mum_profile = ParentProfile.objects.create(user=self.mum)
        self.link = ParentStudentLink.objects.create(
            parent_profile=self.mum_profile, student_profile=self.child_profile, consent_status='approved')
        self.stranger = person('stranger@evil.test', 'parent')
        self.stranger_profile = ParentProfile.objects.create(user=self.stranger)
        WeeklySummary.objects.create(link=self.link, week_date=date(2026, 10, 26), ai_generated_narrative='A good week.')
        RiskAlert.objects.create(student=self.child, trigger_reason='Missed 3 days', severity='high')

    def test_a_stranger_cannot_link_themselves_to_a_child(self):
        self.client.force_authenticate(user=self.stranger)
        resp = self.client.post(self.LINKS, {
            'parent_profile': self.stranger_profile.id, 'student_profile': self.child_profile.id,
            'relationship_type': 'guardian', 'consent_status': 'approved',
        }, format='json')
        self.assertIn(resp.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_405_METHOD_NOT_ALLOWED))
        self.assertFalse(ParentStudentLink.objects.filter(parent_profile=self.stranger_profile).exists())

    def test_nobody_can_approve_or_change_a_link_through_the_api(self):
        pending = ParentStudentLink.objects.create(parent_profile=self.stranger_profile, student_profile=self.child_profile)
        self.client.force_authenticate(user=self.stranger)
        self.client.patch(f'{self.LINKS}{pending.id}/', {'consent_status': 'approved'}, format='json')
        pending.refresh_from_db()
        self.assertEqual(pending.consent_status, 'pending')

    def test_people_only_see_their_own_links_summaries_and_alerts(self):
        self.client.force_authenticate(user=self.stranger)
        for url in (self.LINKS, '/api/v1/parent-portal/weekly-summary/', '/api/v1/parent-portal/risk-alert/'):
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, status.HTTP_200_OK, url)
            results = resp.data.get('results', resp.data) if isinstance(resp.data, dict) else resp.data
            self.assertEqual(len(results), 0, url)

        self.client.force_authenticate(user=self.mum)
        for url in (self.LINKS, '/api/v1/parent-portal/weekly-summary/', '/api/v1/parent-portal/risk-alert/'):
            resp = self.client.get(url)
            results = resp.data.get('results', resp.data) if isinstance(resp.data, dict) else resp.data
            self.assertEqual(len(results), 1, url)
