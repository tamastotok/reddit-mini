import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';

import { searchPosts } from '../utils/searchPosts';
import VoteButtonGroup from './VoteButtonGroup';
import EditDeleteButtons from './EditDeleteButtons';

import { deletePost, votePost } from '../services/posts';

const PostCard = ({ post, handlePostClick, onRefreshPost }) => {
  const userId = Number(localStorage.getItem('user_id'));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // track user vote + vote counts locally
  const [userPostVote, setUserPostVote] = useState(
    post.votes.find((vote) => vote.user_id === userId)?.value || null
  );
  const [voteCounts, setVoteCounts] = useState({
    total: post.total_votes,
    upvotes: post.upvotes ?? 0,
    downvotes: post.downvotes ?? 0,
  });

  const navigate = useNavigate();

  // --- Voting ---
  const handlePostVote = async (voteType) => {
    const newVoteType = userPostVote === voteType ? null : voteType;

    try {
      const res = await votePost(post.id, newVoteType);

      setUserPostVote(newVoteType);

      // Update local state instead of mutating props
      if (res.data?.total_votes !== undefined) {
        setVoteCounts({
          total: res.data.total_votes,
          upvotes: res.data.upvotes,
          downvotes: res.data.downvotes,
        });
      }

      // Trigger parent refresh if needed
      if (onRefreshPost) await onRefreshPost();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // --- Tags ---
  const handleTagClick = (tagName) => {
    searchPosts(tagName, navigate);
  };

  // --- Edit ---
  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/post/${post.id}/edit`);
  };

  // --- Delete ---
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setPostToDelete(post);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePost(postToDelete.id);
      setShowDeleteModal(false);
      setPostToDelete(null);
      if (onRefreshPost) await onRefreshPost();
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
      <Card key={post.id} className="mb-5">
        <Card.Body
          onClick={() => handlePostClick(post.id)}
          style={{ cursor: 'pointer' }}
        >
          <Card.Title>{post.title}</Card.Title>
          <Card.Text>{post.content}</Card.Text>

          <div className="d-flex flex-wrap">
            {post.category && (
              <span className="badge bg-secondary mr-2">{post.category}</span>
            )}
          </div>
        </Card.Body>

        <Card.Footer className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <VoteButtonGroup
              userVote={userPostVote}
              totalVotes={voteCounts.total}
              onVote={handlePostVote}
            />

            <div className="d-flex align-items-center ms-4 me-4">
              <FontAwesomeIcon icon={faComments} className="me-2" />
              {post.comments_count > 0 ? post.comments_count : 0}
            </div>

            {post.tags.map((tag, index) => (
              <Badge
                key={index}
                pill
                bg="secondary"
                className="d-flex align-items-start me-2"
                style={{ cursor: 'pointer', height: '1.5rem' }}
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          {userId === post.author_id && (
            <EditDeleteButtons
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
        </Card.Footer>
      </Card>

      {/* Delete Confirmation Modal */}
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
