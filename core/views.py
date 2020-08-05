"""
    Django Rest Framework views for handling rest operations
"""
import codecs
import csv
import json

import dateutil.parser
from django.conf import settings
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.models import User
from django.db import connections
from django.db.models import Q
from django.http import Http404, HttpResponse, StreamingHttpResponse
from django.http.response import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from knox.auth import TokenAuthentication
from knox.views import LoginView as KnoxLoginView
from rest_framework import exceptions, filters, generics, permissions, status
from rest_framework.authentication import BasicAuthentication
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.views import APIView

from core import query
from core.models import (Operation, OperationStep, Review, ScheduledEvent,
                        ScheduledEventRunInstance, Sector, Source, Tag, Theme)
from core.pagination import DataPaginator
from core.permissions import IsOwnerOrReadOnly
from core.pypika_fts_utils import TableQueryBuilder
from core.serializers import (DataSerializer, OperationSerializer,
                            OperationStepSerializer, ReviewSerializer,
                            ScheduledEventRunInstanceSerializer,
                            ScheduledEventSerializer, SectorSerializer,
                            SourceSerializer, TagSerializer, ThemeSerializer,
                            UserSerializer)
from data.db_manager import fetch_data, update_table_from_tuple
from data_updates.utils import ScriptExecutor, list_update_scripts


