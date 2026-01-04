from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default.png', blank=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


class Vote(models.Model):
    VOTE_CHOICES = (
        (1, 'Upvote'),
        (-1, 'Downvote'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    value = models.IntegerField(choices=VOTE_CHOICES)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')

    def __str__(self):
        return f'Vote by {self.user.username} on {self.content_object} - {self.get_vote_type_display()}'


class TopicTagCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Topic Tag Categories"

class TopicTag(models.Model):
    name = models.CharField(max_length=30, unique=True)
    category = models.ForeignKey(
        TopicTagCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='tags'
    )

    def __str__(self):
        return self.name


class Topic(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    description = models.TextField(max_length=500, blank=True)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_subforums')
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField(TopicTag, related_name='topics', blank=True)
    subscribers = models.ManyToManyField(User, related_name='subscriptions', blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"r/{self.name}"


class PostTag(models.Model):
    name = models.CharField(max_length=16, unique=True)

    def save(self, *args, **kwargs):       
        if self.name:
            self.name = slugify(self.name).lower()
        
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='posts')    
    tags = models.ManyToManyField(PostTag, related_name='posts')
    votes = GenericRelation(Vote, related_query_name='post_votes_set')
    score = models.IntegerField(default=0)

    def __str__(self):
        return self.title


class Comment(models.Model):
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    votes = GenericRelation('Vote', related_query_name='comment_votes_set')
    score = models.IntegerField(default=0)

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'
