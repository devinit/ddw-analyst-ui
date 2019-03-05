from knox.views import LoginView as KnoxLoginView
from rest_framework.authentication import BasicAuthentication
from core.models import Tag
from core.serializers import TagSerializer, UserSerializer
from rest_framework import generics, permissions
from django.contrib.auth.models import User
from core.permissions import IsOwnerOrReadOnly


class UserList(generics.ListAPIView):
    authentication_classes = [BasicAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveAPIView):
    authentication_classes = [BasicAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = User.objects.all()
    serializer_class = UserSerializer


class TagList(generics.ListCreateAPIView):
    authentication_classes = [BasicAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TagDetail(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [BasicAuthentication]
    permission_classes = (permissions.IsAuthenticated & IsOwnerOrReadOnly,)

    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class LoginView(KnoxLoginView):
    authentication_classes = [BasicAuthentication]
