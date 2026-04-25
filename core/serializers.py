from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Field, FieldUpdate

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')

class FieldUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldUpdate
        fields = '__all__'

class FieldSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    agent_name = serializers.CharField(source='agent.username', read_only=True)
    updates = FieldUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Field
        fields = ('id', 'name', 'crop_type', 'planting_date', 'current_stage', 'agent', 'agent_name', 'status', 'updates')
