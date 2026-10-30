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

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'country_code', 'password', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
            'country_code': {'required': True},
            'role': {'required': True},
        }

    # Roles people may pick for themselves. Platform administrators are made
    # by hand (createsuperuser / Django admin), never through public sign-up.
    SELF_SERVICE_ROLES = ('student', 'teacher', 'institution')

    def validate_role(self, value):
        if value not in self.SELF_SERVICE_ROLES:
            raise serializers.ValidationError('Choose student, teacher or institution.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            country_code=validated_data['country_code'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        
        # Hydrate proper role profiles guaranteeing isolated dashboards
        if user.role == 'student':
            StudentProfile.objects.create(user=user)
        elif user.role == 'teacher':
            TeacherProfile.objects.create(user=user)
        elif user.role == 'institution':
            InstitutionAdminProfile.objects.create(user=user)
            
        return user


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

