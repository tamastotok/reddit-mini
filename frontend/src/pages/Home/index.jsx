import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PostCard from '../../components/PostCard';
import CategorySelect from '../../components/Post/CategorySelect';
import LoadingOverlay from '../../components/LoadingOverlay';
import SortSelect from '../../components/SortSelect';

function Home() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  const navigate = useNavigate();

  const disableSelectedElement = () => {
    if (document.activeElement && document.activeElement.tagName === 'SELECT') {
      document.activeElement.blur();
    }
  };

  const getPosts = async () => {
    try {
      setLoading(true);

      const url = `/api/posts/?${
        category ? `category=${category}&` : ''
      }sort=${sortBy}`;
      const res = await api.get(url);

      setPosts(res.data);
      disableSelectedElement();
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sortBy]);

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
      {loading && <LoadingOverlay />}
      <div className="d-flex gap-2 align-items-center mb-3">
        <CategorySelect
          category={category}
          setCategory={setCategory}
          showAllOption
        />
        <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
      </div>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            handlePostClick={(postId) => navigate(`/post/${postId}`)}
            onRefreshPost={getPosts}
            onRefreshVotes={refreshVotedPost}
          />
        ))
      )}
    </div>
  );
}

export default Home;
