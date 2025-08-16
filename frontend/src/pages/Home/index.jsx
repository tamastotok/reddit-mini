import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PostCard from '../../components/PostCard';

function Home() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const getPosts = async () => {
    try {
      const res = await api.get('/api/posts/');
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  useEffect(() => {
    getPosts();
  }, []);

  const refreshVotedPost = async (postId) => {
    try {
      const res = await api.get(`/api/posts/${postId}/`);
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? res.data : post))
      );
    } catch (error) {
      console.error(
        'Error fetching post:',
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="container mt-4">
      <h3>All Posts</h3>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            handlePostClick={(postId) => navigate(`/comments/${postId}`)}
            refreshVotedPost={refreshVotedPost}
            getPosts={getPosts}
          />
        ))
      )}
    </div>
  );
}

export default Home;
