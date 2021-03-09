from rest_framework import status
from rest_framework.exceptions import APIException

class AliasCreationError(APIException):
    """Raised when alias creation fails"""
    status_code = status.HTTP_400_BAD_REQUEST

class AliasUpdateError(APIException):
    """Raised when alias update fails"""
    status_code = status.HTTP_400_BAD_REQUEST
