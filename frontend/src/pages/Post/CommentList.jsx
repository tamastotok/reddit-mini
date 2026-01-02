import { ListGroup } from 'react-bootstrap';
import CommentItem from './CommentItem';

function CommentList({
  comments,
  handleVoteComment,
  handleUpdateComment,
  handleDeleteComment,
  handleCreateReply,
}) {
  return (
    <ListGroup variant="flush" className="border-0">
      {comments && comments.length > 0
        ? comments.map((comment) => (
            <ListGroup.Item key={comment.id} className="border-0 pb-0 pe-0">
              <CommentItem
                comment={comment}
                userCommentVote={comment.user_vote}
                handleVoteComment={handleVoteComment}
                handleUpdateComment={handleUpdateComment}
                handleDeleteComment={handleDeleteComment}
                handleCreateReply={handleCreateReply}
              />
            </ListGroup.Item>
          ))
        : null}
    </ListGroup>
  );
}

export default CommentList;
