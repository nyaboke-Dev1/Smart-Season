from django.contrib.auth.hashers import make_password
from django.db import migrations


def create_demo_users(apps, schema_editor):
    User = apps.get_model("auth", "User")
    UserProfile = apps.get_model("core", "UserProfile")

    admin_user, admin_created = User.objects.get_or_create(
        username="admin",
        defaults={
            "email": "admin@example.com",
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
            "password": make_password("admin123"),
        },
    )
    UserProfile.objects.update_or_create(
        user=admin_user,
        defaults={"role": "admin"},
    )

    agent_user, agent_created = User.objects.get_or_create(
        username="agent",
        defaults={
            "email": "agent@example.com",
            "is_staff": False,
            "is_superuser": False,
            "is_active": True,
            "password": make_password("securepass@123"),
        },
    )
    UserProfile.objects.update_or_create(
        user=agent_user,
        defaults={"role": "agent"},
    )


def remove_demo_users(apps, schema_editor):
    User = apps.get_model("auth", "User")
    User.objects.filter(username__in=["admin", "agent"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_alter_userprofile_role"),
    ]

    operations = [
        migrations.RunPython(create_demo_users, remove_demo_users),
    ]
