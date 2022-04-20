"""
    https://www.django-rest-framework.org/api-guide/serializers/
    Serializers allow complex data such as querysets and model instances to be converted to native
    Python datatypes that can then be easily rendered into JSON, XML or other content types.
    Serializers also provide deserialization, allowing parsed data to be converted back into complex
    types, after first validating the incoming data.
"""
from json.decoder import JSONDecodeError

from dateutil.relativedelta import *
from django.contrib.auth.models import Permission, User
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers
from rest_framework.utils import model_meta

from data.db_manager import run_query
from core import query
from core.const import DEFAULT_LIMIT_COUNT
from core.errors import (AliasCreationError, AliasUpdateError,
                         CustomAPIException, handle_uncaught_error)
from core.models import (FrozenData, Operation, OperationDataColumnAlias,
                         OperationStep, Review, SavedQueryData, ScheduledEvent,
                         ScheduledEventRunInstance, Sector, Source,
                         SourceColumnMap, Tag, Theme, UpdateHistory)


class DataSerializer(serializers.BaseSerializer):
    """
        Handle a request for operation data
    """
    operation = None

    def to_representation(self, instance):
        request = instance['request']
        limit = request.query_params.get('limit', None)
        offset = request.query_params.get('offset', None)
        use_aliases = request.query_params.get('aliases', 0)
        frozen_table_id = request.query_params.get('frozen_table_id', None)
        if limit == 0:
            limit = DEFAULT_LIMIT_COUNT
        operation = instance['operation_instance']
        self.set_operation(operation)
        try:
            if operation.advanced_config and len(operation.advanced_config) > 0:
                if operation.is_raw:
                    count, data = (0, run_query(operation.operation_query, fetch=True))
                else:
                    count, data = query.advanced_query_table(operation.advanced_config, limit, offset, estimate_count=True)
            else:
                count, data = query.query_table(operation, limit, offset, estimate_count=True, frozen_table_id=frozen_table_id)
            return {
                'count': count,
                'data': self.use_aliases(data) if use_aliases == '1' else data
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

    def set_operation(self, operation):
        self.operation = operation

    def get_operation(self):
        return self.operation

    def use_aliases(self, data):
        """
        Return data with column name aliases instead of database names
        """
        try:
            data_column_keys = data[0].keys()
            aliases = OperationDataColumnAlias.objects.filter(operation=self.operation)
            column_names = [column.column_name for column in aliases]
            aliased_data = []
            for row in data:
                aliased_row = {}
                for column in data_column_keys:
                    if not column in column_names:
                        aliased_row[column] = row[column]
                    else:
                        alias = aliases.filter(column_name=column).first()
                        if alias:
                            aliased_row[alias.column_alias] = row[column]
                        else:
                            aliased_row[column] = row[column]

                aliased_data.append(aliased_row)

            return aliased_data
        except:
            return data


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
            'updated_on',
            'logs',
        )


class OperationDataColumnAliasSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='pk')

    class Meta:
        model = OperationDataColumnAlias
        fields = (
            'id',
            'column_name',
            'column_alias',
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
    operation_steps = OperationStepSerializer(source='operationstep_set', many=True, allow_null=True, required=False)
    reviews = ReviewSerializer(source='review_set', many=True, read_only=True)
    id = serializers.ReadOnlyField(source='pk')
    aliases = OperationDataColumnAliasSerializer(
        source='operationdatacolumnalias_set', many=True, read_only=True)

    class Meta:
        model = Operation
        fields = (
            'id',
            'name',
            'description',
            'operation_query',
            'row_count',
            'theme',
            'theme_name',
            'sample_output_path',
            'tags',
            'operation_steps',
            'reviews',
            'is_draft',
            'is_raw',
            'user',
            'created_on',
            'updated_on',
            'aliases',
            'alias_creation_status',
            'logs',
            'advanced_config',
        )

    def create(self, validated_data):
        try:
            read_only_fields = ('user', 'theme_name', 'tags', 'operationstep_set', 'review_set')
            read_only_dict = dict()
            for field in read_only_fields:
                if field in validated_data:
                    read_only_dict[field] = validated_data.pop(field)
            operation = Operation.objects.create(**validated_data)
            operation.user = read_only_dict['user']
            if operation.advanced_config and len(operation.advanced_config) > 0:
                if not operation.is_raw:
                    operation.operation_query = query.get_advanced_config_query(operation.advanced_config)
            else:
                for step in read_only_dict['operationstep_set']:
                    OperationStep.objects.create(operation=operation, **step)
                operation.operation_query = query.build_query(operation=operation)
            operation.count_rows = True
            if not 'is_draft' in validated_data:
                operation.is_draft = False
            operation.save()
            self.create_operation_data_aliases(operation)
            return operation
        except AliasCreationError:
            raise AliasCreationError({'error_code': operation.alias_creation_status})
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})

    def update(self, instance, validated_data):
        try:
            info = model_meta.get_field_info(instance)

            advanced_config = validated_data.get('advanced_config', None)
            if advanced_config and len(advanced_config) > 0:
                instance.name = validated_data.get('name')
                instance.description = validated_data.get('description')
                instance.is_draft = validated_data.get('is_draft')
                instance.advanced_config = advanced_config
                if not instance.is_raw:
                    instance.operation_query = query.get_advanced_config_query(advanced_config)
                else:
                    instance.operation_query = validated_data.get('operation_query')
                instance.save()
            else:
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

                instance.operation_query = query.build_query(operation=instance)
            instance.count_rows = True
            instance.save()
            self.update_operation_data_aliases(instance)
            return instance
        except AliasUpdateError:
            raise AliasUpdateError({'error_code': instance.alias_creation_status})
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})

    def create_operation_data_aliases(self, operation):
        if operation.advanced_config and len(operation.advanced_config) > 0:
            if operation.is_raw:
                data = run_query(query.format_query_for_preview(operation.operation_query, 1, 0), fetch=True)
            else:
                count, data = query.advanced_query_table(operation.advanced_config, 1, 0, estimate_count=True)
        else:
            count, data = query.query_table(operation, 1, 0, estimate_count=True)
        operation.alias_creation_status = 'p'
        operation.save()
        if data:
            try:
                data_column_keys = data.keys() if isinstance(data, dict) else data[0].keys()
                if operation.advanced_config:
                    columns = SourceColumnMap.objects.filter(source_id=operation.advanced_config.get('source'), name__in=data_column_keys)
                else:
                    first_step = operation.get_operation_steps()[0]
                    columns = SourceColumnMap.objects.filter(source=first_step.source, name__in=data_column_keys)
                for column in data_column_keys:
                    matching = columns.filter(name=column).first()
                    alias = self.create_operation_alias(operation, column, matching.alias if matching else column)
                    alias.save()
                    operation.alias_creation_status = 'd'
                    operation.save()
            except:
                operation.alias_creation_status = 'e'
                operation.save()
                raise AliasCreationError()
        else:
            operation.alias_creation_status = 'd'
            operation.save()

    def update_operation_data_aliases(self, operation):
        if operation.advanced_config and len(operation.advanced_config) > 0:
            if operation.is_raw:
                data = run_query(query.format_query_for_preview(operation.operation_query, 1, 0), fetch=True)
            else:
                count, data = query.advanced_query_table(operation.advanced_config, 1, 0, estimate_count=True)
        else:
            count, data = query.query_table(operation, 1, 0, estimate_count=True)
        operation.alias_creation_status = 'p'
        operation.save()
        if data:
            try:
                data_column_keys = data.keys() if isinstance(data, dict) else data[0].keys()
                if operation.advanced_config:
                    columns = SourceColumnMap.objects.filter(source_id=operation.advanced_config.get('source'), name__in=data_column_keys)
                else:
                    first_step = operation.get_operation_steps()[0]
                    columns = SourceColumnMap.objects.filter(source=first_step.source, name__in=data_column_keys)
                # delete obsolete aliases
                OperationDataColumnAlias.objects.filter(operation=operation).exclude(column_name__in=data_column_keys).delete()
                for column in data_column_keys:
                    existing_alias = OperationDataColumnAlias.objects.filter(operation=operation, column_name=column).first()
                    if not existing_alias:
                        matching = columns.filter(name=column).first()
                        alias = self.create_operation_alias(operation, column, matching.alias if matching else column)
                        alias.save()

                operation.alias_creation_status = 'd'
                operation.save()
            except:
                operation.alias_creation_status = 'e'
                operation.save()
                raise AliasUpdateError()
        else:
            operation.alias_creation_status = 'd'
            operation.save()

    def create_operation_alias(self, operation, column_name, column_alias):
        if not column_alias:
            name_array = column_name.split('_')
            capitalized_name_array = []
            for word in name_array:
                capitalized_word = word.capitalize()
                capitalized_name_array.append(capitalized_word)
            column_alias = ' '.join(capitalized_name_array)

        return OperationDataColumnAlias.objects.create(
            operation=operation, column_name=column_name, column_alias=column_alias)


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
        fields = ('id', 'source', 'name', 'alias', 'description', 'source_name', 'data_type')


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
            'tags',
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
            'status',
            'logs'
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
            (Q(scheduled_event=scheduled_event.id) & Q(
                start_at__lt=time_threshold) & Q(status='p'))
        )
        if queryset.exists():
            return queryset.earliest('id')

    def create(self, validated_data):
        scheduled_event = validated_data.get('scheduled_event')
        running_instance = self.is_instance_running(scheduled_event)
        if running_instance:
            return running_instance
        due_instance = self.is_due_to_run_in_5minutes(scheduled_event)
        if due_instance:
            return due_instance
        return ScheduledEventRunInstance.objects.create(**validated_data)


class FrozenDataSerializer(serializers.ModelSerializer):
    frozen_db_table = serializers.ReadOnlyField()
    user = serializers.ReadOnlyField(source='user.username')
    created_on = serializers.ReadOnlyField()

    class Meta:
        model = FrozenData
        fields = (
            'id',
            'parent_db_table',
            'frozen_db_table',
            'status',
            'active',
            'description',
            'user',
            'created_on',
            'logs',
            'deletion_date',
        )


class SavedQueryDataSerializer(serializers.ModelSerializer):
    full_query = serializers.ReadOnlyField()
    saved_query_db_table = serializers.ReadOnlyField()
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = SavedQueryData
        fields = (
            'id',
            'active',
            'operation',
            'full_query',
            'saved_query_db_table',
            'status',
            'description',
            'user',
            'created_on',
            'logs',
        )
