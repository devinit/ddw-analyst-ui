import traceback

from django.core.mail import mail_admins

from rest_framework import status
from rest_framework.exceptions import APIException

class AliasCreationError(APIException):
    """Raised when alias creation fails"""
    status_code = status.HTTP_400_BAD_REQUEST

class AliasUpdateError(APIException):
    """Raised when alias update fails"""
    status_code = status.HTTP_400_BAD_REQUEST

def handleUncaughtError(error):
    tb = error.__traceback__
    b = traceback.extract_tb(tb)
    result = traceback.format_list(b)
    mail_admins(type(error).__name__,result,fail_silently=False)
    return Response({'detail': f'{str(error).capitalize()} error occured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
