import { ListGroup } from 'react-bootstrap';
import CommentItem from './CommentItem';

function CommentList({
  comments,
  userCommentVote,
  handleVoteComment,
  handleUpdateComment,
  handleDeleteComment,
}) {
  return (
    <ListGroup variant="flush">
      {comments.length > 0 ? (
        comments.map((comment) => (
          <ListGroup.Item key={comment.id}>
            <CommentItem
              comment={comment}
              userCommentVote={userCommentVote[comment.id]}
              handleVoteComment={handleVoteComment}
              handleUpdateComment={handleUpdateComment}
              handleDeleteComment={handleDeleteComment}
            />
          </ListGroup.Item>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </ListGroup>
  );
}

export default CommentList;