class ListUpdateScripts(APIView):
    """
    Allow any user to list all update scripts
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get(self, request):
        content = {"update_scripts": list_update_scripts()}
        post_status = status.HTTP_200_OK
        return Response(content, status=post_status)


@csrf_exempt
def streaming_script_execute(request):
    form_data = json.loads(request.body.decode())

    posted_token = form_data.get('token')
    script_name = form_data.get('script_name')

    if posted_token is not None:
        token_auth = TokenAuthentication()
        try:
            user, _ = token_auth.authenticate_credentials(posted_token.encode("utf-8"))
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
        except exceptions.AuthenticationFailed:
            return redirect('/login/')
    return redirect('/login/')


class Echo:
    """An object that implements just the write method of the file-like
    interface.
    """
    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


class StreamingExporter:
    """Sets up generator for streaming PSQL content"""
    def __init__(self, operation):
        self.main_query = query.build_query(operation=operation)[1]

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
def streaming_export_view(request, pk):
    try:
        operation = Operation.objects.get(pk=pk)
        exporter = StreamingExporter(operation)
        response = StreamingHttpResponse(exporter.stream(), content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="{}.csv"'.format(operation.name)
        return response
    except Operation.DoesNotExist:
        raise Http404
    except json.decoder.JSONDecodeError as json_error:
        JsonResponse({
            'error': str(json_error),
            'error_type': 'JSONDecodeError'
        })


class ViewData(APIView):
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

    def get(self, request, pk):
        operation = self.get_object(pk)
        serializer = DataSerializer({
            "request": request,
            "operation_instance": operation
        })
        paginator = DataPaginator()
        paginator.set_count(serializer.data['count'])
        page_data = paginator.paginate_queryset(serializer.data['data'], request)
        return paginator.get_paginated_response(page_data)


class PreviewOperationData(APIView):
    """
    Preview data from executing the operation query.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    def get_object(self, request):
        try:
            count, data = query.query_table(
                op_steps=request.data['operation_steps'],
                limit=request.query_params.get('limit', 10),
                offset=request.query_params.get('offset', 0),
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
        data = self.get_object(request)
        paginator = DataPaginator()
        paginator.set_count(data['count'])
        page_data = paginator.paginate_queryset(data['data'], request)
        return paginator.get_paginated_response(page_data)


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
        form = PasswordChangeForm(request.user, request.data)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            content = {"messages": ["Password successfully changed for user {}.".format(user.username)]}
            post_status = status.HTTP_202_ACCEPTED
        else:
            content = {"validation": form.errors.as_data()}
            post_status = status.HTTP_400_BAD_REQUEST
        return Response(content, status=post_status)


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
    This view should return a list of all the operations that are not for the currently authenticated user.
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
        if self.request.user.is_authenticated:
            return Operation.objects.filter(~Q(user=self.request.user) & Q(is_draft=False)).order_by('-updated_on')
        else:
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
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Operation.objects.all()
    serializer_class = OperationSerializer


class ReviewList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class OperationStepList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = OperationStep.objects.all()
    serializer_class = OperationStepSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OperationStepDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = OperationStep.objects.all()
    serializer_class = OperationStepSerializer


class UserList(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

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
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Source.objects.all()
    serializer_class = SourceSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ('indicator', 'indicator_acronym', 'source', 'source_acronym', 'schema', 'description')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SourceDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticatedOrReadOnly & IsOwnerOrReadOnly,)

    queryset = Source.objects.all()
    serializer_class = SourceSerializer


class LoginView(KnoxLoginView):
    authentication_classes = [BasicAuthentication]


class ScheduledEventList(APIView):
    """
    List all Scheduled Events, or create a new Scheduled Event.
    """
    def get(self, request, format=None):
        scheduled_events = ScheduledEvent.objects.all().order_by('-start_date')
        if request.query_params.get('limit', None) is not None or request.query_params.get('offset', None) is not None:
            pagination_class = api_settings.DEFAULT_PAGINATION_CLASS
            paginator = pagination_class()
            page = paginator.paginate_queryset(scheduled_events, request)
            serializer = ScheduledEventSerializer(page, many=True)

            return paginator.get_paginated_response(serializer.data)
        serializer = ScheduledEventSerializer(scheduled_events, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = ScheduledEventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ScheduledEventRunInstanceHistory(APIView):
    """
    Get all ScheduledEventRunInstances related to the provided schedule_event_id

    Create ScheduledEventRunInstances
    """
    def get_object(self, pk, request):
        try:
            status = request.query_params.get('status', None)
            if status:
                return ScheduledEventRunInstance.objects.filter(Q(scheduled_event=pk) & Q(status = status)).order_by('-start_at')
            else:
                return ScheduledEventRunInstance.objects.filter(scheduled_event=pk).order_by('-start_at')
        except ScheduledEventRunInstance.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        scheduled_event_run_instance = self.get_object(pk, request)
        if self.request.query_params.get('limit', None) is not None or self.request.query_params.get('offset', None) is not None:
            pagination_class = api_settings.DEFAULT_PAGINATION_CLASS
            paginator = pagination_class()
            page = paginator.paginate_queryset(scheduled_event_run_instance, request)
            serializer = ScheduledEventRunInstanceSerializer(page, many=True)

            return paginator.get_paginated_response(serializer.data)
        else:
            serializer = ScheduledEventRunInstanceSerializer(scheduled_event_run_instance, many=True)
            return Response(serializer.data)

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
        scheduled_event_run_instance = self.get_object(pk)
        serializer = ScheduledEventRunInstanceSerializer(scheduled_event_run_instance)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        scheduled_event_run_instance = self.get_object(pk)
        serializer = ScheduledEventRunInstanceSerializer(scheduled_event_run_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TableStreamingExporter(StreamingExporter):
    """Sets up generator for streaming PSQL content"""
    def __init__(self, main_query):
        self.main_query = main_query


@csrf_exempt
def streaming_tables_export_view(request, table_name):

    if table_name not in settings.QUERY_TABLES:
        return_result = [
            {
                "result": "error",
                "message": "Invalid code list table " + table_name,
            }
        ]
        return HttpResponse(json.dumps(return_result), content_type='application/json', status=status.HTTP_204_NO_CONTENT)

    table_query_builder = TableQueryBuilder(table_name, "repo")
    exporter = TableStreamingExporter(table_query_builder.select().get_sql_without_limit())
    response = StreamingHttpResponse(exporter.stream(), content_type="text/csv")
    response['Content-Disposition'] = 'attachment; filename="{}.csv"'.format(table_name)
    return response


class UpdateTableAPI(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    def put(self, request, table_name):

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
        return_status_code = status.HTTP_500_INTERNAL_SERVER_ERROR if return_result[0]['result'] == 'error' else status.HTTP_200_OK

        return HttpResponse(json.dumps(return_result), content_type='application/json', status=return_status_code)
