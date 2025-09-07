import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';

import searchPosts from '../utils/searchPosts';
import VoteButtonGroup from './VoteButtonGroup';

const PostCard = ({ post, handlePostClick, refreshVotedPost, getPosts }) => {
  const userId = Number(localStorage.getItem('user_id'));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [userPostVote, setUserPostVote] = useState(
    post.votes.find((vote) => vote.user_id === userId)?.value || null
  );
  const navigate = useNavigate();

  const handlePostVote = async (voteType) => {
    const newVoteType = userPostVote === voteType ? null : voteType;

    try {
      await api.post(`/api/posts/${post.id}/vote/`, {
        post: post.id,
        vote_type: newVoteType,
      });

      setUserPostVote(newVoteType);

      refreshVotedPost(post.id);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleTagClick = (tagName) => {
    searchPosts(tagName, navigate);
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
              totalVotes={post.total_votes}
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
            <div className="d-flex">
              <Button
                variant="outline-primary"
                size="sm"
                className="ms-2"
                onClick={handleEditClick}
              >
                Edit
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="ms-2"
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
