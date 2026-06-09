from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from django.contrib.auth.models import User
from .models import Vote, UserProfile, Topic, Moderator

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

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

@receiver(post_save, sender=Topic)
def appoint_topic_creator_as_admin(sender, instance, created, **kwargs):
    if created:
        Moderator.objects.create(
            user=instance.creator, 
            topic=instance,
            role='admin'
        )