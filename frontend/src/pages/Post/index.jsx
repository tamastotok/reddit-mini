import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import PostCard from '../../components/PostCard';
import CommentList from './CommentList';
import { getPostById } from '../../services/posts';
import {
  createComment,
  updateComment,
  deleteComment,
  voteComment,
} from '../../services/comments';

function Post() {
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [userCommentVote, setUserCommentVote] = useState({});
  const [isFocused, setIsFocused] = useState(false);
  const { postId } = useParams();
  const navigate = useNavigate();
  //const userId = Number(localStorage.getItem('user_id'));

  const updateCommentInTree = (comments, id, updatedData) => {
    return comments.map((comment) => {
      if (comment.id === id) {
        return { ...comment, ...updatedData };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, id, updatedData),
        };
      }
      return comment;
    });
  };

  const deleteCommentFromTree = (comments, id) => {
    return comments
      .filter((comment) => comment.id !== id)
      .map((comment) => ({
        ...comment,
        replies: comment.replies
          ? deleteCommentFromTree(comment.replies, id)
          : [],
      }));
  };

  const fetchPostData = async (id) => {
    try {
      const res = await getPostById(id);
      setPost(res.data);

      const rootComments = res.data.comments.filter((c) => c.parent === null);
      setComments(rootComments);

      const commentVotesMap = {};
      const collectVotes = (items) => {
        items.forEach((c) => {
          commentVotesMap[c.id] = c.user_vote;
          if (c.replies) collectVotes(c.replies);
        });
      };
      collectVotes(res.data.comments);
      setUserCommentVote(commentVotesMap);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPostData(postId);
  }, [postId]);

  // --- COMMENT CRUD ---
  const handleCreateComment = async (parentId = null, text = commentText) => {
    if (!text.trim()) return;
    try {
      const res = await createComment(postId, {
        content: text,
        parent: parentId,
      });

      if (parentId) {
        setComments((prev) =>
          updateCommentInTree(prev, parentId, {
            replies: [
              ...(comments.find((c) => c.id === parentId)?.replies || []),
              res.data,
            ],
          })
        );
        fetchPostData(postId);
      } else {
        setComments((prev) => [...prev, res.data]);
        setCommentText('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      const res = await updateComment(commentId, { content });
      setComments((prev) => updateCommentInTree(prev, commentId, res.data));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(postId, commentId);
      setComments((prev) => deleteCommentFromTree(prev, commentId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleVoteComment = async (commentId, voteType) => {
    const currentVote = userCommentVote[commentId];
    const newVoteType = currentVote === voteType ? null : voteType;

    try {
      const res = await voteComment(commentId, newVoteType);

      setUserCommentVote((prev) => ({ ...prev, [commentId]: newVoteType }));

      // Rekurzív frissítés a fában
      setComments((prev) =>
        updateCommentInTree(prev, commentId, {
          total_votes: res.data.total_votes,
          user_vote: newVoteType,
        })
      );
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // --- UI helpers ---
  const showActions = isFocused || commentText.trim().length > 0;
  const handleCancel = () => {
    setCommentText('');
    setIsFocused(false);
  };

  return post ? (
    <div className="container mt-4 mp-5 pe-5">
      <PostCard
        post={post}
        handlePostClick={(postId) => navigate(`/comments/${postId}`)}
        onRefreshPost={() => fetchPostData(postId)}
        onRefreshVotes={() => fetchPostData(postId)}
      />

      <Form className="mb-3">
        <Form.Group controlId="commentText">
          <Form.Control
            as="textarea"
            rows={showActions ? 3 : 1}
            value={commentText}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Join the conversation"
            className="transition-height"
            style={{ borderRadius: '20px' }}
          />
        </Form.Group>

        {showActions && (
          <div className="mt-2 d-flex justify-content-end">
            <Button
              className="me-2 rounded-pill"
              variant="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="rounded-pill"
              variant="primary"
              onClick={() => handleCreateComment()}
            >
              Comment
            </Button>
          </div>
        )}
      </Form>

      <CommentList
        comments={comments}
        userCommentVote={userCommentVote}
        handleVoteComment={handleVoteComment}
        handleUpdateComment={handleUpdateComment}
        handleDeleteComment={handleDeleteComment}
        handleCreateReply={handleCreateComment}
      />
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default Post;
