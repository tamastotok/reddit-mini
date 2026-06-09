from django.contrib import admin
from .models import Moderator, Report, Topic, TopicBan, TopicTag, Post, PostTag, Comment, TopicTagCategory, UserProfile, Vote
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Inlines
class ModeratorInline(admin.TabularInline):
    model = Moderator
    extra = 1

class TopicBanInline(admin.TabularInline):
    model = TopicBan
    extra = 0
    fk_name = 'user'
    readonly_fields = ('banned_by',)

# Topic and tags
@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'creator', 'is_locked', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ModeratorInline]

@admin.register(TopicTagCategory)
class TopicTagCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(TopicTag)
class TopicTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'category') 
    list_filter = ('category',)        
    search_fields = ('name',)

# Post and tags
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'topic', 'created_at', 'score', 'is_locked')
    list_filter = ('topic', 'created_at', 'is_locked')
    search_fields = ('title', 'content')

@admin.register(PostTag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)

# Interactions
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'post', 'created_at', 'score', 'is_locked')

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_object', 'value')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user',)

# Mod and role management
@admin.register(Moderator)
class ModeratorAdmin(admin.ModelAdmin):
    list_display = ('user', 'topic', 'role', 'created_at')
    list_filter = ('role', 'topic')
    search_fields = ('user__username', 'topic__name')
    list_editable = ('role',)

@admin.register(TopicBan)
class TopicBanAdmin(admin.ModelAdmin):
    list_display = ('user', 'topic', 'banned_by', 'created_at')
    search_fields = ('user__username', 'topic__name')
    raw_id_fields = ('user',)

# User admin
class UserAdmin(BaseUserAdmin):
    inlines = [ModeratorInline, TopicBanInline]

# User re-register
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'reason', 'status', 'created_at')
    list_filter = ('status', 'reason')
    readonly_fields = ('created_at',)