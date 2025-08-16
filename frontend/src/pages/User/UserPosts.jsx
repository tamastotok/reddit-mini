import { ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../components/PostCard';

const UserPosts = ({ posts }) => {
  const navigate = useNavigate();

  if (!posts || posts.length === 0) {
    return <p>No posts available.</p>;
  }

  const handleClick = (id) => {
    navigate(`/comments/${id}/`);
  };

  const refreshVotedPost = async (postId) => {
    navigate(`/user/${username}`);
  };

  return (
    <ListGroup>
      {posts.map((post) => (
        <ListGroup.Item key={post.id}>
          <PostCard
            onClick={() => handleClick(post.id)}
            post={post}
            handlePostClick={(postId) => navigate(`/comments/${postId}`)}
            refreshVotedPost={refreshVotedPost}
          />
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default UserPosts;
