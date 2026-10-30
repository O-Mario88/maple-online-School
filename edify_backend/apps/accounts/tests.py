"""Regression tests for the Phase 1 student slice.

Journey: register -> JWT login -> browse content -> record engagement -> mark complete.
Every step here was verified end-to-end by hand on 2026-04-22; this file locks it in.
"""
from unittest.mock import patch
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.throttling import SimpleRateThrottle

from resources.content_models import ContentItem

User = get_user_model()


def _clear_throttle_cache():
    """DRF stores throttle buckets in the default cache, which persists across
    tests inside a single process. Call this in setUp to isolate tests."""
    cache.clear()


class StudentSliceTests(TestCase):
    """The minimum user journey that makes the platform worth shipping."""

    TOKEN_URL = '/api/v1/auth/token/'
    CONTENT_LIST_URL = '/api/v1/content/items/'
    TRACK_URL = '/api/v1/content/engagement/track/'
    ENGAGEMENT_URL = '/api/v1/content/engagement/'

    EMAIL = 'phase1.slice@edify.test'
    PASSWORD = 'Phase1TestPass!'

    def setUp(self):
        _clear_throttle_cache()
        self.client = APIClient()
        # A teacher so ContentItem.uploaded_by has something to point at.
        self.teacher = User.objects.create_user(
            email='slice.teacher@edify.test',
            full_name='Slice Teacher',
            country_code='UG',
            password='TeacherPass!',
            role='teacher',
        )
        self.item = ContentItem.objects.create(
            title='Phase 1 Slice Lesson',
            content_type='notes',
            uploaded_by=self.teacher,
            owner_type='teacher',
            publication_status='published',
            visibility_scope='global',
        )

    def _authed_client(self, access_token):
        c = APIClient()
        c.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        return c

    def test_full_student_journey(self):
        # 1) A fresh student (sign-up itself is served and tested by the Go API)
        User.objects.create_user(
            email=self.EMAIL,
            full_name='Slice Student',
            country_code='UG',
            password=self.PASSWORD,
            role='student',
        )

        # 2) Exchange creds for a JWT access token
        resp = self.client.post(
            self.TOKEN_URL,
            {'email': self.EMAIL, 'password': self.PASSWORD},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        access = resp.data.get('access')
        self.assertTrue(access, 'JWT access token missing from token response')

        authed = self._authed_client(access)

        # 3) Authenticated student can list content items
        resp = authed.get(self.CONTENT_LIST_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        results = resp.data.get('results', resp.data)
        self.assertTrue(
            any(r.get('id') == str(self.item.id) for r in results),
            'Seeded ContentItem not visible to authenticated student',
        )

        # 4) Record initial engagement (25% progress)
        resp = authed.post(
            self.TRACK_URL,
            {'content_item_id': str(self.item.id), 'completion_percentage': 25},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        self.assertEqual(resp.data['view_count'], 1)
        self.assertFalse(resp.data['is_completed'])
        self.assertEqual(resp.data['status'], 'in_progress')

        # 5) Mark complete
        resp = authed.post(
            self.TRACK_URL,
            {
                'content_item_id': str(self.item.id),
                'completion_percentage': 100,
                'is_completed': True,
            },
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        self.assertTrue(resp.data['is_completed'])
        self.assertEqual(resp.data['status'], 'completed')
        self.assertIsNotNone(resp.data['completed_at'])
        self.assertEqual(resp.data['view_count'], 2)

        # 6) Persistence: student can read back their own engagement
        resp = authed.get(self.ENGAGEMENT_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        results = resp.data.get('results', resp.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(str(results[0]['content_item']), str(self.item.id))
        self.assertTrue(results[0]['is_completed'])

    def test_unauthenticated_content_access_is_denied(self):
        """The auth gate must hold — anonymous requests get 401, not data."""
        resp = self.client.get(self.CONTENT_LIST_URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class PilotFeedbackTests(TestCase):
    """POST /api/v1/feedback/ — pilot user bug/feedback capture."""

    URL = '/api/v1/feedback/'

    def setUp(self):
        _clear_throttle_cache()
        self.student = User.objects.create_user(
            email='feedback.student@edify.test',
            full_name='Feedback Tester',
            country_code='UG',
            password='FeedbackPass!',
            role='student',
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.student)

    def test_anonymous_cannot_submit(self):
        resp = APIClient().post(self.URL, {'severity': 'bug', 'message': 'broken'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_post_records_feedback(self):
        from accounts.models import PilotFeedback
        resp = self.client.post(
            self.URL,
            {
                'severity': 'bug',
                'message': 'Dashboard spinner never stops on my phone.',
                'page_url': '/dashboard/student',
            },
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        row = PilotFeedback.objects.get()
        self.assertEqual(row.user, self.student)
        self.assertEqual(row.user_role, 'student')
        self.assertEqual(row.severity, 'bug')
        self.assertEqual(row.page_url, '/dashboard/student')
        self.assertIn('spinner', row.message)

    def test_empty_message_is_rejected(self):
        resp = self.client.post(
            self.URL,
            {'severity': 'bug', 'message': '   '},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
