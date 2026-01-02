import { NavLink, useNavigate } from 'react-router-dom';
import { ListGroup, Card, Spinner, Button } from 'react-bootstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useFetchTopics from '../hooks/useFetchTopics';

function Sidebar() {
  const { topics, loading } = useFetchTopics();
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  if (loading) {
    return (
      <Spinner animation="border" size="sm" className="d-block mx-auto my-3" />
    );
  }

  const subscribedTopics = topics.filter((topic) => topic.is_subscribed);

  const navLinkStyle = ({ isActive }) => ({
    backgroundColor: isActive ? '#f8f9fa' : 'transparent',
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: 'none',
    color: 'inherit',
    borderRadius: '8px',
    margin: '2px 0',
  });

  return (
    <Card
      className="border-0 shadow-sm"
      style={{ borderRadius: '15px', position: 'sticky', top: '20px' }}
    >
      <div className="p-3">
        {/* Create button - only for logged in users*/}
        {token && (
          <Button
            variant="outline-primary"
            className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2 rounded-pill fw-bold"
            onClick={() => navigate('/create-topic')}
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Community
          </Button>
        )}

        <Card.Header className="bg-white border-0 p-0 mb-2">
          <h6
            className="text-muted text-uppercase mb-0"
            style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
          >
            Feeds
          </h6>
        </Card.Header>

        <ListGroup variant="flush">
          <ListGroup.Item
            as={NavLink}
            to="/"
            className="border-0 py-2 d-flex align-items-center"
            style={navLinkStyle}
          >
            <span className="me-2">🏠</span> Home
          </ListGroup.Item>
          <ListGroup.Item
            as={NavLink}
            to="/r/all"
            className="border-0 py-2 d-flex align-items-center"
            style={navLinkStyle}
          >
            <span className="me-2">🌎</span> All
          </ListGroup.Item>
        </ListGroup>

        <hr className="my-3 text-muted" />

        {/* Communities - only subscribed topics and logged in users */}
        <Card.Header className="bg-white border-0 p-0 mb-2">
          <h6
            className="text-muted text-uppercase mb-0"
            style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
          >
            Your Communities
          </h6>
        </Card.Header>

        <ListGroup
          variant="flush"
          style={{ maxHeight: '400px', overflowY: 'auto' }}
        >
          {subscribedTopics.length > 0 ? (
            subscribedTopics.map((topic) => (
              <ListGroup.Item
                key={topic.id}
                as={NavLink}
                to={`/r/${topic.slug}`}
                className="border-0 py-2 d-flex align-items-center"
                style={navLinkStyle}
              >
                <span className="me-2 text-primary">#</span>
                <span className="text-truncate">r/{topic.name}</span>
              </ListGroup.Item>
            ))
          ) : (
            <div className="p-2 text-muted small italic">
              {token
                ? "You haven't joined any communities yet."
                : 'Log in to see your communities.'}
            </div>
          )}
        </ListGroup>
      </div>
    </Card>
  );
}

export default Sidebar;
