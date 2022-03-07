from rest_framework import generics
from .models import Preference
from .serializers import PreferenceSerializer

# Create your views here.
class PreferedQueryBuilder(generics.ListAPIView):
    queryset = Preference.objects.all()
    serializer_class = PreferenceSerializer

class UpdatePreferedQueryBuilder(generics.UpdateAPIView):
    queryset = Preference.objects.all()
    serializer_class = PreferenceSerializer
