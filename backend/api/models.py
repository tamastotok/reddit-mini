from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

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


class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Post(models.Model):
    CATEGORY_CHOICES = [
        ('technology', 'Technology'),
        ('science', 'Science'),
        ('health', 'Health'),
        ('education', 'Education'),
        ('business', 'Business'),
        ('finance', 'Finance'),
        ('lifestyle', 'Lifestyle'),
        ('travel', 'Travel'),
        ('food', 'Food'),
        ('sports', 'Sports'),
        ('entertainment', 'Entertainment'),
        ('politics', 'Politics'),
        ('environment', 'Environment'),
        ('art_culture', 'Art & Culture'),
        ('gaming', 'Gaming'),
        ('productivity', 'Productivity'),
        ('diy_crafts', 'DIY & Crafts'),
        ('parenting', 'Parenting'),
        ('fashion', 'Fashion'),
        ('relationships', 'Relationships'),
        ('custom', 'Custom'),
    ]

    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, blank=True)
    tags = models.ManyToManyField(Tag, related_name='posts')
    votes = GenericRelation(Vote, related_query_name='post_votes_set')

    @property
    def upvotes(self):
        return self.votes.filter(value=1).count()

    @property
    def downvotes(self):
        return self.votes.filter(value=-1).count()

    @property
    def total_votes(self):
        return self.upvotes - self.downvotes

    def clean(self):
        if self.tags.count() > 3:
            raise ValidationError("You can only add up to 3 tags.")
        super().clean()

    def __str__(self):
        return self.title


class Comment(models.Model):
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    votes = GenericRelation('Vote', related_query_name='comment_votes_set')

    @property
    def upvotes(self):
        return Vote.objects.filter(
            content_type=ContentType.objects.get_for_model(Comment),
            object_id=self.id,
            value=1,
        ).count()

    @property
    def downvotes(self):
        return Vote.objects.filter(
            content_type=ContentType.objects.get_for_model(Comment),
            object_id=self.id,
            value=-1,
        ).count()

    @property
    def total_votes(self):
        return self.upvotes - self.downvotes

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'
