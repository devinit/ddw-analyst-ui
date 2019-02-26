from knox.views import LoginView as KnoxLoginView
from rest_framework.authentication import BasicAuthentication

# Create your views here.

class LoginView(KnoxLoginView):
  authentication_classes = [BasicAuthentication]
