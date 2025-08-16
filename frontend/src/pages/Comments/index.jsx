import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import api from '../../utils/api';
import PostCard from '../../components/PostCard';
import CommentList from './CommentList';

function Comments() {
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [userPostVote, setUserPostVote] = useState({});
  const [userCommentVote, setUserCommentVote] = useState({});
  const { postId } = useParams();
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem('user_id'));

  const refreshVotedPost = async (id) => {
    try {
      const res = await api.get(`/api/posts/${id}/`);
      setPost(res.data);
      setComments(res.data.comments);

      const commentVotesMap = {};

      res.data.comments.forEach((comment) => {
        comment.votes.forEach((vote) => {
          if (vote.user_id === userId) {
            commentVotesMap[comment.id] = vote.value;
          }
        });
      });

      setUserCommentVote(commentVotesMap);
    } catch (error) {
      console.error('Error fetching post:', error.message);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const getPost = async () => {
      try {
        const res = await api.get(`/api/comments/${postId}/`);
        if (isMounted) {
          setPost(res.data);
          setComments(res.data.comments);

          const userPostVoteMap = {};
          res.data.votes.forEach((vote) => {
            if (vote.user_id === userId) {
              userPostVoteMap[postId] = vote.value;
            }
          });
          setUserPostVote(userPostVoteMap);

          const userCommentVoteMap = {};
          res.data.comments.forEach((comment) => {
            comment.votes.forEach((vote) => {
              if (vote.user_id === userId) {
                userCommentVoteMap[comment.id] = vote.value;
              }
            });
          });

          setUserCommentVote(userCommentVoteMap);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    getPost();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handlePostVote = async (postId, voteType) => {
    const currentVote = userPostVote[postId];
    const newVoteType = currentVote === voteType ? null : voteType;

    try {
      await api.post(`/api/posts/${postId}/vote/`, {
        post: postId,
        vote_type: newVoteType,
      });
      setUserPostVote((prevVotes) => ({
        ...prevVotes,
        [postId]: newVoteType,
      }));
      refreshVotedPost(postId);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/api/comments/${postId}/create/`, {
        content: commentText,
      });

      setComments([...comments, res.data]);
      setCommentText('');
      refreshVotedPost(postId);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleEditComment = async (commentId, content) => {
    if (!content.trim()) return;

    try {
      const res = await api.put(
        `/api/comments/${postId}/update/${commentId}/`,
        { content }
      );

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? res.data : comment
        )
      );
      setCommentText(''); 
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/api/comments/${postId}/delete/${commentId}/`);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleCommentVote = async (commentId, voteType) => {
    const currentVote = userCommentVote[commentId];
    const newVoteType = currentVote === voteType ? null : voteType;

    try {
      await api.post(`/api/comments/${postId}/${commentId}/vote/`, {
        vote_type: newVoteType,
      });
      setUserCommentVote((prevVotes) => ({
        ...prevVotes,
        [commentId]: newVoteType,
      }));
      refreshVotedPost(postId);
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  return post ? (
    <div className="container mt-4">
      <PostCard
        post={post}
        handlePostClick={(postId) => navigate(`/comments/${postId}`)}
        handleVote={handlePostVote}
        userVotes={userPostVote}
      />

      <h5>Comments</h5>
      <Form className="mb-3">
        <Form.Group controlId="commentText">
          <Form.Control
            as="textarea"
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSendComment} className="mr-2">
          Send
        </Button>
        <Button variant="secondary" onClick={() => setCommentText('')}>
          Cancel
        </Button>
      </Form>

      <CommentList
        comments={comments}
        userCommentVote={userCommentVote}
        handleCommentVote={handleCommentVote}
        handleEditComment={handleEditComment}
        handleDeleteComment={handleDeleteComment}
      />
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default Comments;
