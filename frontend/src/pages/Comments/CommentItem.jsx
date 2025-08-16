import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

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

      <div className="d-flex align-items-center mt-2">
        <Button
          variant={userCommentVote === 1 ? 'secondary' : 'outline-secondary'}
          size="sm"
          onClick={() => handleCommentVote(comment.id, 1)}
          className="mr-2"
        >
          Upvote
        </Button>

        <Button
          variant={userCommentVote === -1 ? 'secondary' : 'outline-secondary'}
          size="sm"
          onClick={() => handleCommentVote(comment.id, -1)}
          className="mr-2"
        >
          Downvote
        </Button>

        <span>Votes: {comment.total_votes}</span>
      </div>

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
