from rest_framework import serializers
from core.models import Tag, Source, SourceColumnMap, UpdateHistory, Sector, Theme, OperationStep, Operation, Review
from django.contrib.auth.models import User


class TagSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Tag
        fields = ('pk', 'name', 'user', 'created_on', 'updated_on')


class OperationStepSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = OperationStep
        fields = ('pk', 'step_id', 'name', 'description', 'query', 'user', 'created_on', 'updated_on')


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Review
        fields = ('pk', 'rating', 'comment', 'user', 'created_on', 'updated_on')


class OperationSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    theme = serializers.ReadOnlyField(source='theme.name')
    tags = TagSerializer(many=True, read_only=True)
    operationstep_set = OperationStepSerializer(many=True)
    review_set = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Operation
        fields = ('pk', 'description', 'operation_query', 'theme', 'sample_output_path', 'tags', 'operationstep_set', 'review_set', 'is_draft', 'user', 'created_on', 'updated_on')


class ThemeSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    operation_set = OperationSerializer(many=True, read_only=True)

    class Meta:
        model = Theme
        fields = ('pk', 'sector', 'name', 'user', 'created_on', 'updated_on')


class SectorSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    theme_set = ThemeSerializer(many=True, read_only=True)

    class Meta:
        model = Sector
        fields = ('pk', 'name', 'description', 'theme_set', 'user', 'created_on', 'updated_on')


class UserSerializer(serializers.ModelSerializer):
    tag_set = TagSerializer(many=True, read_only=True)
    operation_set = OperationSerializer(many=True, read_only=True)
    review_set = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'tag_set', 'operation_set', 'review_set')


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
    tags = TagSerializer(many=True, read_only=True)

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
            'created_on',
            'updated_on',
            'sourcecolumnmap_set',
            'updatehistory_set',
            'tags'
        )
