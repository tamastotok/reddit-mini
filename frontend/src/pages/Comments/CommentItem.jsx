import { useState } from 'react';
import { Button, Form, Badge } from 'react-bootstrap';
import VoteButtonGroup from '../../components/VoteButtonGroup';
import { timeAgo } from '../../utils/timeAgo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

function CommentItem({
  comment,
  userCommentVote,
  handleCommentVote,
  handleEditComment,
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
          onVote={(value) => handleCommentVote(comment.id, value)}
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
                  handleEditComment(comment.id, editedContent);
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
            <div
              className="d-flex align-items-center rounded-pill px-1 ms-2"
              style={{ padding: '5.75px 0px' }}
            >
              <Badge
                bg="secondary"
                pill
                className="me-2 hover-bg-primary"
                style={{ cursor: 'pointer' }}
                onClick={toggleEditMode}
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit
              </Badge>

              <Badge
                bg="secondary"
                pill
                className="hover-bg-danger"
                style={{ cursor: 'pointer' }}
                onClick={() => handleDeleteComment(comment.id)}
              >
                <FontAwesomeIcon icon={faTrash} />
                Delete
              </Badge>
            </div>
          ))}
      </div>
    </div>
  );
}

export default CommentItem;
