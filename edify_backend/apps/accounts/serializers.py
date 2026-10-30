from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StudentProfile, TeacherProfile, ParentProfile, InstitutionAdminProfile, PilotFeedback

User = get_user_model()


class PilotFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PilotFeedback
        fields = ['id', 'severity', 'message', 'page_url', 'user_agent', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_message(self, value):
        stripped = (value or '').strip()
        if not stripped:
            raise serializers.ValidationError('Message cannot be empty.')
        return stripped

class PublicProfileSerializer(serializers.Serializer):
    """Read-only serializer for public profile pages."""
    name = serializers.CharField()
    username = serializers.CharField()
    bio = serializers.CharField()
    location = serializers.CharField()
    avatar = serializers.CharField()
    joinedDate = serializers.CharField()
    badges = serializers.ListField(child=serializers.DictField())
    certificates = serializers.ListField(child=serializers.DictField())

