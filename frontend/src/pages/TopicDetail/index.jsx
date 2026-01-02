import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Stack,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/SideBar';
import PostCard from '../../components/PostCard';
import api from '../../services/api';

const TopicDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      const [topicRes, postsRes] = await Promise.all([
        api.get(`/api/topics/${slug}/`),
        api.get(`/api/topics/${slug}/posts/`),
      ]);
      setTopic(topicRes.data);
      setPosts(postsRes.data);
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

  if (loading) return <Spinner className="d-block mx-auto mt-5" />;
  if (!topic)
    return <div className="text-center mt-5">Community not found.</div>;

  return (
    <Container className="py-4">
      <Row>
        <Col lg={3} className="d-none d-lg-block">
          <Sidebar />
        </Col>

        <Col lg={6} md={8}>
          <h3 className="mb-4">r/{topic.name}</h3>
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
            <Card className="p-5 text-center text-muted">
              No posts in this community yet. Be the first!
            </Card>
          )}
        </Col>

        <Col lg={3} md={4}>
          <Card
            className="border-0 shadow-sm rounded-4 sticky-top"
            style={{ top: '20px' }}
          >
            <Card.Header className="bg-primary text-white fw-bold py-3 rounded-top-4">
              About Community
            </Card.Header>
            <Card.Body>
              <Card.Text className="mb-3">
                {topic.description || 'No description provided.'}
              </Card.Text>

              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted small">Members:</span>
                <span className="fw-bold">{topic.subscribers_count}</span>
              </div>

              <Stack gap={2}>
                <Button
                  variant="primary"
                  className="rounded-pill fw-bold"
                  onClick={() =>
                    navigate('/post/create', {
                      state: { selectedTopicId: topic.id },
                    })
                  }
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create Post
                </Button>

                {topic.is_subscribed && (
                  <Button
                    variant="outline-danger"
                    className="rounded-pill fw-bold"
                    onClick={handleLeave}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Leave
                  </Button>
                )}
              </Stack>
            </Card.Body>
            <Card.Footer className="bg-white text-muted small border-0 py-3">
              Created: {new Date(topic.created_at).toLocaleDateString()}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TopicDetail;
