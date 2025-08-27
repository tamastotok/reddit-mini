from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import UserProfile, Post, Comment, Vote, Tag
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
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all(), lookup="iexact", message="This email is already taken.")])
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
    upvotes = serializers.IntegerField(read_only=True)
    downvotes = serializers.IntegerField(read_only=True)
    total_votes = serializers.IntegerField(read_only=True)
    votes = VoteSerializer(many=True, read_only=True)
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
            'upvotes',
            'downvotes',
            'total_votes',
            'votes',
        ]
        read_only_fields = [
            'post_id',
            'created_at',
            'updated_at',
            'upvotes',
            'downvotes',
            'total_votes',
        ]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class PostSerializer(serializers.ModelSerializer):
    upvotes = serializers.IntegerField(read_only=True)
    downvotes = serializers.IntegerField(read_only=True)
    total_votes = serializers.IntegerField(read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    votes = VoteSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    category = serializers.ChoiceField(choices=Post.CATEGORY_CHOICES, required=False)
    tags = TagSerializer(many=True)

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
            'category',
            'tags',
            'upvotes',
            'downvotes',
            'total_votes',
            'comments_count',
            'votes',
            'comments',
        ]
        read_only_fields = [
            'created_at',
            'updated_at',
            'upvotes',
            'downvotes',
            'total_votes',
            'comments_count',
        ]

    def create(self, validated_data):
        tags_data = validated_data.pop('tags')

        post = Post.objects.create(**validated_data)

        for tag_data in tags_data:
            tag_name = tag_data['name'].strip().lower()

            tag = Tag.objects.filter(name=tag_name).first()

            if not tag:
                tag = Tag.objects.create(name=tag_name)

            post.tags.add(tag)

        return post

    def update(self, instance, validated_data):
        # Extract nested tag data (if provided)
        tags_data = validated_data.pop('tags', None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            # Clear existing tags
            instance.tags.clear()
            # Add or get each tag
            for tag_data in tags_data:
                tag, created = Tag.objects.get_or_create(name=tag_data['name'])
                instance.tags.add(tag)

        return instance


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
