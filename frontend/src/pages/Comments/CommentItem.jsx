import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import VoteButtonGroup from '../../components/VoteButtonGroup';

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
      <strong>{comment.author_username}:</strong>

      {isEditing ? (
        <Form.Control
          as="textarea"
          rows={1}
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="my-2"
        />
      ) : (
        <span> {comment.content}</span>
      )}

      <VoteButtonGroup
        userVote={userCommentVote}
        totalVotes={comment.total_votes}
        onVote={(value) => handleCommentVote(comment.id, value)}
      />

      {authorId === userId && (
        <div className="d-flex align-items-center mt-2">
          {isEditing ? (
            <>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  handleEditComment(comment.id, editedContent);
                  toggleEditMode();
                }}
                className="p-0"
              >
                Send
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={toggleEditMode}
                className="p-0 ml-2"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="link"
                size="sm"
                onClick={toggleEditMode}
                className="p-0 mr-2"
              >
                Edit
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => handleDeleteComment(comment.id)}
                className="p-0"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentItem;
