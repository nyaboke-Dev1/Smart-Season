from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Field, FieldUpdate, UserProfile
from .serializers import FieldSerializer, FieldUpdateSerializer, UserSerializer

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'admin'

class FieldViewSet(viewsets.ModelViewSet):
    serializer_class = FieldSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return Field.objects.none()
        if user.profile.role == 'admin':
            return Field.objects.all()
        return Field.objects.filter(agent=user)

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_stage(self, request, pk=None):
        field = self.get_object()
        stage = request.data.get('stage')
        notes = request.data.get('notes', '')

        if stage not in dict(Field.STAGE_CHOICES):
            return Response({'error': 'Invalid stage'}, status=status.HTTP_400_BAD_REQUEST)

        field.current_stage = stage
        field.save()

        FieldUpdate.objects.create(field=field, stage=stage, notes=notes)
        return Response(FieldSerializer(field).data)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'me':
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def agents(self, request):
        agents = User.objects.filter(profile__role='agent')
        serializer = self.get_serializer(agents, many=True)
        return Response(serializer.data)
