from rest_framework import serializers
from .models import Preference

class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preference
        fields = ('preferences', 'global_choice', 'user')
