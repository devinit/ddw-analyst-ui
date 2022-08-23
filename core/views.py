"""
    Django Rest Framework views for handling rest operations
"""
import codecs
import csv
import datetime
import json

import dateutil.parser
from django.conf import settings
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.models import User
from django.db import connections
from django.db.models import Q
from django.db.models.query import prefetch_related_objects
from django.http import Http404, HttpResponse, StreamingHttpResponse
from django.http.response import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from core import serializers

from knox.auth import TokenAuthentication
from knox.views import LoginView as KnoxLoginView

from rest_framework import exceptions, filters, generics, permissions, status
from rest_framework.authentication import BasicAuthentication
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.views import APIView

from core import query
from core.errors import CustomAPIException, handle_uncaught_error
from core.models import (FrozenData, Operation, OperationDataColumnAlias,
                         OperationStep, Review, SavedQueryData, ScheduledEvent, ETLQuery,
                         ScheduledEventRunInstance, Sector, Source, Tag, Theme, SourceColumnMap, SavedQueryData)
from core.pagination import DataPaginator
from core.permissions import IsOwnerOrReadOnly
from core.pypika_fts_utils import TableQueryBuilder
from core.pypika_utils import QueryBuilder
from core.serializers import (DataSerializer, FrozenDataSerializer,
                              OperationDataColumnAliasSerializer,
                              OperationSerializer, OperationStepSerializer,
                              ReviewSerializer, SavedQueryDataSerializer,
                              ScheduledEventRunInstanceSerializer,
                              ScheduledEventSerializer, SectorSerializer,
                              SourceSerializer, TagSerializer, ThemeSerializer,
                              UserSerializer)
from core.tasks import create_dataset_archive, create_table_archive
from data.db_manager import run_query, update_table_from_tuple
from data_updates.utils import ScriptExecutor, list_update_scripts
from query_builder.advanced import AdvancedQueryBuilder


