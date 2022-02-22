from django.contrib import admin
from .models import Preference

# Register your models here.
<<<<<<< HEAD
class PreferenceAdmin(admin.ModelAdmin):
    list_filter = ('user', 'global_choice')

admin.site.register(Preference, PreferenceAdmin)
=======
admin.site.register(Preference)
>>>>>>> 3d252142 (Added a preference App and Preference Model Class)
