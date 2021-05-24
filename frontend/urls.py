"""
    Front End URL configuration
    These are all being redirected to the index view which serves the fully React UI.
    We're using React Router, and so the paths here must match those configured in the React Router,
    and the reverse.
    The ones below are responsible for serving the correct view on refresh, and the React Router
    loads the appropriate component.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('datasets/', views.index),
    path('login/', views.index),
    path('sources/', views.index),
    path('sources/page/<int:pk>/', views.with_id),
    path('source/datasets/<int:pk>/', views.with_id),
    path('source/history/<int:pk>/', views.with_id),
    path('queries/build/', views.index),
    path('queries/build/<int:pk>/', views.with_id),
    path('queries/data/<int:pk>/', views.with_id),
    path('queries/history/<int:pk>/', views.with_id),
    path('update/', views.index),
    path('designs/scheduled-events/', views.scheduled_events),
    path('designs/update-data-source/', views.update_data_source),
    path('designs/datasets/', views.datasets),
    path('scheduledevents/', views.index),
]
