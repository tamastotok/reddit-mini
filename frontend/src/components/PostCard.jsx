import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Badge, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faChevronUp,
  faChevronDown,
  faEdit,
  faTrash,
  faPlus,
  faEllipsisH,
  faLock,
  faUnlock,
  faFlag,
} from '@fortawesome/free-solid-svg-icons';

import { deletePost, votePost } from '../services/posts';
import { lockPost } from '../services/moderation';
import { toggleSubscribe } from '../services/topics';
import { UserContext } from '../context/UserContext';
import { getPermissions } from '../utils/permissions';
import ReportComponent from './ReportComponent';

const DeleteConfirmModal = ({ show, onHide, onConfirm }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton className="border-0">
      <Modal.Title className="h5">Are you sure you want to delete?</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-muted">
      This action cannot be undone. The post will be permanently deleted.
    </Modal.Body>
    <Modal.Footer className="border-0">
      <Button variant="light" onClick={onHide} className="rounded-pill px-4">
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={onConfirm}
        className="rounded-pill px-4"
      >
        Delete
      </Button>
    </Modal.Footer>
  </Modal>
);

const PostCard = ({ post: initialPost, handlePostClick, onRefreshPost }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem('user_id'));
  const [post, setPost] = useState(initialPost);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalVotes, setTotalVotes] = useState(initialPost.total_votes || 0);
  const [isSubscribed, setIsSubscribed] = useState(
    initialPost.topic_is_subscribed,
  );
  const [userPostVote, setUserPostVote] = useState(
    initialPost.votes?.find((v) => v.user_id === userId)?.value || null,
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const { canDelete, canLock, isMod } = getPermissions(
    user,
    post.topic,
    post.author_id,
  );

  // Sync if props are refreshed
  useEffect(() => {
    setPost(initialPost);
    setTotalVotes(initialPost.total_votes || 0);
    setIsSubscribed(initialPost.topic_is_subscribed);
  }, [initialPost]);

  const handleVote = async (e, value) => {
    e.stopPropagation();
    const newValue = userPostVote === value ? null : value;
    try {
      const res = await votePost(post.id, newValue);
      setUserPostVote(newValue);
      setTotalVotes(res.data.total_votes);
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

  const handleLockToggle = async (e) => {
    e.stopPropagation();
    try {
      await lockPost(post.id);
      setPost((prev) => ({ ...prev, is_locked: !prev.is_locked }));
    } catch (error) {
      alert('Failed to toggle lock status.', error);
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
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <Card
        className="mb-3 border-0 shadow-sm post-card-hover"
        style={{ borderRadius: '8px', overflow: 'hidden' }}
      >
        <div className="d-flex">
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
              style={{ cursor: 'pointer', fontSize: '1.2rem' }}
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
              style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            />
          </div>

          <div
            className="flex-grow-1 p-3"
            onClick={() => handlePostClick(post.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-start mb-1">
              <div className="d-flex align-items-center small">
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
                  • Posted by u/{post.author_name} •{' '}
                  {formatTime(post.created_at)}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                {userId && !isSubscribed && post.topic_slug !== 'all' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-pill py-0 px-3 fw-bold"
                    style={{ fontSize: '0.75rem', height: '24px' }}
                    onClick={handleJoin}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-1" /> Join
                  </Button>
                )}

                <Dropdown align="end" onClick={(e) => e.stopPropagation()}>
                  <Dropdown.Toggle
                    as="div"
                    className="p-1 px-2 rounded-circle bg-hover shadow-none border-0"
                  >
                    <FontAwesomeIcon
                      icon={faEllipsisH}
                      className="text-muted"
                    />
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow-sm border-0">
                    {userId === post.author_id && (
                      <Dropdown.Item
                        onClick={() => navigate(`/post/${post.id}/edit`)}
                      >
                        <FontAwesomeIcon
                          icon={faEdit}
                          className="me-2 text-muted"
                        />{' '}
                        Edit Post
                      </Dropdown.Item>
                    )}

                    {canLock && (
                      <Dropdown.Item onClick={handleLockToggle}>
                        <FontAwesomeIcon
                          icon={post.is_locked ? faUnlock : faLock}
                          className="me-2 text-muted"
                        />
                        {post.is_locked ? 'Unlock Post' : 'Lock Post'}
                      </Dropdown.Item>
                    )}

                    {userId && userId !== post.author_id && (
                      <Dropdown.Item className="text-warning">
                        <FontAwesomeIcon icon={faFlag} className="me-2" />{' '}
                        Report
                      </Dropdown.Item>
                    )}

                    {canDelete && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => setShowDeleteModal(true)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="me-2" />{' '}
                          Delete Post
                        </Dropdown.Item>
                      </>
                    )}

                    {isMod && (
                      <>
                        <Dropdown.Divider />
                        <div className="px-3 py-1 small text-info fw-bold">
                          🛡️ Moderator Tools
                        </div>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            <Card.Title className="fw-bold mb-2 h5 d-flex align-items-center">
              {post.title}
              {post.is_locked && (
                <FontAwesomeIcon
                  icon={faLock}
                  className="ms-2 text-warning"
                  style={{ fontSize: '0.9rem' }}
                  title="Locked"
                />
              )}
            </Card.Title>

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
              className="d-flex align-items-center text-muted fw-bold"
              style={{ fontSize: '0.8rem' }}
            >
              <div className="bg-hover p-1 px-2 rounded">
                <FontAwesomeIcon icon={faComments} className="me-2" />
                {post.comments_count || 0} Comments
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ReportComponent
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        postId={post.id}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default PostCard;
