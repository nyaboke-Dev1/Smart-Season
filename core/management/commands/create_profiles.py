from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import UserProfile

class Command(BaseCommand):
    help = 'Create UserProfile for all users without one'

    def handle(self, *args, **options):
        for user in User.objects.all():
            role = 'admin' if user.is_superuser else 'agent'
            profile, created = UserProfile.objects.get_or_create(user=user, defaults={'role': role})
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created profile for {user.username} with role {role}'))
            else:
                self.stdout.write(f'Profile already exists for {user.username}')