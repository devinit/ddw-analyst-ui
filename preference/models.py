from django.db import models
from core.models import BaseEntity

# Create your models here.
class Preference(BaseEntity):
    preferences = models.JSONField(blank=True, null=True, default=dict)

Preference(preferences={
    "queryBuilder": "advanced"
})
