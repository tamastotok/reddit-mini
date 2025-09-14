import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Post, Comment, Vote
from django.contrib.auth.models import User


@pytest.mark.django_db
class TestPostsAPI:

    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", password="pass123")

        # Base post
        self.post = Post.objects.create(
            author=self.user,
            title="Test Post",
            content="Hello World",
            category=Post.Category.SCIENCE,
        )
        self.comment = Comment.objects.create(
            post=self.post,
            author=self.user,
            content="Test Comment"
        )
        # 2 upvotes, 1 downvote on post
        Vote.objects.create(content_object=self.post, value=1)
        Vote.objects.create(content_object=self.post, value=1)
        Vote.objects.create(content_object=self.post, value=-1)
        # 1 upvote on comment
        Vote.objects.create(content_object=self.comment, value=1)

    def test_get_posts(self):
        url = reverse("get-posts")
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        assert res.data[0]["upvotes"] == 2
        assert res.data[0]["downvotes"] == 1
        assert res.data[0]["total_votes"] == 1
        assert res.data[0]["comments_count"] == 1

    def test_get_comments(self):
        url = reverse("get-comments", args=[self.post.id])
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        post_data = res.data
        assert post_data["comments_count"] == 1
        assert post_data["comments"][0]["upvotes"] == 1
        assert post_data["comments"][0]["downvotes"] == 0
        assert post_data["comments"][0]["total_votes"] == 1

    def test_refresh_post(self):
        url = reverse("refresh-post", args=[self.post.id])
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        assert res.data["upvotes"] == 2
        assert res.data["downvotes"] == 1
        assert res.data["total_votes"] == 1

    def test_refresh_comment(self):
        url = reverse("refresh-comment", args=[self.comment.id])
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        assert res.data["upvotes"] == 1
        assert res.data["downvotes"] == 0
        assert res.data["total_votes"] == 1

    # -----------------------
    # Sorting tests
    # -----------------------

    def test_sort_by_date(self):
        older_post = Post.objects.create(
            author=self.user, title="Old Post", content="Old content"
        )
        newer_post = Post.objects.create(
            author=self.user, title="New Post", content="New content"
        )
        url = reverse("get-posts") + "?sort=date"
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        titles = [p["title"] for p in res.data]
        assert titles[0] == "New Post"  # newest first

    def test_sort_by_upvotes(self):
        low_post = Post.objects.create(author=self.user, title="Low Votes", content="...")
        high_post = Post.objects.create(author=self.user, title="High Votes", content="...")

        Vote.objects.create(content_object=low_post, value=1)
        for _ in range(3):
            Vote.objects.create(content_object=high_post, value=1)

        url = reverse("get-posts") + "?sort=upvotes"
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        titles = [p["title"] for p in res.data]
        assert titles[0] == "High Votes"
        assert titles[1] == "Low Votes"

    def test_sort_by_comments(self):
        low_post = Post.objects.create(author=self.user, title="Low Comments", content="...")
        high_post = Post.objects.create(author=self.user, title="High Comments", content="...")

        Comment.objects.create(post=low_post, author=self.user, content="c1")
        for i in range(3):
            Comment.objects.create(post=high_post, author=self.user, content=f"c{i}")

        url = reverse("get-posts") + "?sort=comments"
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        titles = [p["title"] for p in res.data]
        assert titles[0] == "High Comments"
        assert titles[1] == "Low Comments"

    # -----------------------
    # Category filter tests
    # -----------------------

    def test_filter_by_category(self):
        tech_post = Post.objects.create(
            author=self.user,
            title="Tech Post",
            content="About tech",
            category=Post.Category.TECHNOLOGY,
        )
        sci_post = Post.objects.create(
            author=self.user,
            title="Science Post",
            content="About science",
            category=Post.Category.SCIENCE,
        )

        url = reverse("get-posts") + f"?category={Post.Category.TECHNOLOGY}"
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        titles = [p["title"] for p in res.data]
        assert "Tech Post" in titles
        assert "Science Post" not in titles

    def test_filter_and_sort_together(self):
        tech_low = Post.objects.create(
            author=self.user,
            title="Tech Low Votes",
            content="...",
            category=Post.Category.TECHNOLOGY,
        )
        tech_high = Post.objects.create(
            author=self.user,
            title="Tech High Votes",
            content="...",
            category=Post.Category.TECHNOLOGY,
        )
        sci_post = Post.objects.create(
            author=self.user,
            title="Science Post",
            content="...",
            category=Post.Category.SCIENCE,
        )

        Vote.objects.create(content_object=tech_low, value=1)
        for _ in range(3):
            Vote.objects.create(content_object=tech_high, value=1)
        Vote.objects.create(content_object=sci_post, value=1)

        url = reverse("get-posts") + f"?category={Post.Category.TECHNOLOGY}&sort=upvotes"
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        titles = [p["title"] for p in res.data]
        assert titles == ["Tech High Votes", "Tech Low Votes"]
        assert "Science Post" not in titles

    def test_empty_results(self):
        url = reverse("get-posts") + f"?category={Post.Category.ART_CULTURE}"
        res = self.client.get(url)
        assert res.status_code == status.HTTP_200_OK
        assert res.data == []  # should return an empty list, not error