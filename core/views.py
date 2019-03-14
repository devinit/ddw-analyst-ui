from knox.views import LoginView as KnoxLoginView
from knox.auth import TokenAuthentication
from rest_framework.authentication import BasicAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import Tag, OperationStep, Review, Operation, Theme, Sector, Source
from core.serializers import TagSerializer, OperationStepSerializer, ReviewSerializer, OperationSerializer, ThemeSerializer, SectorSerializer, UserSerializer, SourceSerializer, DataSerializer
from rest_framework import generics, permissions
from django.contrib.auth.models import User
from core.permissions import IsOwnerOrReadOnly
from core.const import default_limit_count


class ViewData(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    def get(self, request, pk):
        try:
            limit = int(request.GET.get('limit', default_limit_count))
            page = int(request.GET.get('page', 1))
            full = request.GET.get('full', "false") == "true"
        except ValueError:  # Someone typed garbage into the url
            limit = default_limit_count
            page = 1
            full = False
        if page <= 0:
            page = 1
        if limit < 0:
            limit = default_limit_count
        offset = limit * (page - 1)
        operation_instance = Operation.objects.get(pk=pk)
        data_serializer = DataSerializer({
            "full": full,
            "limit": limit,
            "offset": offset,
            "operation_instance": operation_instance
        })
        return Response(data_serializer.data)


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
    authentication_classes = [TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Operation.objects.all()
    serializer_class = OperationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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
