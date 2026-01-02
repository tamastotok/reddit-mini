import { useState } from 'react';
import { Form, Badge } from 'react-bootstrap';
import VoteButtonGroup from '../../components/VoteButtonGroup';
import { timeAgo } from '../../utils/timeAgo';
import EditDeleteButtons from '../../components/EditDeleteButtons';
import CommentList from './CommentList';

function CommentItem({
  comment,
  userCommentVote,
  handleVoteComment,
  handleUpdateComment,
  handleDeleteComment,
  handleCreateReply,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const authorId = comment.author_id;
  const userId = Number(localStorage.getItem('user_id'));

  const toggleEditMode = () => setIsEditing((prev) => !prev);
  const toggleReplyMode = () => setIsReplying((prev) => !prev);

  if (isCollapsed) {
    return (
      <div
        className="py-1 px-2 border-start ms-2 text-muted"
        style={{ cursor: 'pointer', fontSize: '0.85rem' }}
        onClick={() => setIsCollapsed(false)}
      >
        <strong>[+] {comment.author_username}</strong>{' '}
        <small>• Thread collapsed</small>
      </div>
    );
  }

  return (
    <div className="comment-thread mb-2">
      <div className="comment-main p-2">
        <div style={{ cursor: 'pointer' }} onClick={() => setIsCollapsed(true)}>
          <small>
            <strong>{comment.author_username}</strong>
            <span className="text-muted">{` • ${timeAgo(
              comment.updated_at
            )} [-]`}</span>
          </small>
        </div>

        {isEditing ? (
          <Form.Control
            as="textarea"
            rows={2}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="my-2"
          />
        ) : (
          <p className="my-1" style={{ whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </p>
        )}

        <div className="d-flex align-items-center">
          <VoteButtonGroup
            userVote={userCommentVote}
            totalVotes={comment.total_votes}
            onVote={(value) => handleVoteComment(comment.id, value)}
          />

          <Badge
            bg="light"
            text="dark"
            pill
            className="ms-2 hover-bg-primary border"
            style={{ cursor: 'pointer' }}
            onClick={toggleReplyMode}
          >
            Reply
          </Badge>

          {authorId === userId &&
            (isEditing ? (
              <div className="d-flex align-items-center ms-2">
                <Badge
                  bg="secondary"
                  pill
                  className="me-1 hover-bg-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    handleUpdateComment(comment.id, editedContent.trim());
                    setIsEditing(false);
                  }}
                >
                  Save
                </Badge>
                <Badge
                  bg="light"
                  text="dark"
                  pill
                  className="border"
                  style={{ cursor: 'pointer' }}
                  onClick={toggleEditMode}
                >
                  Cancel
                </Badge>
              </div>
            ) : (
              <div className="ms-2">
                <EditDeleteButtons
                  onEdit={toggleEditMode}
                  onDelete={() => handleDeleteComment(comment.id)}
                />
              </div>
            ))}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="ms-3 my-2 border-start ps-3">
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="What are your thoughts?"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-2"
            />
            <div className="d-flex">
              <Badge
                bg="primary"
                pill
                className="me-2"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleCreateReply(comment.id, replyContent);
                  setReplyContent('');
                  setIsReplying(false);
                }}
              >
                Comment
              </Badge>
              <Badge
                bg="light"
                text="dark"
                pill
                className="border"
                style={{ cursor: 'pointer' }}
                onClick={toggleReplyMode}
              >
                Cancel
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ms-4 border-start ps-2">
          <CommentList
            comments={comment.replies}
            handleVoteComment={handleVoteComment}
            handleUpdateComment={handleUpdateComment}
            handleDeleteComment={handleDeleteComment}
            handleCreateReply={handleCreateReply}
          />
        </div>
      )}
    </div>
  );
}

export default CommentItem;