class ListUpdateScripts(APIView):
    """
    Allow any user to list all update scripts
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get(self, request):
        try:
            content = {"update_scripts": list_update_scripts()}
            post_status = status.HTTP_200_OK
            return Response(content, status=post_status)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})


@csrf_exempt
def streaming_script_execute(request):
    try:
        form_data = json.loads(request.body.decode())

        posted_token = form_data.get('token')
        script_name = form_data.get('script_name')

        if posted_token is not None:
            token_auth = TokenAuthentication()
            user, _ = token_auth.authenticate_credentials(
                posted_token.encode("utf-8"))
            if user.is_authenticated and user.is_superuser:
                post_status = status.HTTP_200_OK
                executor = ScriptExecutor(script_name)
                stream = executor.stream()
                response_data = {}
                response_data['result'] = 'success'
                response_data['message'] = 'Script update success'

                for item in stream:
                    pass
                # Check if the last item in generator is an integer
                if item > 0 or item < 0:
                    post_status = status.HTTP_500_INTERNAL_SERVER_ERROR
                    response_data['result'] = 'error'
                    response_data['message'] = 'Failed to execute the script update'
                    response_data['returncode'] = item

                return HttpResponse(json.dumps(response_data), content_type='application/json', status=post_status)
        return redirect('/login/')
    except exceptions.AuthenticationFailed:
        return redirect('/login/')
    except Exception as e:
        handle_uncaught_error(e)
        response = {'detail': f'{str(e)}'}
        return HttpResponse(json.dumps(response), content_type='application/json', status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class Echo:
    """An object that implements just the write method of the file-like
    interface.
    """

    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


class StreamingExporter:
    """Sets up generator for streaming PSQL content"""

    def __init__(self, operation, frozen_table_id=None):
        if operation.advanced_config and not operation.is_raw: # We are dealing with advanced config here
            self.main_query = query.build_advanced_queries(operation.advanced_config)[1]
        elif operation.advanced_config and operation.is_raw:
            self.main_query = operation.operation_query
        else:
            self.main_query = query.build_query(operation=operation, frozen_table_id=frozen_table_id)[1]
        self.operation = operation

    def stream(self):
        with connections["datasets"].chunked_cursor() as main_cursor:
            main_cursor.execute(self.main_query)
            first_row = main_cursor.fetchone()
            header = self.get_header(main_cursor)
            pseudo_buffer = Echo()
            yield pseudo_buffer.write(codecs.BOM_UTF8)
            writer = csv.writer(pseudo_buffer, delimiter=",")
            yield writer.writerow(header)
            yield writer.writerow(first_row)
            next_row = main_cursor.fetchone()
            while next_row is not None:
                yield writer.writerow(next_row)
                next_row = main_cursor.fetchone()

    def get_header(self, cursor):
        header = [col[0] for col in cursor.description]
        if self.operation:
            aliases = OperationDataColumnAlias.objects.filter(
                operation=self.operation)
            header_aliases = []
            for column in header:
                alias = aliases.filter(column_name=column).first()
                header_aliases.append(alias.column_alias if alias else column)
            return header_aliases
        return header


@csrf_exempt
def streaming_export_view(request, pk):
    try:
        operation = Operation.objects.get(pk=pk)
        frozen_table_id = request.GET.get('frozen_table_id', None)
        exporter = StreamingExporter(operation, frozen_table_id=frozen_table_id)
        response = StreamingHttpResponse(
            exporter.stream(), content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="{}.csv"'.format(
            operation.name)
        return response
    except Operation.DoesNotExist:
        raise Http404
    except json.decoder.JSONDecodeError as json_error:
        return JsonResponse({
            'error': str(json_error),
            'error_type': 'JSONDecodeError'
        })
    except Exception as e:
        handle_uncaught_error(e)
        response = {'detail': f'{str(e)}'}
        return HttpResponse(json.dumps(response), content_type='application/json', status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ViewData(RetrieveAPIView):
    """
    List all data from executing the operation query.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    def get_object(self, pk):
        try:
            return Operation.objects.get(pk=pk)
        except Operation.DoesNotExist:
            raise Http404

    def retrieve(self, request, pk):
        try:
            operation = self.get_object(pk)
            operation.last_accessed = timezone.now()
            operation.save(update_fields=['last_accessed'])
            serializer = DataSerializer({
                "request": request,
                "operation_instance": operation
            })
            paginator = DataPaginator()
            paginator.set_count(serializer.data['count'])
            page_data = paginator.paginate_queryset(
                serializer.data['data'], request)
            response = paginator.get_paginated_response(page_data)
            return response
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})


