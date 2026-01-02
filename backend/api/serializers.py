from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import TopicTagCategory, UserProfile, Post, Comment, Vote, PostTag, Topic, TopicTag
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.middleware.csrf import get_token
from django.contrib.auth.hashers import check_password
from django.contrib.auth.password_validation import validate_password


class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_id'] = user.id  # Add user ID to the token
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id  # Add user ID to the response

        request = self.context.get('request')
        if request:
            data['csrfToken'] = get_token(request)
        return data

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True, validators=[UniqueValidator(queryset=User.objects.all(),lookup="iexact", message="Username is already taken!")])
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all(), lookup="iexact", message="Email is already taken!")])
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "password2")

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id", "username", "email"]


class VoteSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Vote
        fields = ['user_id', 'value']


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    total_votes = serializers.IntegerField(source='score', read_only=True)
    user_vote = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()    
    post_title = serializers.CharField(source='post.title', read_only=True)
    post_id = serializers.IntegerField(source='post.id', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'post_id',
            'post_title',
            'author_id',
            'author_username',
            'content',
            'created_at',
            'updated_at',
            'parent',
            'total_votes',
            'user_vote',
            'replies',
        ]

    def get_user_vote(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            vote = obj.votes.filter(user=user).first()
            return vote.value if vote else 0
        return 0

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []



class PostTagSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=16, error_messages={"max_length": "Tag must be 16 characters or less."})

    class Meta:
        model = PostTag
        fields = ['id', 'name']


class PostSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    topic_slug = serializers.CharField(source='topic.slug', read_only=True)
    total_votes = serializers.IntegerField(source='score', read_only=True)
    user_vote = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    votes = VoteSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    tags = PostTagSerializer(many=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'author_id',
            'author_username',
            'title',
            'content',
            'created_at',
            'updated_at',
            'topic',
            'topic_name',
            'topic_slug',
            'tags',
            'total_votes',
            'user_vote',
            'comments_count',
            'comments',
            'votes',
        ]

    def create(self, validated_data):
        tags_data = validated_data.pop('tags')
        post = Post.objects.create(**validated_data)

        for tag_data in tags_data:
            tag_name = tag_data['name'].strip().lower()
            tag, _ = PostTag.objects.get_or_create(name=tag_name)
            post.tags.add(tag)

        return post

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.tags.clear()
            for tag_data in tags_data:
                tag, _ = PostTag.objects.get_or_create(name=tag_data['name'])
                instance.tags.add(tag)

        return instance
    
    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_user_vote(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            vote = obj.votes.filter(user=user).first()
            return vote.value if vote else 0
        return 0
    
    def validate_tags(self, value):
        if len(value) > 3:
            raise serializers.ValidationError("You can add up to 3 tags to a post!")
        
        for tag_data in value:
            if not tag_data.get('name') or len(tag_data['name'].strip()) == 0:
                raise serializers.ValidationError("Tag's name can not be empty!")
                
        return value


class TopicTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicTag
        fields = ['id', 'name']

class TagCategorySerializer(serializers.ModelSerializer):
    tags = TopicTagSerializer(many=True, read_only=True)

    class Meta:
        model = TopicTagCategory
        fields = ['id', 'name', 'tags']

class TopicSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=TopicTag.objects.all(), required=False)
    posts_count = serializers.IntegerField(source='posts.count', read_only=True)
    is_subscribed = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ['id', 'name', 'slug', 'description','is_subscribed', 'subscribers_count', 'creator', 'created_at', 'tags', 'posts_count']
        read_only_fields = ['slug', 'creator', 'created_at']

    def get_is_subscribed(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return obj.subscribers.filter(id=user.id).exists()
        return False        


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'id', 'email', 'bio', 'profile_picture']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not check_password(value, user.password):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        if len(value) < 4:
            raise serializers.ValidationError(
                "New password must be at least 4 characters long."
            )
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
