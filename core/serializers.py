from rest_framework import serializers
from core.models import Tag
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    tag_set = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all())

    class Meta:
        model = User
        fields = ('id', 'username', 'tag_set')


class TagSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Tag
        fields = ('name', 'user', 'created_on', 'updated_on')
