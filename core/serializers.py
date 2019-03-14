from rest_framework import serializers
from rest_framework.utils import model_meta
from core.models import Tag, Source, SourceColumnMap, UpdateHistory, Sector, Theme, OperationStep, Operation, Review
from django.contrib.auth.models import Permission, User


class DataSerializer(serializers.BaseSerializer):
    def to_representation(self, obj):
        columns, data = obj.query_table()
        return {
            "count": len(data),
            "columns": columns,
            "data": data
        }


class TagSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Tag
        fields = ('pk', 'name', 'user', 'created_on', 'updated_on')


class OperationStepSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    source_name = serializers.ReadOnlyField(source='source.name')

    class Meta:
        model = OperationStep
        fields = ('pk', 'step_id', 'name', 'description', 'query_func', 'query_kwargs', 'user', 'source', 'source_name', 'created_on', 'updated_on')


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Review
        fields = ('pk', 'rating', 'comment', 'user', 'created_on', 'updated_on')


class OperationSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    theme_name = serializers.ReadOnlyField(source='theme.name')
    tags = TagSerializer(many=True, read_only=True)
    operationstep_set = OperationStepSerializer(many=True)
    review_set = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Operation
        fields = ('pk', 'name', 'description', 'operation_query', 'theme', 'theme_name', 'sample_output_path', 'tags', 'operationstep_set', 'review_set', 'is_draft', 'user', 'created_on', 'updated_on')

    def create(self, validated_data):
        read_only_fields = ('user', 'theme_name', 'tags', 'operationstep_set', 'review_set')
        read_only_dict = dict()
        for field in read_only_fields:
            if field in validated_data:
                read_only_dict[field] = validated_data.pop(field)
        operation = Operation.objects.create(**validated_data)
        for step in read_only_dict['operationstep_set']:
            OperationStep.objects.create(operation=operation, **step)
        return operation

    def update(self, instance, validated_data):
        info = model_meta.get_field_info(instance)
        updated_steps = validated_data.pop('operationstep_set')
        for attr, value in validated_data.items():
            if attr in info.relations and info.relations[attr].to_many:
                field = getattr(instance, attr)
                field.set(value)
            else:
                setattr(instance, attr, value)
        instance.save()

        existing_steps = instance.operationstep_set.all()
        existing_step_ids = [step.step_id for step in existing_steps]
        for updated_step in updated_steps:
            updated_step_id = updated_step.get("step_id")
            if updated_step_id in existing_step_ids:
                existing_step_ids.remove(updated_step_id)
            updated_step_instance, _ = OperationStep.objects.get_or_create(operation=instance, step_id=updated_step_id)
            step_info = model_meta.get_field_info(updated_step_instance)
            for attr, value in updated_step.items():
                if attr in step_info.relations and step_info.relations[attr].to_many:
                    field = getattr(updated_step_instance, attr)
                    field.set(value)
                else:
                    setattr(updated_step_instance, attr, value)
            updated_step_instance.save()

        for step_for_delete_id in existing_step_ids:
            step_for_delete = OperationStep.objects.get(operation=instance, step_id=step_for_delete_id)
            step_for_delete.delete()

        return instance


class ThemeSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    operation_set = OperationSerializer(many=True, read_only=True)

    class Meta:
        model = Theme
        fields = ('pk', 'sector', 'name', 'user', 'operation_set', 'created_on', 'updated_on')


class SectorSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    theme_set = ThemeSerializer(many=True, read_only=True)

    class Meta:
        model = Sector
        fields = ('pk', 'name', 'description', 'theme_set', 'user', 'created_on', 'updated_on')


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('name', 'codename')


class UserSerializer(serializers.ModelSerializer):
    tag_set = TagSerializer(many=True, read_only=True)
    operation_set = OperationSerializer(many=True, read_only=True)
    review_set = ReviewSerializer(many=True, read_only=True)
    user_permissions = PermissionSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'tag_set', 'operation_set', 'review_set', 'is_superuser', 'user_permissions')


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
    columns = sourcecolumnmap_set
    update_history = updatehistory_set

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
            'updatehistory_set',
            'tags'
            # alias fields
            'columns',
            'update_history'
        )
