from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
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
from .models import Moderator, Post, Comment, Report, TopicBan, TopicTagCategory, Topic
from .permissions import IsAuthorOrTopicModerator
from .serializers import (
    ReportSerializer,
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
from rest_framework.exceptions import PermissionDenied


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
        user = self.request.user
        topic_id = self.request.data.get('topic')
        topic = get_object_or_404(Topic, id=topic_id)

        if TopicBan.objects.filter(user=user, topic=topic).exists():
            raise PermissionDenied("You are blocked from this community.")

        is_privileged = Moderator.objects.filter(user=user, topic=topic).exists() or user.is_staff
        if topic.is_locked and not is_privileged:
            raise PermissionDenied("This community is locked.")

        serializer.save(author=user, topic=topic)


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
        user = self.request.user
        topic = post.topic

        if TopicBan.objects.filter(user=user, topic=topic).exists():
            raise PermissionDenied("You are blocked from this community.")

        is_privileged = Moderator.objects.filter(user=user, topic=topic).exists() or user.is_staff

        if post.is_locked and not is_privileged:
            raise PermissionDenied("This post is locked.")

        parent_id = self.request.data.get('parent')
        parent = None
        if parent_id:
            parent = get_object_or_404(Comment, id=parent_id)
            if parent.is_locked and not is_privileged:
                raise PermissionDenied("You can not reply to this comment.")
        
        serializer.save(author=user, post=post, parent=parent)


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
        return super().get_object()


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
    lookup_field = 'pk' # or 'username'


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


class ToggleTopicLockView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        topic = get_object_or_404(Topic, pk=pk)
        user = request.user

        if topic.creator != user and not user.is_staff:
            raise PermissionDenied("You do not have permission to lock this community.")

        topic.is_locked = not topic.is_locked
        topic.save()

        status_msg = "locked" if topic.is_locked else "opened"
        return Response({
            "message": f"The r/{topic.name} community is successfully {status_msg}.",
            "is_locked": topic.is_locked
        }, status=status.HTTP_200_OK)


class TogglePostLockView(APIView):
    permission_classes = [IsAuthenticated, IsAuthorOrTopicModerator]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        self.check_object_permissions(request, post)
        
        post.is_locked = not post.is_locked
        post.save()
        
        status_msg = "locked" if post.is_locked else "unlocked"
        return Response({"message": f"Post is successfully {status_msg}."}, status=status.HTTP_200_OK)

class ToggleCommentLockView(APIView):
    permission_classes = [IsAuthenticated, IsAuthorOrTopicModerator]

    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        self.check_object_permissions(request, comment)
        
        comment.is_locked = not comment.is_locked
        comment.save()
        
        return Response({"is_locked": comment.is_locked}, status=status.HTTP_200_OK)
    

class TopicBanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)
        user_to_ban = get_object_or_404(User, id=request.data.get('user_id'))
        reason = request.data.get('reason', '')

        is_mod = Moderator.objects.filter(user=request.user, topic=topic).exists()
        if not is_mod and not request.user.is_staff:
            raise PermissionDenied("You do not have permission to ban in this community.")

        if user_to_ban == topic.creator or user_to_ban == request.user:
            return Response({"error": "You can not ban this user."}, status=status.HTTP_400_BAD_REQUEST)

        ban, created = TopicBan.objects.get_or_create(
            user=user_to_ban,
            topic=topic,
            defaults={'banned_by': request.user, 'reason': reason}
        )

        if not created:
            return Response({"message": "This user is already banned."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": f"{user_to_ban.username} is banned from this community."}, status=status.HTTP_201_CREATED)
    

class ModeratorPromotionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)
        if topic.creator != request.user and not request.user.is_staff:
            raise PermissionDenied("Only the community owner can nominate moderators .")

        target_user = get_object_or_404(User, id=request.data.get('user_id'))
        new_role = request.data.get('role', 'mod') # 'mod' or 'admin'

        if new_role not in ['mod', 'admin']:
            return Response({"error": "Invalid rank."}, status=status.HTTP_400_BAD_REQUEST)

        moderator, created = Moderator.objects.update_or_create(
            user=target_user,
            topic=topic,
            defaults={'role': new_role}
        )

        return Response({
            "message": f"{target_user.username} from now on {new_role} in the r/{topic.name} community."
        }, status=status.HTTP_200_OK)
    

class ReportCreateView(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class TopicReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        topic_id = self.kwargs['topic_id']
        user = self.request.user
        
        if not Moderator.objects.filter(user=user, topic_id=topic_id).exists() and not user.is_staff:
            raise PermissionDenied("Nincs jogod látni a jelentéseket.")
            
        return Report.objects.filter(
            Q(post__topic_id=topic_id) | Q(comment__post__topic_id=topic_id),
            status='pending'
        ).order_by('-created_at')
    

class ResolveReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        action = request.data.get('action') # 'resolve' or 'dismiss'
        user = request.user

        topic = report.post.topic if report.post else report.comment.post.topic
        if not Moderator.objects.filter(user=user, topic=topic).exists() and not user.is_staff:
            raise PermissionDenied("Nincs jogod kezelni ezt a jelentést.")

        if action == 'resolve':
            report.status = 'resolved'
            if report.post: report.post.delete()
            elif report.comment: report.comment.delete()
        else:
            report.status = 'dismissed'

        report.resolved_at = timezone.now()
        report.resolved_by = user
        report.save()

        return Response({"message": f"Jelentés {report.status} állapotba került."})