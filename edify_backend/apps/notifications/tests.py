"""Notifications are private, and only Maple staff may send WhatsApp messages
through the platform's account."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from notifications.models import Notification

User = get_user_model()


def person(email, **extra):
    return User.objects.create_user(email=email, full_name=email.split('@')[0], country_code='UG', password='Pass!2026xyz', **extra)


class NotificationPrivacyTests(TestCase):
    URL = '/api/v1/notifications/notification/'

    def setUp(self):
        self.client = APIClient()
        self.alice = person('alice@school.test')
        self.bob = person('bob@school.test')
        Notification.objects.create(user=self.alice, channel='in_app', payload={'title': 'Your fees are due'})

    def test_people_only_see_their_own_notifications(self):
        self.client.force_authenticate(user=self.bob)
        resp = self.client.get(self.URL)
        results = resp.data.get('results', resp.data) if isinstance(resp.data, dict) else resp.data
        self.assertEqual(len(results), 0)

    def test_nobody_creates_notifications_for_someone_else(self):
        self.client.force_authenticate(user=self.bob)
        self.client.post(self.URL, {'user': self.alice.id, 'channel': 'in_app', 'payload': {'title': 'Phish'}}, format='json')
        self.assertEqual(Notification.objects.filter(user=self.alice).count(), 1)

    def test_only_maple_staff_send_whatsapp(self):
        self.client.force_authenticate(user=self.bob)
        for path in ('send-whatsapp/', 'send/'):
            resp = self.client.post(self.URL + path, {'to': '+256700000000', 'message': 'hi'}, format='json')
            self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN, path)
