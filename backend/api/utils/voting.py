from django.contrib.contenttypes.models import ContentType
from ..models import Vote

#Toggle a vote on any content object (Post, Comment, etc.)
def toggle_vote(user, content_object, vote_type):
    content_type = ContentType.objects.get_for_model(content_object.__class__)
    obj_id = content_object.id

    try:
        vote = Vote.objects.get(user=user, content_type=content_type, object_id=obj_id)
        if vote_type is None or vote.value == vote_type:
            vote.delete()
        else:
            vote.value = vote_type
            vote.save()
            
    except Vote.DoesNotExist:
        if vote_type is not None:
            Vote.objects.create(
                user=user,
                content_type=content_type,
                object_id=obj_id,
                value=vote_type,
            )

    content_object.refresh_from_db()

    return {
        "total_votes": content_object.score,
        "user_vote": vote_type if vote_type is not None else 0
    }
