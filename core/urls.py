from django.urls import include, path
from knox import views as knox_views
from core.views import LoginView
from core import views as core_views

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='knox_login'),
    path(r'auth/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path(r'auth/logoutall/', knox_views.LogoutAllView.as_view(),
         name='knox_logoutall'),
    path(r'auth/', include('rest_social_auth.urls_knox')),
    path('users/', core_views.UserList.as_view()),
    path('users/<int:pk>/', core_views.UserDetail.as_view()),
    path('tags/', core_views.TagList.as_view()),
    path('tags/<int:pk>/', core_views.TagDetail.as_view()),
    # TODO: deprecate endpoint
    path('operation_steps/', core_views.OperationStepList.as_view()),
    # TODO: deprecate endpoint
    path('operation_steps/<int:pk>/', core_views.OperationStepDetail.as_view()),
    path('reviews/', core_views.ReviewList.as_view()),
    path('reviews/<int:pk>/', core_views.ReviewDetail.as_view()),
    # TODO: deprecate endpoint
    path('operations/', core_views.OperationList.as_view()),
    # TODO: deprecate endpoint
    path('operations/mine/', core_views.UserOperationList.as_view()),
    # TODO: deprecate endpoint
    path('operations/<int:pk>/', core_views.OperationDetail.as_view()),
    # TODO: deprecate endpoint
    path('operations/data/<int:pk>/', core_views.ViewData.as_view()),
    path('themes/', core_views.ThemeList.as_view()),
    path('themes/<int:pk>/', core_views.ThemeDetail.as_view()),
    path('scheduled_event/', core_views.ScheduledEventList.as_view()),
    path('scheduled_event/<int:pk>/run_instances/',
         core_views.ScheduledEventRunInstanceHistory.as_view()),
    path('scheduled_event/run_instances/<int:pk>/',
         core_views.ScheduledEventRunInstanceDetail.as_view()),
    path('sectors/', core_views.SectorList.as_view()),
    path('sectors/<int:pk>/', core_views.SectorDetail.as_view()),
    path('sources/', core_views.SourceList.as_view()),
    path('sources/<int:pk>/', core_views.SourceDetail.as_view()),
    path('source/datasets/<int:pk>/', core_views.ViewSourceDatasets.as_view()),
    path('source/datasets/mine/<int:pk>/',
         core_views.ViewUserSourceDatasets.as_view()),
    path('export/<int:pk>/', core_views.streaming_export_view, name="export_stream"),
    path('change_password/', core_views.ChangePassword.as_view()),
    path('list_update_scripts/', core_views.ListUpdateScripts.as_view()),
    path('execute_update/', core_views.streaming_script_execute),
    path('tables/update/<str:table_name>/',
         core_views.UpdateTableAPI.as_view()),
    path('tables/download/<str:table_name>/',
         core_views.streaming_tables_export_view),
    path('tables/download/<str:table_name>/<str:schema>/',
         core_views.streaming_tables_export_view),
    # v2 endpoints for handling queries & datasets
    path('datasets/', core_views.OperationList.as_view()),
    path('datasets/mine/', core_views.UserOperationList.as_view()),
    path('dataset/<int:pk>/', core_views.OperationDetail.as_view()),
    path('dataset/preview/', core_views.PreviewOperationData.as_view()),
    path('dataset/data/<int:pk>/', core_views.ViewData.as_view()),
    path('dataset/alias/<int:pk>/', core_views.OperationColumnAlias.as_view()),
    # For handling saving query sets, and freezing data
    path('savedquerysets/', core_views.SavedQueryDataList.as_view()),
    path('savedqueryset/<int:pk>/', core_views.SavedQueryDataDetail.as_view()),
    path('frozendata/', core_views.FrozenDataList.as_view()),
    path('frozendata/<int:pk>/', core_views.FrozenDataDetail.as_view()),
]

handler500 = 'rest_framework.exceptions.server_error'
handler400 = 'rest_framework.exceptions.bad_request'
