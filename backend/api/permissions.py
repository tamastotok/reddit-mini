from rest_framework import permissions
from .models import Moderator

class IsAuthorOrTopicModerator(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if obj.author == request.user:
            return True

        return Moderator.objects.filter(user=request.user, topic=obj.topic).exists()