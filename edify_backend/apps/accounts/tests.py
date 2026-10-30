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
