from django.db import models
from core.models import BaseEntity

# Create your models here.
class Preference(BaseEntity):
    preferences = models.JSONField(blank=True, null=True, default={"queryBuilder" : "advanced"})
    global_choice = models.BooleanField(default=False)


