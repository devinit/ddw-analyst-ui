from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions for owner.
        if obj.user == request.user:
            return True

        # Write permissions for superuser.
        if obj.user.is_superuser:
            return True

        # Deny write permissions for all else.
        return False
