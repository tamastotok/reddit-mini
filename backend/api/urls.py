from django.urls import path

from .views import (
    TopicTagListView,
    UserActivityView,
    PostListView,
    PostDetailView,
    PostCreateView,
    PostVoteView,
    PostDeleteAllView,
    CommentCreateView,
    CommentVoteView,
    CommentUpdateView,
    CommentDeleteView,
    PostDeleteView,
    PostUpdateView,
    UserProfileView,
    PostSearchView,
    TopicListView,
    TopicDetailView,
    TopicPostListView,
    SubscribeToggleView,
)

urlpatterns = [
    # --- USER ---
    path('user-activity/<str:username>/', UserActivityView.as_view(), name='user-activity'),
    path('profile/<int:pk>/', UserProfileView.as_view(), name='get-profile'),

    # --- TOPICS ---
    path('topics/', TopicListView.as_view(), name='topic-list'),
    path('topics/<slug:slug>/', TopicDetailView.as_view(), name='topic-detail'),
    path('topics/<slug:slug>/posts/', TopicPostListView.as_view(), name='topic-posts'),
    path('topics/<slug:slug>/subscribe/', SubscribeToggleView.as_view(), name='topic-subscribe'),
    path('topic-tags/', TopicTagListView.as_view(), name='topic-tag-list'),

    # --- POSTS ---
    path('posts/', PostListView.as_view(), name='get-posts'),                  # list
    path('post/<int:pk>/', PostDetailView.as_view(), name='post-detail'),     # detail
    path('post/create/', PostCreateView.as_view(), name='create-post'),
    path('post/<int:post_id>/update/', PostUpdateView.as_view(), name='post-update'),
    path('post/<int:pk>/delete/', PostDeleteView.as_view(), name='delete-post'),
    path('post/<int:post_id>/vote/', PostVoteView.as_view(), name='vote-on-post'),
    path('posts/delete/all/', PostDeleteAllView.as_view(), name='delete-all-posts'),

    # --- COMMENTS ---
    path('post/<int:post_id>/comment/create/', CommentCreateView.as_view(), name='create-comment'),
    path('comment/<int:comment_id>/vote/', CommentVoteView.as_view(), name='vote-on-comment'),
    path('comment/<int:comment_id>/update/', CommentUpdateView.as_view(), name='edit-comment'),
    path('post/<int:post_id>/comment/<int:comment_id>/delete/', CommentDeleteView.as_view(), name='delete-comment'),
    
    # --- SEARCH ---
    path('search/', PostSearchView.as_view(), name='search'),
]
