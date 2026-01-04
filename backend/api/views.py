from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAuthenticatedOrReadOnly,
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.db.models import Prefetch, Q
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Post, Comment, TopicTagCategory, Topic
from .serializers import (
    TagCategorySerializer,
    UserSerializer,
    PostSerializer,
    CommentSerializer,
    RegisterSerializer,
    CustomTokenSerializer,
    ChangePasswordSerializer,
    TopicSerializer,
)
from .utils.voting import toggle_vote


def csrf_token_view(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})


class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class EditUserView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def perform_destroy(self, instance):
        instance.delete()


### Clear database (test only for me):
class PostDeleteAllView(APIView):
    def delete(self, request):
        deleted_count, _ = Post.objects.all().delete()
        return Response(
            {"message": f"{deleted_count} posts deleted."},
            status=status.HTTP_204_NO_CONTENT,
        )


class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = User.objects.filter(username=username).first()
        if not user:
            return Response({"error": "User not found"}, status=404)

        posts = Post.objects.filter(author=user).order_by('-created_at')
        comments = (
            Comment.objects.filter(author=user)
            .select_related('post')
            .order_by('-created_at')
        ) 

        post_serializer = PostSerializer(posts, many=True, context={'request': request})
        comment_serializer = CommentSerializer(comments, many=True, context={'request': request})

        return Response(
            {
                "posts": post_serializer.data,
                "comments": comment_serializer.data,
            }
        )

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class PostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):        
        queryset = Post.objects.select_related('author', 'topic').prefetch_related('votes', 'tags')
        topic_slug = self.request.query_params.get('topic', 'all')
        sort = self.request.query_params.get('sort', 'new')
        timeframe = self.request.query_params.get('timeframe', 'all')
        user = self.request.user
        
        if topic_slug == 'home':
            if user.is_authenticated:
                subscribed_topic_ids = user.subscriptions.values_list('id', flat=True)
                queryset = queryset.filter(topic__id__in=subscribed_topic_ids)
            else:        
                return Post.objects.none()
        elif topic_slug and topic_slug != 'all':        
            queryset = queryset.filter(topic__slug=topic_slug)

        now = timezone.now()
        if sort in ['hot', 'top'] and timeframe != 'all':
            if timeframe == 'today':
                queryset = queryset.filter(created_at__gte=now - timedelta(days=1))
            elif timeframe == 'week':
                queryset = queryset.filter(created_at__gte=now - timedelta(weeks=1))
            elif timeframe == 'month':
                queryset = queryset.filter(created_at__gte=now - timedelta(days=30))
       
        if sort == 'hot':        
            queryset = queryset.order_by('-score', '-created_at')
        elif sort == 'top':
            queryset = queryset.order_by('-score', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset


class PostCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        return post


class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.select_related('author').prefetch_related(
        'tags',
        'votes',
        Prefetch(
            'comments',
            queryset=Comment.objects.select_related('author').prefetch_related('votes')
        )
    )
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        post = self.get_object()
        serializer = self.get_serializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PostVoteView(generics.GenericAPIView):
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        vote_type = request.data.get("vote_type")

        if vote_type not in [1, -1, None]:
            return Response(
                {"error": "Invalid vote type. Must be 1, -1, or null."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = toggle_vote(request.user, post, vote_type)
        return Response({"message": "Vote toggled successfully.", **result})



class GetComments(generics.RetrieveAPIView):
    queryset = Post.objects.select_related('author').prefetch_related(
        'tags',
        'votes',
        Prefetch(
            'comments',
            queryset=Comment.objects.filter(parent=None)
                                    .select_related('author')
                                    .prefetch_related('votes')
        )
    )
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CommentCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['post_id'])
        parent_id = self.request.data.get('parent')
        parent = get_object_or_404(Comment, id=parent_id) if parent_id else None
        
        serializer.save(author=self.request.user, post=post, parent=parent)


class CommentVoteView(generics.GenericAPIView):
    def post(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)
        vote_type = request.data.get("vote_type")

        if vote_type not in [1, -1, None]:
            return Response(
                {"error": "Invalid vote type. Must be 1, -1, or null."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = toggle_vote(request.user, comment, vote_type)
        return Response({"message": "Vote toggled successfully.", **result})



class RefreshComment(generics.RetrieveAPIView):
    queryset = Comment.objects.select_related('author').prefetch_related('votes', 'replies')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        comment = self.get_object()
        serializer = self.get_serializer(comment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CommentUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer

    def get_object(self):
        comment_id = self.kwargs.get('comment_id')
        comment = get_object_or_404(Comment, id=comment_id)

        if comment.author != self.request.user:
            self.permission_denied(self.request, message="You cannot edit this comment.")
        return comment


class CommentDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        comment_id = self.kwargs.get('comment_id')
        return get_object_or_404(Comment, id=comment_id)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.author != request.user:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
        self.perform_destroy(instance)
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)


class PostDeleteView(generics.DestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def get_object(self):
        obj = super().get_object()  
        if obj.author.id != self.request.user.id:
            raise PermissionDenied('You are not authorized to delete this post.')
        return obj

    def perform_destroy(self, instance):
        instance.delete()
        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class PostUpdateView(generics.UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'post_id'

    def update(self, request, *args, **kwargs):
        post = self.get_object()

        if request.user != post.author:
            return Response(
                {"error": "You do not have permission to edit this post."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'pk' # vagy 'username'


class ChangeUserPassword(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()  
        return Response(
            {"message": "Password updated successfully"}, status=status.HTTP_200_OK
        )


class PostSearchView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()

        if not query:
            return Post.objects.none()

        return Post.objects.filter(
            Q(title__icontains=query)
            | Q(author__username__iexact=query)
            | Q(content__icontains=query)
            | Q(tags__name__iexact=query)
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if not queryset.exists():
            return Response(
                {"detail": "No posts found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class TopicListView(generics.ListCreateAPIView):
    queryset = Topic.objects.all().order_by('name')
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class TopicDetailView(generics.RetrieveAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    lookup_field = 'slug'

class TopicPostListView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        topic_slug = self.kwargs['slug']
        return Post.objects.filter(topic__slug=topic_slug).order_by('-created_at')


class TopicTagListView(generics.ListAPIView):
    queryset = TopicTagCategory.objects.prefetch_related('tags').all()
    serializer_class = TagCategorySerializer
    permission_classes = []

class SubscribeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        topic = get_object_or_404(Topic, slug=slug)
        user = request.user
        
        if user in topic.subscribers.all():
            topic.subscribers.remove(user)
            subscribed = False
        else:
            topic.subscribers.add(user)
            subscribed = True
            
        return Response({
            "subscribed": subscribed,
            "subscribers_count": topic.subscribers.count()
        })
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)