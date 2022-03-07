from rest_framework import generics, permissions
from .models import Preference
from .serializers import PreferenceSerializer

# Create your views here.
class PreferedQueryBuilder(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Preference.objects.all()
    serializer_class = PreferenceSerializer

class UpdatePreferedQueryBuilder(generics.UpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Preference.objects.all()
    serializer_class = PreferenceSerializer