class PreviewOperationData(APIView):
    """
    Preview data from executing the operation query.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    def get_data(self, request):
        try:
            limit=request.query_params.get('limit', 10)
            offset=request.query_params.get('offset', 0)
            if 'advanced_config' in request.data and request.data['advanced_config']:
                try:
                    data = data = self.process_advanced_config(data=request.data)
                    return {
                        'count': len(data),
                        'data': data
                    }
                except LookupError as e:
                    return {
                        'count': 0,
                        'data': [
                            {
                                'error': str(e),
                                'error_type': 'LookupError'
                            }
                        ]
                    }
            else:
                count, data = query.query_table(
                    operation_steps=request.data['operation_steps'],
                    limit=limit,
                    offset=offset,
                    estimate_count=True
                )
                return {
                    'count': count,
                    'data': data
                }
        except json.decoder.JSONDecodeError as json_error:
            return {
                'count': 0,
                'data': [
                    {
                        'error': str(json_error),
                        'error_type': 'JSONDecodeError'
                    }
                ]
            }

    def post(self, request):
        data = self.get_data(request)
        paginator = DataPaginator()
        paginator.set_count(data['count'])
        page_data = paginator.paginate_queryset(data['data'], request)
        return paginator.get_paginated_response(page_data)

    def process_advanced_config(self, data, limit = 10, offset = 0):
        config = data['advanced_config']
        is_raw = data['is_raw']
        if is_raw:
            return run_query(query.format_query_for_preview(data['operation_query'], limit=limit, offset=offset), fetch=True)

        return run_query(query.get_advanced_config_query(config, limit=limit, offset=offset), fetch=True)


class GetOperationQuery(APIView):
    """
    Return Operation Query for Review.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    def get_query(self, request):
        if 'config' in request.data and request.data['config']:
            return query.get_advanced_config_query(request.data['config'])
        elif 'operation_steps' in request.data:
            return QueryBuilder(operation_steps=request.data['operation_steps']).get_sql_without_limit()
        else:
            return ''

    def post(self, request):
        try:
            query = self.get_query(request)
            return JsonResponse({ 'query': query })
        except exceptions.ParseError as json_error:
            return JsonResponse({
                'error': str(json_error),
                'error_type': 'JSONDecodeError'
            })
        except Exception as e:
            handle_uncaught_error(e)
            response = {'detail': f'{str(e)}'}
            return HttpResponse(json.dumps(response), content_type='application/json', status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePassword(APIView):
    """
    A class to allow an authenticated user to change their password.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        """
        Expects old_password, new_password1, new_password2
        """
        try:
            form = PasswordChangeForm(request.user, request.data)
            if form.is_valid():
                user = form.save()
                update_session_auth_hash(request, user)
                content = {"messages": [
                    "Password successfully changed for user {}.".format(user.username)]}
                post_status = status.HTTP_202_ACCEPTED
            else:
                content = {"validation": form.errors.as_data()}
                post_status = status.HTTP_400_BAD_REQUEST
            return Response(content, status=post_status)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})


class SectorList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Sector.objects.all()
    serializer_class = SectorSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SectorDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Sector.objects.all()
    serializer_class = SectorSerializer


class ThemeList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Theme.objects.all()
    serializer_class = ThemeSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ThemeDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Theme.objects.all()
    serializer_class = ThemeSerializer


class OperationList(generics.ListCreateAPIView):
    """
    This view should return a list of the published operations, including those for the currently authenticated user.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Operation.objects.all()
    serializer_class = OperationSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name', 'description')

    def get_queryset(self):
        """
        Filters to return the operations that are not for the currently authenticated user.
        """
        return Operation.objects.filter(Q(is_draft=False)).order_by('-updated_on')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserOperationList(generics.ListAPIView):
    """
    This view should return a list of all the operations for the currently authenticated user.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Operation.objects.all()
    serializer_class = OperationSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name', 'description')

    def get_queryset(self):
        """
        Filters to return a list of all the operations for the currently authenticated user.
        """
        if self.request.user.is_authenticated:
            return Operation.objects.filter(user=self.request.user).order_by('-updated_on')
        else:
            return Operation.objects.all().order_by('-updated_on')


class OperationDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Operation.objects.all()
    serializer_class = OperationSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        instance.last_accessed = timezone.now()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class ViewSourceDatasets(APIView):
    """
    Get all published datasets attached to a specific data source, including those belonging to the current user
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)
    queryset = Operation.objects.all()
    serializer_class = OperationSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name', 'description')

    def get_queryset(self, pk, request):
        try:
            if self.request.user.is_authenticated:
                operations = Operation.objects.filter(
                    Q(operationstep__source=pk) & Q(is_draft=False)
                ).order_by('-updated_on').distinct()
            else:
                operations = Operation.objects.filter(
                    is_draft=False).order_by('-updated_on').distinct()
            search = request.query_params.get('search')
            if search:
                return operations.filter(Q(name__icontains=search) | Q(description__icontains=search)).order_by('-updated_on').distinct()
            return operations
        except Operation.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        try:
            datasets = self.get_queryset(pk, request)
            limit = self.request.query_params.get('limit', None)
            offset = self.request.query_params.get('offset', None)
            if limit is not None or offset is not None:
                pagination_class = api_settings.DEFAULT_PAGINATION_CLASS
                paginator = pagination_class()
                page = paginator.paginate_queryset(datasets, request)
                serializer = OperationSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            else:
                serializer = OperationSerializer(datasets, many=True)
                return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})


