import json
import traceback

from django.core.mail import mail_admins
from django.http import Http404, HttpResponse

from rest_framework import status
from rest_framework.exceptions import APIException

class AliasCreationError(APIException):
    """Raised when alias creation fails"""
    status_code = status.HTTP_400_BAD_REQUEST

class AliasUpdateError(APIException):
    """Raised when alias update fails"""
    status_code = status.HTTP_400_BAD_REQUEST

class CustomAPIException(APIException):
    """Raised when there is an uncaught API error"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'A server error occured. Please contact your administrator'


def handle_uncaught_error(error):
    error_traceback = error.__traceback__
    extracted_traceback = traceback.extract_tb(error_traceback)
    result = traceback.format_list(extracted_traceback)
    message = result[0]
    mail_admins(f'DDW ANALYST UI {type(error).__name__}', message , fail_silently=False)
