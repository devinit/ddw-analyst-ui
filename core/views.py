"""
    Django Rest Framework views for handling rest operations
"""
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import Http404
from knox.auth import TokenAuthentication
from knox.views import LoginView as KnoxLoginView
from rest_framework import exceptions, generics, permissions
from rest_framework.authentication import BasicAuthentication
from rest_framework.views import APIView

from core.models import (Operation, OperationStep, Review, Sector, Source, Tag, Theme)
from core.permissions import IsOwnerOrReadOnly
from core.serializers import (
    DataSerializer, OperationSerializer, OperationStepSerializer, ReviewSerializer,
    SectorSerializer, SourceSerializer, TagSerializer, ThemeSerializer, UserSerializer)
from core.pagination import DataPaginator

from django.http import StreamingHttpResponse
from django.db import connections
import csv
import codecs
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt


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
        self.main_query = operation.build_query()[1]

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
    posted_token = request.POST.get("token", None)
    if posted_token is not None:
        token_auth = TokenAuthentication()
        try:
            user, token = token_auth.authenticate_credentials(posted_token.encode("utf-8"))
            if user.is_authenticated:
                operation = Operation.objects.get(pk=pk)
                exporter = StreamingExporter(operation)
                response = StreamingHttpResponse(exporter.stream(), content_type="text/csv")
                response['Content-Disposition'] = 'attachment; filename="{}.csv"'.format(operation.name)
                return response
        except exceptions.AuthenticationFailed:
            return redirect('/login/')
    return redirect('/login/')


class ViewData(APIView):
    """
    List all data from executing the operation query.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

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


class SectorList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Sector.objects.all()
    serializer_class = SectorSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SectorDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Sector.objects.all()
    serializer_class = SectorSerializer


class ThemeList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Theme.objects.all()
    serializer_class = ThemeSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ThemeDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Theme.objects.all()
    serializer_class = ThemeSerializer


class OperationList(generics.ListCreateAPIView):
    """
    This view should return a list of all the operations that are not for the currently authenticated user.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Operation.objects.all()
    serializer_class = OperationSerializer

    def get_queryset(self):
        """
        Filters to return the operations that are not for the currently authenticated user.
        """
        return Operation.objects.filter(~Q(user=self.request.user))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserOperationList(generics.ListAPIView):
    """
    This view should return a list of all the operations for the currently authenticated user.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Operation.objects.all()
    serializer_class = OperationSerializer

    def get_queryset(self):
        """
        Filters to return a list of all the operations for the currently authenticated user.
        """
        return Operation.objects.filter(user=self.request.user)


class OperationDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Operation.objects.all()
    serializer_class = OperationSerializer


class ReviewList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class OperationStepList(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = OperationStep.objects.all()
    serializer_class = OperationStepSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OperationStepDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = OperationStep.objects.all()
    serializer_class = OperationStepSerializer


class UserList(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

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
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Source.objects.all()
    serializer_class = SourceSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SourceDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Source.objects.all()
    serializer_class = SourceSerializer


class LoginView(KnoxLoginView):
    authentication_classes = [BasicAuthentication]
