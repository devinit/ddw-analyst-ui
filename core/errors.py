import traceback

from django.core.mail import mail_admins

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response

class AliasCreationError(APIException):
    """Raised when alias creation fails"""
    status_code = status.HTTP_400_BAD_REQUEST

class AliasUpdateError(APIException):
    """Raised when alias update fails"""
    status_code = status.HTTP_400_BAD_REQUEST

def handle_uncaught_error(error):
    error_traceback = error.__traceback__
    extracted_traceback = traceback.extract_tb(tb)
    result = traceback.format_list(extracted_traceback)
    mail_admins(type(error).__name__, result[0], fail_silently=False)
    return Response({'detail': f'{str(error).capitalize()} error occured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
