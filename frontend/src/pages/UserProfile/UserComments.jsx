import { Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const UserComments = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <p>No comments available.</p>;
  }

  return (
    <ListGroup>
      {comments.map((comment) => (
        <ListGroup.Item key={comment.id}>
          <Card>
            <Card.Body>
              <Card.Text>{comment.content}</Card.Text>
              <Card.Text>
                <small className="text-muted">
                  On post:{' '}
                  <Link to={`/comments/${comment.post_id}`}>
                    {comment.post_title}
                  </Link>
                </small>
              </Card.Text>
            </Card.Body>
          </Card>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default UserComments;
