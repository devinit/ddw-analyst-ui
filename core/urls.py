from django.urls import include, path
from knox import views as knox_views
from core.views import LoginView
from core import views as core_views

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='knox_login'),
    path(r'auth/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path(r'auth/logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
    path(r'auth/', include('rest_social_auth.urls_knox')),
    path('users/', core_views.UserList.as_view()),
    path('users/<int:pk>/', core_views.UserDetail.as_view()),
    path('tags/', core_views.TagList.as_view()),
    path('tags/<int:pk>/', core_views.TagDetail.as_view()),
    path('operation_steps/', core_views.OperationStepList.as_view()),
    path('operation_steps/<int:pk>/', core_views.OperationStepDetail.as_view()),
    path('reviews/', core_views.ReviewList.as_view()),
    path('reviews/<int:pk>/', core_views.ReviewDetail.as_view()),
    path('operations/', core_views.OperationList.as_view()),
    path('operations/<int:pk>/', core_views.OperationDetail.as_view()),
    path('operation_data/<int:pk>/', core_views.ViewData.as_view()),
    path('themes/', core_views.ThemeList.as_view()),
    path('themes/<int:pk>/', core_views.ThemeDetail.as_view()),
    path('sectors/', core_views.SectorList.as_view()),
    path('sectors/<int:pk>/', core_views.SectorDetail.as_view()),
    path('sources/', core_views.SourceList.as_view()),
    path('sources/<int:pk>/', core_views.SourceDetail.as_view()),
]
