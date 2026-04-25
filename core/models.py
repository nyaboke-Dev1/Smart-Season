from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    USER_ROLE_CHOICES = (
        ("admin", "Admin"),
        ("agent", "Field Agent"),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=10, choices=USER_ROLE_CHOICES, default="agent")

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class Field(models.Model):
    STAGE_CHOICES = (
        ("planted", "Planted"),
        ("growing", "Growing"),
        ("ready", "Ready"),
        ("harvested", "Harvested"),
    )

    name = models.CharField(max_length=100)
    crop_type = models.CharField(max_length=50)
    planting_date = models.DateField()
    current_stage = models.CharField(
        max_length=20, choices=STAGE_CHOICES, default="planted"
    )
    agent = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="fields"
    )

    def __str__(self):
        return self.name

    @property
    def status(self):
        # Status Logic:
        # - Completed: If stage is harvested
        # - At Risk: If stage is 'planted' and it's been more than 30 days (example logic)
        # - Active: Otherwise
        from datetime import date, timedelta

        if self.current_stage == "harvested":
            return "Completed"

        # Simple logic: if it's been planted for a long time but still in 'planted' stage
        if self.current_stage == "planted" and (
            date.today() - self.planting_date
        ) > timedelta(days=30):
            return "At Risk"

        return "Active"


class FieldUpdate(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name="updates")
    stage = models.CharField(max_length=20, choices=Field.STAGE_CHOICES)
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.field.name} - {self.stage} at {self.timestamp}"
