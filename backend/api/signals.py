from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from .models import Vote, Post, Comment

@receiver(post_save, sender=Vote)
def update_score_on_save(sender, instance, **kwargs):
    update_target_score(instance)

@receiver(post_delete, sender=Vote)
def update_score_on_delete(sender, instance, **kwargs):
    update_target_score(instance)

def update_target_score(instance):
    target_obj = instance.content_object
    
    if target_obj:
        aggregate_data = Vote.objects.filter(
            content_type=instance.content_type,
            object_id=instance.object_id
        ).aggregate(total_score=Sum('value'))
        
        new_score = aggregate_data['total_score'] or 0
        
        if target_obj.score != new_score:
            target_obj.score = new_score
            target_obj.save(update_fields=['score'])