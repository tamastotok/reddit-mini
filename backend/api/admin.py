from django.contrib import admin
from .models import Topic, TopicTag, Post, PostTag, Comment, TopicTagCategory, UserProfile, Vote

# Register your models here.
# TOPIC AND TAGS
@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'creator', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)} 

@admin.register(TopicTagCategory)
class TopicTagCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(TopicTag)
class TopicTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'category') 
    list_filter = ('category',)        
    search_fields = ('name',)

# POST AND TAGS
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'topic', 'created_at', 'score')
    list_filter = ('topic', 'created_at')
    search_fields = ('title', 'content')

@admin.register(PostTag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)

# INTERACTIONS
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'post', 'created_at', 'score')

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_object', 'value')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user',)