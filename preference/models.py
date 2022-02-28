from django.db import models
from core.models import BaseEntity

# Create your models here.
<<<<<<< HEAD
def default_value():
    return {"queryBuilder" : "advanced"}
class Preference(BaseEntity):
    preferences = models.JSONField(blank=True, null=True, default=default_value)
    global_choice = models.BooleanField(default=False)
=======
class Preference(BaseEntity):
    preferences = models.JSONField(blank=True, null=True, default=dict)
    global_query = models.BooleanField()

Preference(preferences={
    "queryBuilder": "advanced",
    "global_query": False
})
>>>>>>> 3d252142 (Added a preference App and Preference Model Class)
