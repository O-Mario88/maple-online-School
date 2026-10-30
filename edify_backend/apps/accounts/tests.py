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

    REGISTER_URL = '/api/v1/auth/register/'
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
        # 1) Register a fresh student
        resp = self.client.post(
            self.REGISTER_URL,
            {
                'email': self.EMAIL,
                'full_name': 'Slice Student',
                'country_code': 'UG',
                'password': self.PASSWORD,
                'role': 'student',
            },
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        self.assertTrue(User.objects.filter(email=self.EMAIL, role='student').exists())

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

    def test_registration_rejects_missing_role(self):
        """Profile hydration keys off role; missing role must fail loudly."""
        resp = self.client.post(
            self.REGISTER_URL,
            {
                'email': 'norole@edify.test',
                'full_name': 'No Role',
                'country_code': 'UG',
                'password': self.PASSWORD,
            },
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_nobody_can_sign_up_as_a_platform_administrator(self):
        """Admins are made by hand, never through the public sign-up form."""
        resp = self.client.post(
            self.REGISTER_URL,
            {
                'email': 'wannabe.admin@edify.test',
                'full_name': 'Wannabe Admin',
                'country_code': 'UG',
                'password': self.PASSWORD,
                'role': 'admin',
            },
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email='wannabe.admin@edify.test').exists())


class RegistrationThrottleTests(TestCase):
    """Verify the anon throttle on the registration scope actually trips at 429.

    Guards the AllowAny endpoints against bot-driven account spam. Uses a very
    tight rate override so the test is deterministic and fast.
    """

    REGISTER_URL = '/api/v1/auth/register/'

    def setUp(self):
        _clear_throttle_cache()

    def _payload(self, n):
        return {
            'email': f'throttle.{n}@edify.test',
            'full_name': f'Throttle {n}',
            'country_code': 'UG',
            'password': 'ThrottleTestPass!',
            'role': 'student',
        }

    def test_registration_throttle_returns_429_after_limit(self):
        """Patch the class-level THROTTLE_RATES so we can force a 429 quickly.

        (override_settings doesn't help here: SimpleRateThrottle caches
        THROTTLE_RATES at class body time, not per-request.)
        """
        tight = {'anon': '60/min', 'user': '600/min', 'registration': '2/hour'}
        with patch.object(SimpleRateThrottle, 'THROTTLE_RATES', tight):
            client = APIClient()

            r1 = client.post(self.REGISTER_URL, self._payload(1), format='json')
            self.assertEqual(r1.status_code, status.HTTP_201_CREATED, r1.content)

            r2 = client.post(self.REGISTER_URL, self._payload(2), format='json')
            self.assertEqual(r2.status_code, status.HTTP_201_CREATED, r2.content)

            r3 = client.post(self.REGISTER_URL, self._payload(3), format='json')
            self.assertEqual(r3.status_code, status.HTTP_429_TOO_MANY_REQUESTS, r3.content)
            self.assertFalse(User.objects.filter(email='throttle.3@edify.test').exists())


class EmailVerificationTests(TestCase):
    """Phase 4.2: gate login on email verification + consume activation tokens."""

    REGISTER_URL = '/api/v1/auth/register/'
    TOKEN_URL = '/api/v1/auth/token/'
    ACTIVATE_URL = '/api/v1/auth/activate/'

    EMAIL = 'verify.me@edify.test'
    PASSWORD = 'VerifyPass!'

    def setUp(self):
        _clear_throttle_cache()
        self.client = APIClient()

    def _register(self):
        return self.client.post(
            self.REGISTER_URL,
            {
                'email': self.EMAIL,
                'full_name': 'Verify Me',
                'country_code': 'UG',
                'password': self.PASSWORD,
                'role': 'student',
            },
            format='json',
        )

    def test_new_user_starts_unverified_and_receives_activation_email(self):
        from django.core import mail
        resp = self._register()
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email=self.EMAIL)
        self.assertFalse(user.email_verified)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Activate your', mail.outbox[0].subject)

    def test_activation_flips_email_verified(self):
        self._register()
        user = User.objects.get(email=self.EMAIL)
        self.assertFalse(user.email_verified)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        resp = self.client.post(self.ACTIVATE_URL, {'uid': uid, 'token': token}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)

        user.refresh_from_db()
        self.assertTrue(user.email_verified)
        self.assertIsNotNone(user.email_verified_at)

    def test_activation_rejects_invalid_token(self):
        self._register()
        user = User.objects.get(email=self.EMAIL)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        resp = self.client.post(
            self.ACTIVATE_URL, {'uid': uid, 'token': 'not-a-real-token'}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        user.refresh_from_db()
        self.assertFalse(user.email_verified)

    def test_login_works_when_flag_off_even_for_unverified(self):
        """Default settings: REQUIRE_EMAIL_VERIFICATION=False — login proceeds."""
        self._register()
        resp = self.client.post(
            self.TOKEN_URL, {'email': self.EMAIL, 'password': self.PASSWORD}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)

    @override_settings(REQUIRE_EMAIL_VERIFICATION=True)
    def test_login_blocked_when_flag_on_and_unverified(self):
        self._register()
        resp = self.client.post(
            self.TOKEN_URL, {'email': self.EMAIL, 'password': self.PASSWORD}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        # DRF AuthenticationFailed wraps the detail in a dict-or-string body
        payload = resp.data if isinstance(resp.data, dict) else {}
        self.assertIn('detail', payload)
        # The code we set should be reachable whether it's nested or flattened.
        flat = str(payload)
        self.assertIn('email_not_verified', flat)

    @override_settings(REQUIRE_EMAIL_VERIFICATION=True)
    def test_activate_then_login_works_with_flag_on(self):
        self._register()
        user = User.objects.get(email=self.EMAIL)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        self.client.post(self.ACTIVATE_URL, {'uid': uid, 'token': token}, format='json')

        resp = self.client.post(
            self.TOKEN_URL, {'email': self.EMAIL, 'password': self.PASSWORD}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        self.assertIn('access', resp.data)


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
