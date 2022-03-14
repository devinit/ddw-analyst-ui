from rest_framework import generics, permissions
from knox.auth import TokenAuthentication
from .models import Preference
from .serializers import PreferenceSerializer
from core.permissions import IsOwnerOrReadOnly


# Create your views here.
class PreferedChoice(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (IsOwnerOrReadOnly,)
    queryset = Preference.objects.all()
    serializer_class = PreferenceSerializer

class UpdatePreferedChoice(generics.RetrieveUpdateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = (IsOwnerOrReadOnly,)
    queryset = Preference.objects.all()
    serializer_class = PreferenceSerializer
