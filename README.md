URLs

POSTS:
posts/
api.get('/api/posts/', { params });

posts/{pk}/
api.get(`/api/post/${id}/`);

post/create/
api.post('/api/post/create/', data);

posts/{post_id}/vote/
api.post(`/api/post/${postId}/vote/`, { vote_type: voteType });

posts/{post_id}/update/
api.put(`/api/post/${id}/update/`, data);

post/{pk}/delete/
api.delete(`/api/post/${id}/delete/`);

COMMENTS:
**comments/{pk}/
**api.get(`/api/comments/${postId}/`);

comments/{post_id}/create/
api.post(`/api/post/${postId}/comment/create/`, data);

comments{post_id}/{comment_id}/vote/
api.post(`/api/comment/${commentId}/vote/`, { vote_type: voteType });

comments/{post_id}/update/{comment_id}/
api.put(`/api/comment/${commentId}/update/`, data);

comments/{post_id}/delete/{comment_id}/
api.delete(`/api/comment/${commentId}/delete/`);

SEARCH:
search/
api.get('/api/search/', { params: { q: query } });

CATEGORIES:
post/categories/
api.get('/api/post/categories/');

USER:
registerUser = (data) => api.post('/api/user/register/', data);

profile/{pk}/
api.get(`/api/profile/${userId}/`);

user-activity/{username}
api.get(`/api/user-activity/${username}/`);

user/{pk}/change-password/
api.put(`/api/user/${userId}/change-password/`, data);

user/{pk}/edit/
api.put(`/api/user/${userId}/edit/`, formData, {
headers: { 'Content-Type': 'multipart/form-data' },
});

user/{pk}/delete/
api.delete(`/api/user/${userId}/delete/`);
