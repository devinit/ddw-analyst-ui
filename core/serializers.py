from rest_framework import serializers
from core.models import Tag, Source, SourceColumnMap, UpdateHistory
from django.contrib.auth.models import User


class TagSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Tag
        fields = ('pk', 'name', 'user', 'created_on', 'updated_on')


class UserSerializer(serializers.ModelSerializer):
    tag_set = TagSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'tag_set')


class SourceColumnMapSerializer(serializers.ModelSerializer):
    source = serializers.ReadOnlyField(source='source.indicator')

    class Meta:
        model = SourceColumnMap
        fields = ('pk', 'source', 'name', 'description', 'source_name')


class UpdateHistorySerializer(serializers.ModelSerializer):
    source = serializers.ReadOnlyField(source='source.indicator')

    class Meta:
        model = UpdateHistory
        fields = (
            'source',
            'history_table',
            'is_major_release',
            'released_on',
            'release_description',
            'invalidated_on',
            'invalidation_description'
        )


class SourceSerializer(serializers.ModelSerializer):
    sourcecolumnmap_set = SourceColumnMapSerializer(many=True, read_only=True)
    updatehistory_set = UpdateHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Source
        fields = (
            'pk',
            'indicator',
            'indicator_acronym',
            'source',
            'source_acronym',
            'source_url',
            'download_path',
            'last_updated_on',
            'storage_type',
            'active_mirror_name',
            'description',
            'user',
            'created_on',
            'updated_on',
            'sourcecolumnmap_set',
            'updatehistory_set'
        )
