"""
    Custom pagination handlers for Django REST Framework views
"""
from rest_framework import pagination
from rest_framework.response import Response

class DataPaginator(pagination.LimitOffsetPagination):
    """
        Handles pagination for the view that fetches operation data
    """
    true_count = 0

    def paginate_queryset(self, queryset, request, view=None):
        super().paginate_queryset(queryset, request, view)

        return list(queryset)

    def get_paginated_response(self, data):
        return Response({
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count': self.true_count,
            'results': data
        })

    def set_count(self, count):
        """
            Sets a count to overwrite the default count used in the parent class
        """
        self.true_count = count

    def get_count(self, queryset):
        return self.true_count
