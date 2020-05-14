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
    path('login/', views.index),
    path('sources/', views.index),
    path('queries/build/', views.index),
    path('queries/build/<int:pk>/', views.with_id),
    path('queries/data/<int:pk>/', views.with_id),
    path('designs/scheduled-events/', views.scheduled_events)
]
