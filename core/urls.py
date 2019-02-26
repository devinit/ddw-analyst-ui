from django.urls import include, path
from knox import views as knox_views
from core.views import LoginView

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='knox_login'),
    path(r'auth/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path(r'auth/logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
    path(r'auth/', include('rest_social_auth.urls_knox')),
]
