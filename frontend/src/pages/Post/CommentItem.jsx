import { useState } from 'react';
import { Form, Badge } from 'react-bootstrap';
import VoteButtonGroup from '../../components/VoteButtonGroup';
import { timeAgo } from '../../utils/timeAgo';
import EditDeleteButtons from '../../components/EditDeleteButtons';

function CommentItem({
  comment,
  userCommentVote,
  handleVoteComment,
  handleUpdateComment,
  handleDeleteComment,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const authorId = comment.author_id;
  const userId = Number(localStorage.getItem('user_id'));

  const toggleEditMode = () => setIsEditing((prev) => !prev);

  return (
    <div>
      <span>
        <strong>{comment.author_username}</strong>{' '}
        {` • ${timeAgo(comment.updated_at)}`}
      </span>

      {isEditing ? (
        <Form.Control
          as="textarea"
          rows={1}
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="my-2"
        />
      ) : (
        <p> {comment.content}</p>
      )}

      <div className="d-flex align-items-center">
        <VoteButtonGroup
          userVote={userCommentVote}
          totalVotes={comment.total_votes}
          onVote={(value) => handleVoteComment(comment.id, value)}
        />

        {authorId === userId &&
          (isEditing ? (
            <div
              className="d-flex align-items-center rounded-pill px-1 ms-2"
              style={{ padding: '5.75px 0px' }}
            >
              <Badge
                bg="secondary"
                pill
                style={{ cursor: 'pointer' }}
                className="me-2 hover-bg-primary"
                onClick={() => {
                  handleUpdateComment(comment.id, editedContent.trim());
                  toggleEditMode();
                }}
              >
                Send
              </Badge>
              <Badge
                bg="secondary"
                pill
                style={{ cursor: 'pointer' }}
                className="hover-bg-danger"
                onClick={toggleEditMode}
              >
                Back
              </Badge>
            </div>
          ) : (
            <EditDeleteButtons
              onEdit={toggleEditMode}
              onDelete={() => handleDeleteComment(comment.id)}
            />
          ))}
      </div>
    </div>
  );
}

export default CommentItem;
