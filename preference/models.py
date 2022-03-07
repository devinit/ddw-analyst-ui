from django.db import models
from core.models import BaseEntity

# Create your models here.
def default_value():
    return {"queryBuilder" : "advanced"}
class Preference(BaseEntity):
    preferences = models.JSONField(blank=True, null=True, default=default_value)
    global_choice = models.BooleanField(default=False)


