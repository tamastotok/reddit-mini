import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Stack,
  Badge as BootstrapBadge,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSignOutAlt,
  faShieldHalved,
  faGear,
  faLock,
  faUnlock,
} from '@fortawesome/free-solid-svg-icons';

import Sidebar from '../../components/SideBar';
import PostCard from '../../components/PostCard';
import api from '../../services/api';
import { UserContext } from '../../context/UserContext';
import { getPermissions } from '../../utils/permissions';

const TopicDetail = () => {
  const { slug } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch permissions (after topic loads)
  const { isMod, isAdmin } = topic
    ? getPermissions(user, topic.id)
    : { isMod: false, isAdmin: false };

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      const [topicRes, postsRes] = await Promise.all([
        api.get(`/api/topics/${slug}/`),
        api.get(`/api/topics/${slug}/posts/`),
      ]);
      setTopic(topicRes.data);
      setPosts(postsRes.data);
      console.log(topicRes.data, isAdmin, isMod);
    } catch (err) {
      console.error('Error loading topic:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleTopicLockToggle = async () => {
    try {
      const res = await api.post(`/api/topics/${topic.id}/lock/`);
      setTopic({ ...topic, is_locked: !topic.is_locked });
      alert(res.data.message);
    } catch (err) {
      console.error('Lock error:', err);
      alert('Nem sikerült módosítani a közösség állapotát.');
    }
  };

  const handleLeave = async () => {
    try {
      await api.post(`/api/topics/${slug}/subscribe/`);
      setTopic({ ...topic, is_subscribed: false });
      window.dispatchEvent(new Event('communitiesUpdated'));
      navigate('/r/all');
    } catch (err) {
      console.error('Error leaving topic:', err);
    }
  };

  if (loading)
    return <Spinner className="d-block mx-auto mt-5" color="primary" />;
  if (!topic)
    return <div className="text-center mt-5">Community not found.</div>;

  return (
    <Container className="py-4">
      <Row>
        {/* Left Sidebar */}
        <Col lg={3} className="d-none d-lg-block">
          <Sidebar />
        </Col>

        {/* Middle Feed */}
        <Col lg={6} md={8}>
          <div className="d-flex align-items-center mb-4">
            <h3 className="mb-0">r/{topic.name}</h3>
            {topic.is_locked && (
              <BootstrapBadge
                bg="warning"
                text="dark"
                className="ms-2 px-3 rounded-pill"
              >
                <FontAwesomeIcon icon={faLock} className="me-1" /> Locked
              </BootstrapBadge>
            )}
          </div>

          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onRefreshPost={fetchTopicData}
                handlePostClick={(id) => navigate(`/post/${id}`)}
              />
            ))
          ) : (
            <Card className="p-5 text-center text-muted border-0 shadow-sm rounded-4">
              No posts in this community yet. Be the first!
            </Card>
          )}
        </Col>

        {/* Right Community Info */}
        <Col lg={3} md={4}>
          <Card
            className="border-0 shadow-sm rounded-4 sticky-top"
            style={{ top: '80px' }}
          >
            <Card.Header className="bg-primary text-white fw-bold py-3 rounded-top-4">
              About Community
            </Card.Header>
            <Card.Body>
              <Card.Text className="mb-3 text-secondary">
                {topic.description || 'No description provided.'}
              </Card.Text>

              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted small">Members:</span>
                <span className="fw-bold">{topic.subscribers_count}</span>
              </div>

              <Stack gap={2}>
                {/* Create post: disabled if the topic is closed, except mods */}
                <Button
                  variant="primary"
                  className="rounded-pill fw-bold"
                  disabled={topic.is_locked && !isMod}
                  onClick={() =>
                    navigate('/post/create', {
                      state: { selectedTopicId: topic.id },
                    })
                  }
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create Post
                </Button>

                {/* MOD ONLY */}
                {/* Mod buttons */}
                {isMod && (
                  <Button
                    variant="outline-info"
                    className="rounded-pill fw-bold"
                    onClick={() =>
                      navigate(`/r/${topic.slug}/mod-queue/${topic.id}`)
                    }
                  >
                    <FontAwesomeIcon icon={faShieldHalved} className="me-2" />
                    Mod Queue
                    <BootstrapBadge />
                  </Button>
                )}

                {/* Topic settings */}
                {isAdmin && (
                  <Button
                    variant="outline-dark"
                    className="rounded-pill fw-bold"
                  >
                    <FontAwesomeIcon icon={faGear} className="me-2" />
                    Topic Settings
                  </Button>
                )}

                {/* Topic lock */}
                {isAdmin && (
                  <Button
                    variant={
                      topic.is_locked ? 'outline-success' : 'outline-warning'
                    }
                    className="rounded-pill fw-bold"
                    onClick={handleTopicLockToggle}
                  >
                    <FontAwesomeIcon
                      icon={topic.is_locked ? faUnlock : faLock}
                      className="me-2"
                    />
                    {topic.is_locked ? 'Unlock Topic' : 'Lock Topic'}
                  </Button>
                )}

                {topic.is_subscribed && (
                  <Button
                    variant="outline-secondary"
                    className="rounded-pill fw-bold mt-2"
                    size="sm"
                    onClick={handleLeave}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Leave Community
                  </Button>
                )}
              </Stack>
            </Card.Body>
            <Card.Footer className="bg-white text-muted small border-0 py-3 rounded-bottom-4">
              <div className="d-flex justify-content-between">
                <span>Created:</span>
                <span>{new Date(topic.created_at).toLocaleDateString()}</span>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TopicDetail;
