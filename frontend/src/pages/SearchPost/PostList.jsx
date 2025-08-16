import { ListGroup, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function PostList({ posts }) {
  const navigate = useNavigate();

  return (
    <ListGroup>
      {posts.length ? (
        posts.map((post) => (
          <ListGroup.Item key={post.id}>
            <Card>
              <Card.Body
                onClick={() => navigate(`/comments/${post.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Title>{post.title}</Card.Title>
                <Card.Text>{post.content}</Card.Text>
                <Card.Text className="text-muted">
                  Author: {post.author_username} | Category: {post.category}
                </Card.Text>
              </Card.Body>
            </Card>
          </ListGroup.Item>
        ))
      ) : (
        <p>No results found.</p>
      )}
    </ListGroup>
  );
}

export default PostList;