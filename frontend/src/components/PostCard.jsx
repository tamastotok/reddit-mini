import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faChevronUp,
  faChevronDown,
  faEdit,
  faTrash,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { deletePost, votePost } from '../services/posts';
import { toggleSubscribe } from '../services/topics';

const PostCard = ({ post, handlePostClick, onRefreshPost }) => {
  const userId = Number(localStorage.getItem('user_id'));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userPostVote, setUserPostVote] = useState(
    post.votes?.find((vote) => vote.user_id === userId)?.value || null
  );
  const [totalVotes, setTotalVotes] = useState(post.total_votes || 0);
  const [isSubscribed, setIsSubscribed] = useState(post.topic_is_subscribed);
  const navigate = useNavigate();

  const handleVote = async (e, value) => {
    e.stopPropagation();
    const newValue = userPostVote === value ? null : value;
    try {
      const res = await votePost(post.id, newValue);
      setUserPostVote(newValue);
      setTotalVotes(res.data.total_votes);
      if (onRefreshPost) onRefreshPost();
    } catch (err) {
      console.error('Voting error', err);
    }
  };

  const handleJoin = async (e) => {
    e.stopPropagation();
    try {
      await toggleSubscribe(post.topic_slug);
      setIsSubscribed(true);
      window.dispatchEvent(new Event('communitiesUpdated'));

      if (onRefreshPost) onRefreshPost();
    } catch (err) {
      console.error('Join error', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePost(post.id);
      setShowDeleteModal(false);
      if (onRefreshPost) onRefreshPost();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <Card
        className="mb-3 border-0 shadow-sm post-card-hover"
        style={{ borderRadius: '8px', overflow: 'hidden' }}
      >
        <div className="d-flex">
          {/* Left Side */}
          <div
            className="d-flex flex-column align-items-center p-2 border-end bg-light"
            style={{ width: '48px' }}
          >
            <FontAwesomeIcon
              icon={faChevronUp}
              className={`vote-icon ${
                userPostVote === 1 ? 'text-primary' : 'text-muted'
              }`}
              onClick={(e) => handleVote(e, 1)}
              style={{ cursor: 'pointer', fontSize: '1.3rem' }}
            />
            <span
              className={`fw-bold my-1 ${
                userPostVote === 1
                  ? 'text-primary'
                  : userPostVote === -1
                  ? 'text-danger'
                  : ''
              }`}
            >
              {totalVotes}
            </span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`vote-icon ${
                userPostVote === -1 ? 'text-danger' : 'text-muted'
              }`}
              onClick={(e) => handleVote(e, -1)}
              style={{ cursor: 'pointer', fontSize: '1.3rem' }}
            />
          </div>

          {/* Right Side */}
          <div
            className="flex-grow-1 p-3"
            onClick={() => handlePostClick(post.id)}
            style={{ cursor: 'pointer' }}
          >
            {/* Header (r/topic & Join button) */}
            <div className="d-flex justify-content-between align-items-start mb-1">
              <div
                className="d-flex align-items-center"
                style={{ fontSize: '0.8rem' }}
              >
                <span
                  className="fw-bold text-dark me-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/r/${post.topic_slug}`);
                  }}
                >
                  r/{post.topic_slug || 'all'}
                </span>
                <span className="text-muted">
                  • Posted by u/{post.author_name}
                </span>
                <span className="text-muted ms-1">
                  {formatTime(post.created_at)}
                </span>
              </div>

              {/* Join Button: Only if the user is not subscribed and not OP*/}
              {userId && !isSubscribed && post.topic_slug !== 'all' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-pill py-0 px-3 fw-bold"
                  style={{ fontSize: '0.75rem', height: '24px' }}
                  onClick={handleJoin}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-1" />
                  Join
                </Button>
              )}
            </div>

            <Card.Title className="fw-bold mb-2 h5">{post.title}</Card.Title>

            <Card.Text
              className="text-secondary mb-3"
              style={{
                fontSize: '0.9rem',
                display: '-webkit-box',
                WebkitLineClamp: '3',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.content}
            </Card.Text>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {post.tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  pill
                  bg="light"
                  text="dark"
                  className="border fw-normal"
                >
                  # {tag.name}
                </Badge>
              ))}
            </div>

            <div
              className="d-flex align-items-center gap-3 text-muted fw-bold"
              style={{ fontSize: '0.8rem' }}
            >
              <div className="bg-hover p-1 px-2 rounded">
                <FontAwesomeIcon icon={faComments} className="me-2" />
                {post.comments_count || 0} Comments
              </div>

              {userId === post.author_id && (
                <div className="ms-auto d-flex gap-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-muted p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/post/${post.id}/edit`);
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h5">
            Are you sure you want to delete?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-muted">
          This action cannot be undone. The post will be permanently deleted.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="light"
            onClick={() => setShowDeleteModal(false)}
            className="rounded-pill px-4"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            className="rounded-pill px-4"
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PostCard;
