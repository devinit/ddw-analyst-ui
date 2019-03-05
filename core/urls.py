from django.urls import include, path
from knox import views as knox_views
from core.views import LoginView
from core import views as core_views

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='knox_login'),
    path(r'auth/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path(r'auth/logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
    path(r'auth/', include('rest_social_auth.urls_knox')),
    path(r'rest/', include('rest_framework.urls')),
    path('users/', core_views.UserList.as_view()),
    path('users/<int:pk>/', core_views.UserDetail.as_view()),
    path('tags/', core_views.TagList.as_view()),
    path('tags/<int:pk>/', core_views.TagDetail.as_view()),
]