class ViewSourceHistory(APIView):
    """
    Get all FrozenData instances attached to a specific data source
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)
    # queryset = FrozenData.objects.all()
    serializer_class = FrozenDataSerializer

    def get_queryset(self, pk, request):
        try:
            source = Source.objects.get(id=pk)
            history = FrozenData.objects.filter(
                parent_db_table=source.active_mirror_name).order_by('-created_on').distinct()
            return history
        except Source.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        try:
            datasets = self.get_queryset(pk, request)
            limit = self.request.query_params.get('limit', None)
            offset = self.request.query_params.get('offset', None)
            if limit is not None or offset is not None:
                pagination_class = api_settings.DEFAULT_PAGINATION_CLASS
                paginator = pagination_class()
                page = paginator.paginate_queryset(datasets, request)
                serializer = FrozenDataSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            else:
                serializer = FrozenDataSerializer(datasets, many=True)
                return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})


class ViewUserSourceDatasets(APIView):
    """
    Get all datasets belonging to a specific data source and user
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self, pk, request):
        try:
            if self.request.user.is_authenticated:
                operations = Operation.objects.filter(
                    Q(user=self.request.user) & (Q(operationstep__source=pk) | Q(advanced_config__source=pk))
                ).order_by('-updated_on').distinct()
                search = request.query_params.get('search')
                if search:
                    return operations.filter(Q(name__icontains=search) | Q(description__icontains=search)).order_by('-updated_on').distinct()
                return operations
            return Operation.objects.filter(Q(operationstep__source=pk) | Q(advanced_config__source=pk)).order_by('-updated_on').distinct()
        except Operation.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        try:
            datasets = self.get_queryset(pk, request)
            limit = self.request.query_params.get('limit', None)
            offset = self.request.query_params.get('offset', None)
            if limit is not None or offset is not None:
                pagination_class = api_settings.DEFAULT_PAGINATION_CLASS
                paginator = pagination_class()
                page = paginator.paginate_queryset(datasets, request)
                serializer = OperationSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            else:
                serializer = OperationSerializer(datasets, many=True)
                return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})


class OperationColumnAlias(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    queryset = OperationDataColumnAlias.objects.all()
    serializer_class = OperationDataColumnAliasSerializer


class ReviewList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class OperationStepList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = OperationStep.objects.all()
    serializer_class = OperationStepSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OperationStepDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = OperationStep.objects.all()
    serializer_class = OperationStepSerializer


class UserList(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = User.objects.all()
    serializer_class = UserSerializer


class TagList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TagDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class SourceList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Source.objects.all()
    serializer_class = SourceSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ('indicator', 'indicator_acronym', 'source',
                     'source_acronym', 'schema', 'description')

    def get_queryset(self):
        frozen = self.request.query_params.get('frozen', None)
        qs = self.queryset
        if frozen and frozen == '1':
            qs = qs.filter(Q(schema__iexact='archives') | Q(schema__iexact='dataset'))
        elif frozen and frozen == '0':
            qs = qs.exclude(Q(schema__iexact='archives') | Q(schema__iexact='dataset'))
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SourceDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Source.objects.all()
    serializer_class = SourceSerializer


class LoginView(KnoxLoginView):
    authentication_classes = [BasicAuthentication]


class ScheduledEventList(APIView):
    """
    List all Scheduled Events, or create a new Scheduled Event.
    """

    def get(self, request, format=None):
        try:
            scheduled_events = ScheduledEvent.objects.all().order_by('-start_date')
            if request.query_params.get('limit', None) is not None or request.query_params.get('offset', None) is not None:
                pagination_class = api_settings.DEFAULT_PAGINATION_CLASS
                paginator = pagination_class()
                page = paginator.paginate_queryset(scheduled_events, request)
                serializer = ScheduledEventSerializer(page, many=True)

                return paginator.get_paginated_response(serializer.data)
            serializer = ScheduledEventSerializer(scheduled_events, many=True)
            return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})

    def post(self, request, format=None):
        try:
            serializer = ScheduledEventSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})


