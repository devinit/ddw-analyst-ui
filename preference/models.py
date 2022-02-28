from django.db import models
from core.models import BaseEntity

# Create your models here.
class Preference(BaseEntity):
    preferences = models.JSONField(blank=True, null=True, default=dict)
    global_query = models.BooleanField(default=False)

Preference(preferences={
    "queryBuilder": "advanced"
}
)
