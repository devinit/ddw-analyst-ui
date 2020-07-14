"""
    https://www.django-rest-framework.org/api-guide/serializers/
    Serializers allow complex data such as querysets and model instances to be converted to native
    Python datatypes that can then be easily rendered into JSON, XML or other content types.
    Serializers also provide deserialization, allowing parsed data to be converted back into complex
    types, after first validating the incoming data.
"""
from datetime import datetime
from dateutil.relativedelta import *
from django.utils import timezone
from django.utils.timezone import make_aware
from json.decoder import JSONDecodeError
from django.contrib.auth.models import Permission, User
from django.db.models import Q
from rest_framework import serializers
from rest_framework import pagination
from rest_framework.utils import model_meta
from core.const import DEFAULT_LIMIT_COUNT

from core.models import (
    Operation, OperationStep, Review,
    ScheduledEvent, ScheduledEventRunInstance, Sector,
    Source, SourceColumnMap, Tag,
    Theme, UpdateHistory
)


class DataSerializer(serializers.BaseSerializer):
    """
        Handle a request for operation data
    """
    def to_representation(self, instance):
        request = instance['request']
        limit = request.query_params.get('limit', None)
        offset = request.query_params.get('offset', None)
        if limit == 0:
            limit = DEFAULT_LIMIT_COUNT
        operation = instance['operation_instance']
        try:
            count, data = operation.query_table(limit, offset, estimate_count=True)
            return {
                'count': count,
                'data': data
            }
        except JSONDecodeError as json_error:
            return {
                'count': 0,
                'data': [
                    {
                        'error': str(json_error),
                        'error_type': 'JSONDecodeError'
                    }
                ]
            }


class TagSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Tag
        fields = ('pk', 'name', 'user', 'created_on', 'updated_on')


class OperationStepSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    source_name = serializers.ReadOnlyField(source='source.name')
    id = serializers.ReadOnlyField(source='pk')

    class Meta:
        model = OperationStep
        fields = (
            'id',
            'step_id',
            'name',
            'description',
            'query_func',
            'query_kwargs',
            'user',
            'source',
            'source_name',
            'created_on',
            'updated_on'
        )


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Review
        fields = ('pk', 'rating', 'comment', 'user', 'created_on', 'updated_on')


class OperationSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    theme_name = serializers.ReadOnlyField(source='theme.name')
    tags = TagSerializer(many=True, read_only=True)
    operation_steps = OperationStepSerializer(source='operationstep_set', many=True)
    reviews = ReviewSerializer(source='review_set', many=True, read_only=True)
    id = serializers.ReadOnlyField(source='pk')

    class Meta:
        model = Operation
        fields = (
            'id',
            'name',
            'description',
            'operation_query',
            'theme',
            'theme_name',
            'sample_output_path',
            'tags',
            'operation_steps',
            'reviews',
            'is_draft',
            'user',
            'created_on',
            'updated_on'
        )

    def create(self, validated_data):
        read_only_fields = ('user', 'theme_name', 'tags', 'operationstep_set', 'review_set')
        read_only_dict = dict()
        for field in read_only_fields:
            if field in validated_data:
                read_only_dict[field] = validated_data.pop(field)
        operation = Operation.objects.create(**validated_data)
        for step in read_only_dict['operationstep_set']:
            OperationStep.objects.create(operation=operation, **step)
        operation.user = read_only_dict['user']
        operation.operation_query = operation.build_query()
        operation.save()

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

        instance.operation_query = instance.build_query()
        instance.save()

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
    id = serializers.ReadOnlyField(source='pk')

    class Meta:
        model = SourceColumnMap
        fields = ('id', 'source', 'name', 'description', 'source_name', 'data_type')


class UpdateHistorySerializer(serializers.ModelSerializer):
    source = serializers.ReadOnlyField(source='source.indicator')

    class Meta:
        model = UpdateHistory
        fields = (
            'source',
            'history_table',
            'released_on',
            'release_description'
        )


class SourceSerializer(serializers.ModelSerializer):
    columns = SourceColumnMapSerializer(source='sourcecolumnmap_set', many=True, read_only=True)
    update_history = UpdateHistorySerializer(source='updatehistory_set', many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    id = serializers.ReadOnlyField(source='pk')

    class Meta:
        model = Source
        fields = (
            'id',
            'indicator',
            'indicator_acronym',
            'schema',
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
            'columns',
            'update_history',
            'tags'
        )


class ScheduledEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledEvent
        fields = (
            'id',
            'name',
            'description',
            'script_name',
            'enabled',
            'start_date',
            'repeat',
            'interval',
            'interval_type'
        )


class ScheduledEventRunInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledEventRunInstance
        fields = (
            'id',
            'scheduled_event',
            'start_at',
            'ended_at',
            'status'
        )

    def is_instance_running(self, scheduled_event):
        queryset = ScheduledEventRunInstance.objects.filter(
            (Q(scheduled_event=scheduled_event.id) & Q(status='r'))
        )
        if queryset.exists():
            return queryset.earliest('id')

    def is_due_to_run_in_5minutes(self, scheduled_event):
        time_threshold = timezone.now() + relativedelta(minutes=5)
        queryset = ScheduledEventRunInstance.objects.filter(
            (Q(scheduled_event=scheduled_event.id) & Q(start_at__lt=time_threshold) & Q(status='p'))
        )
        if queryset.exists():
            return queryset.earliest('id')

    def create(self, validated_data):
        scheduled_event = validated_data.get('scheduled_event')
        running_instance = self.is_instance_running(scheduled_event)
        if(running_instance):
            return running_instance
        due_instance = self.is_due_to_run_in_5minutes(scheduled_event)
        if(due_instance):
            return due_instance
        return ScheduledEventRunInstance.objects.create(**validated_data)
