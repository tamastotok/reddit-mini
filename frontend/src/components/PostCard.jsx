import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Badge } from 'react-bootstrap';
import api from '../utils/api';

const PostCard = ({ post, handlePostClick, refreshVotedPost, getPosts }) => {
  const userId = Number(localStorage.getItem('user_id'));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [userVote, setUserVote] = useState(
    post.votes.find((vote) => vote.user_id === userId)?.value || null
  );
  const navigate = useNavigate();

  const handleVote = async (voteType) => {
    const newVoteType = userVote === voteType ? null : voteType;

    try {
      await api.post(`/api/posts/${post.id}/vote/`, {
        post: post.id,
        vote_type: newVoteType,
      });

      setUserVote(newVoteType);

      refreshVotedPost(post.id);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/post/${post.id}/edit`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setPostToDelete(post);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/post/${postToDelete.id}/delete/`);
      setShowDeleteModal(false);
      setPostToDelete(null);
      getPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  return (
    <>
      <Card key={post.id} className="mb-3">
        <Card.Body
          onClick={() => handlePostClick(post.id)}
          style={{ cursor: 'pointer' }}
        >
          <Card.Title>{post.title}</Card.Title>
          <Card.Text>
            {post.content}
          </Card.Text>

          <div className="d-flex flex-wrap">
            {post.category && (
              <span className="badge bg-secondary mr-2">{post.category}</span>
            )}
          </div>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-between align-items-center">
          <div>
            <Button
              variant={userVote === 1 ? 'secondary' : 'outline-secondary'}
              onClick={(e) => {
                e.stopPropagation();
                handleVote(1);
              }}
            >
              <i className="bi bi-arrow-up-circle" />{' '}
            </Button>
            <span className="mx-2">{post.total_votes}</span>
            <Button
              variant={userVote === -1 ? 'secondary' : 'outline-secondary'}
              onClick={(e) => {
                e.stopPropagation();
                handleVote(-1);
              }}
            >
              <i className="bi bi-arrow-down-circle" />{' '}
            </Button>
          </div>
          <div className="d-flex flex-wrap">
            {post.tags.map((tag, index) => (
              <Badge
                key={index}
                pill
                bg="secondary"
                className="me-2 mb-2"
                style={{ cursor: 'pointer' }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
          <div>
            Comments: {post.comments_count > 0 ? post.comments_count : 0}
          </div>

          {userId === post.author_id && (
            <div className="d-flex">
              <Button
                variant="outline-primary"
                size="sm"
                className="ml-2"
                onClick={handleEditClick}
              >
                Edit
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="ml-2"
                onClick={handleDeleteClick}
              >
                Delete
              </Button>
            </div>
          )}
        </Card.Footer>
      </Card>

      <Modal show={showDeleteModal} onHide={handleDeleteCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete {postToDelete?.title}?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PostCard;