class ScheduledEventRunInstanceHistory(APIView):
    """
    Get all ScheduledEventRunInstances related to the provided schedule_event_id

    Create ScheduledEventRunInstances
    """

    def get_object(self, pk, request):
        try:
            status = request.query_params.get('status', None)
            if status:
                return ScheduledEventRunInstance.objects.filter(Q(scheduled_event=pk) & Q(status=status)).order_by('-start_at')
            else:
                return ScheduledEventRunInstance.objects.filter(scheduled_event=pk).order_by('-start_at')
        except ScheduledEventRunInstance.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        try:
            scheduled_event_run_instance = self.get_object(pk, request)
            if self.request.query_params.get('limit', None) is not None or self.request.query_params.get('offset', None) is not None:
                pagination_class = api_settings.DEFAULT_PAGINATION_CLASS
                paginator = pagination_class()
                page = paginator.paginate_queryset(
                    scheduled_event_run_instance, request)
                serializer = ScheduledEventRunInstanceSerializer(
                    page, many=True)

                return paginator.get_paginated_response(serializer.data)
            else:
                serializer = ScheduledEventRunInstanceSerializer(
                    scheduled_event_run_instance, many=True)
                return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})

    def get_post_response(self, serializer, request):
        error_message = ''
        serialized_date = dateutil.parser.parse(serializer.data['start_at'])
        post_date = dateutil.parser.parse(request.data['start_at'])
        if post_date == serialized_date:
            return {
                'success': 'Instance was created',
                'result': serializer.data
            }
        elif serializer.data['status'] == 'r':
            error_message = 'We cannot create a run instance at the moment because there is one running'
            return {
                'error': error_message,
                'result': serializer.data
            }
        elif serializer.data['status'] == 'p':
            error_message = 'We cannot create a run instance at the moment because there is one pending in the next 5 minutes'
            return {
                'error': error_message,
                'result': serializer.data
            }

    def post(self, request, pk, format=None):
        request.data['scheduled_event'] = pk
        serializer = ScheduledEventRunInstanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            return Response(self.get_post_response(serializer, request), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ScheduledEventRunInstanceDetail(APIView):
    """
    Get and update ScheduledEventRunInstances using the primary key
    """

    def get_object(self, pk):
        try:
            return ScheduledEventRunInstance.objects.get(pk=pk)
        except ScheduledEventRunInstance.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        try:
            scheduled_event_run_instance = self.get_object(pk)
            serializer = ScheduledEventRunInstanceSerializer(
                scheduled_event_run_instance)
            return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})

    def put(self, request, pk, format=None):
        scheduled_event_run_instance = self.get_object(pk)
        serializer = ScheduledEventRunInstanceSerializer(
            scheduled_event_run_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TableStreamingExporter():
    """Sets up generator for streaming PSQL content"""

    def __init__(self, main_query):
        self.main_query = main_query

    def get_header(self, cursor):
        header = [col[0] for col in cursor.description]

        return header

    def stream(self):
        with connections["datasets"].chunked_cursor() as main_cursor:
            main_cursor.execute(self.main_query)
            first_row = main_cursor.fetchone()
            header = [col[0] for col in main_cursor.description]
            pseudo_buffer = Echo()
            yield pseudo_buffer.write(codecs.BOM_UTF8)
            writer = csv.writer(pseudo_buffer, delimiter=",")
            yield writer.writerow(header)
            yield writer.writerow(first_row)
            next_row = main_cursor.fetchone()
            while next_row is not None:
                yield writer.writerow(next_row)
                next_row = main_cursor.fetchone()


@csrf_exempt
def streaming_tables_export_view(request, table_name, schema="repo"):
    data_table = True
    frozen_table = True
    try:
        FrozenData.objects.get(frozen_db_table=table_name)
        SavedQueryData.objects.get(saved_query_db_table=table_name)
    except FrozenData.DoesNotExist:
        frozen_table = False
    except SavedQueryData.DoesNotExist:
        data_table = False
    if table_name not in settings.QUERY_TABLES and not frozen_table and not data_table:
        return_result = [
            {
                "result": "error",
                "message": "Invalid table " + table_name,
            }
        ]
        return HttpResponse(json.dumps(return_result), content_type='application/json', status=status.HTTP_204_NO_CONTENT)

    try:
        table_query_builder = TableQueryBuilder(table_name, schema)
        exporter = TableStreamingExporter(
            table_query_builder.select().get_sql_without_limit())
        response = StreamingHttpResponse(
            exporter.stream(), content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="{}.csv"'.format(
            table_name)
        return response

    except Exception as e:
        handle_uncaught_error(e)
        response = {'detail': f'{str(e)}'}
        return HttpResponse(json.dumps(response), content_type='application/json', status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateTableAPI(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    def put(self, request, table_name):
        try:
            if table_name not in settings.QUERY_TABLES:
                return_result = [
                    {
                        "result": "error",
                        "message": "Invalid code list table",
                    }
                ]
                return HttpResponse(json.dumps(return_result), content_type='application/json', status=status.HTTP_400_BAD_REQUEST)
            data = request.data['data']
            params = tuple(data)

            table_query_builder = TableQueryBuilder(table_name, "repo")
            delete_query = table_query_builder.delete()
            insert_query = table_query_builder.insert(params)

            return_result = update_table_from_tuple([delete_query, insert_query])
            return_status_code = status.HTTP_500_INTERNAL_SERVER_ERROR if return_result[
                0]['result'] == 'error' else status.HTTP_200_OK

            return HttpResponse(json.dumps(return_result), content_type='application/json', status=return_status_code)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})


class FrozenDataList(APIView):
    """ List all FrozenData or create a new one"""

    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    def get(self, request, format=None):
        try:
            frozen_data = FrozenData.objects.all()
            serializer = FrozenDataSerializer(frozen_data, many=True)
            return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})

    def post(self, request, format=None):
        serializer = FrozenDataSerializer(data=request.data)
        if serializer.is_valid():
            parent_db_table = serializer.validated_data.get('parent_db_table')
            frozen_db_table = "archive_" + parent_db_table + \
                datetime.datetime.now().strftime('%Y%m%d%H%M%S')

            serializer.save(user=request.user, frozen_db_table=frozen_db_table)
            # Add this new table to the Sources, and it's columns to the SourceColumnMap
            source = Source.objects.get(active_mirror_name=parent_db_table)
            frozen_source = Source(indicator='Frozen '+source.indicator+' '+serializer.data['description']+' '+datetime.datetime.now().strftime('%Y%m%d'), indicator_acronym=source.indicator_acronym, source=source.source, schema='archives', storage_type=source.storage_type, active_mirror_name=frozen_db_table)
            frozen_source.save()
            column_maps = source.sourcecolumnmap_set.all()
            for column_map in column_maps:
                frozen_column_map = SourceColumnMap(data_type=column_map.data_type, source=frozen_source, name=column_map.name, description=column_map.description, alias=column_map.alias, source_name=column_map.source_name)
                frozen_column_map.save()
            create_table_archive.delay(serializer.instance.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FrozenDataDetail(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    def get_object(self, pk):
        try:
            return FrozenData.objects.get(pk=pk)
        except FrozenData.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        try:
            frozen_data = self.get_object(pk)
            serializer = FrozenDataSerializer(frozen_data)
            return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})

    def put(self, request, pk, format=None):
        frozen_data = self.get_object(pk)
        serializer = FrozenDataSerializer(frozen_data, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        delete_result = query.delete_archive(pk)
        if delete_result[0]['result'] == 'success':
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(delete_result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SavedQueryDataList(APIView):
    """ List all SavedQueryData or create a new one"""

    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    def get(self, request, format=None):
        try:
            saved_query_data = SavedQueryData.objects.all()
            serializer = SavedQueryDataSerializer(saved_query_data, many=True)
            return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})

    def post(self, request, format=None):
        serializer = SavedQueryDataSerializer(data=request.data)
        if serializer.is_valid():
            saved_query_db_table = "query_data_" + \
                datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            query_builder = TableQueryBuilder(
                saved_query_db_table, operation=serializer.validated_data["operation"])
            sql = query_builder.get_sql_without_limit()
            serializer.save(user=self.request.user, full_query=sql,
                            saved_query_db_table=saved_query_db_table)

            create_dataset_archive.delay(serializer.instance.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SavedQueryDataDetail(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    def get_object(self, pk):
        try:
            return SavedQueryData.objects.get(pk=pk)
        except SavedQueryData.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        try:
            saved_query_data = self.get_object(pk)
            serializer = SavedQueryDataSerializer(saved_query_data)
            return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})

    def put(self, request, pk, format=None):
        saved_query_data = self.get_object(pk)
        serializer = SavedQueryDataSerializer(
            saved_query_data, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        saved_query_data = self.get_object(pk)
        table_name = saved_query_data.saved_query_db_table
        saved_query_data.delete()
        query_builder = TableQueryBuilder(table_name, "dataset")
        delete_sql = query_builder.delete_table(table_name, "dataset")
        delete_result = run_query(delete_sql)
        if delete_result[0]['result'] == 'success':
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(delete_result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ViewDatasetHistory(APIView):
    """
    Get all SavedQueryData instances attached to a specific operation
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)
    serializer_class = SavedQueryDataSerializer

    def get_queryset(self, pk, request):
        try:
            operation = Operation.objects.get(id=pk)
            history = SavedQueryData.objects.filter(operation=operation).order_by('-created_on').distinct()
            return history
        except Operation.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        try:
            history = self.get_queryset(pk, request)
            limit = self.request.query_params.get('limit', None)
            offset = self.request.query_params.get('offset', None)
            if limit is not None or offset is not None:
                pagination_class = api_settings.DEFAULT_PAGINATION_CLASS
                paginator = pagination_class()
                page = paginator.paginate_queryset(history, request)
                serializer = SavedQueryDataSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            else:
                serializer = SavedQueryDataSerializer(history, many=True)
                return Response(serializer.data)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})


class EstimateQueryTime(APIView):
    """
    Estimate the operation query time.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    def get_queryset(self, pk):
        try:
            operation = Operation.objects.get(id=pk)
            return operation
        except Operation.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        try:
            operation = self.get_queryset(pk)
            estimate = query.querytime_estimate(operation=operation)
            return Response(estimate)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})


class ViewETLQueryData(APIView):
    """
    List all data from executing the operation query.
    """
    permission_classes = (permissions.AllowAny,)

    def get_object(self, id):
        try:
            return ETLQuery.objects.select_related().get(id=id)
        except ETLQuery.DoesNotExist:
            raise Http404

    def get(self, request, id):
        try:
            etl_query = self.get_object(id)
            count, data = query.get_all_frozen_dataset(etl_query.saved_dataset.saved_query_db_table, 'dataset')

            return Response({'count': count, 'data': data}, status=status.HTTP_200_OK)
        except Exception as e:
            handle_uncaught_error(e)
            raise CustomAPIException({'detail': str(e)})
