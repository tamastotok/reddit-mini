import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Post, Comment, Vote, Topic, TopicTag, TopicTagCategory

@pytest.mark.django_db
class TestRedditMiniAPI:

    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", password="pass123")
        
        # Auth
        self.client.force_authenticate(user=self.user)
        
        # Topic and tag structure
        self.cat_gaming = TopicTagCategory.objects.create(name="Gaming")
        self.tag_fps = TopicTag.objects.create(name="FPS", category=self.cat_gaming)
        
        self.topic = Topic.objects.create(
            name="Gaming Community", 
            slug="gaming", 
            creator=self.user
        )
        self.topic.tags.add(self.tag_fps)

        # Basic post
        self.post = Post.objects.create(
            author=self.user,
            title="Test Post",
            content="Hello World",
            topic=self.topic
        )

    def test_get_topic_tags_grouped(self):
        url = reverse("topic-tag-list")
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        assert res.data[0]["name"] == "Gaming"

    def test_get_posts_by_topic(self):
        url = f"/api/posts/?topic={self.topic.slug}"
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        assert len(res.data) >= 1

    def test_sort_posts_by_new(self):
        Post.objects.create(author=self.user, title="Newer Post", topic=self.topic)
        url = "/api/posts/?sort=new"
        res = self.client.get(url)
        assert res.data[0]["title"] == "Newer Post"

    def test_sort_posts_by_top_timeframe(self):
        # Check 'Top' filter
        # Create a less popular post
        low_post = Post.objects.create(author=self.user, title="Boring Post", topic=self.topic)
        
        # Create a popular post
        high_vote_post = Post.objects.create(author=self.user, title="Popular", topic=self.topic)
        
        # Create 5 user and vote with them to the popular post
        for i in range(5):
            other_user = User.objects.create_user(username=f"voter_{i}", password="pass")
            Vote.objects.create(
                content_object=high_vote_post, 
                value=1, 
                user=other_user
            )
            
        # 4. One vote to the less popular post
        Vote.objects.create(content_object=low_post, value=1, user=self.user)
            
        url = "/api/posts/?sort=top&timeframe=all"
        res = self.client.get(url)
        
        assert res.status_code == status.HTTP_200_OK
        assert res.data[0]["title"] == "Popular"
        assert res.data[1]["title"] == "Boring Post"

    def test_non_existent_topic(self):
        url = "/api/posts/?topic=non-existent-slug"
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        assert res.data == []