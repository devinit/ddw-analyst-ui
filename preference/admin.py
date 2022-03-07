from django.contrib import admin
from .models import Preference

# Register your models here.
class PreferenceAdmin(admin.ModelAdmin):
    list_filter = ('user', 'global_choice')

admin.site.register(Preference, PreferenceAdmin)
