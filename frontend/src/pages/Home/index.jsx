import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Container } from 'react-bootstrap';
import { getAllPosts, getPostById } from '../../services/posts';
import PostCard from '../../components/PostCard';
import LoadingOverlay from '../../components/LoadingOverlay';
import SortSelect from '../../components/SortSelect';
import Sidebar from '../../components/SideBar';

function Home() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sortBy, setSortBy] = useState('new');
  const [timeframe, setTimeframe] = useState('today');

  const listAllPosts = async () => {
    const currentTopic = slug || 'home';

    try {
      setLoading(true);
      const res = await getAllPosts({
        topic: currentTopic,
        sort: sortBy,
        timeframe: sortBy === 'top' ? timeframe : undefined,
      });
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshVotedPost = async (postId) => {
    try {
      const res = await getPostById(postId);
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? res.data : p))
      );
    } catch (error) {
      console.error('Error refreshing post:', error);
    }
  };

  useEffect(() => {
    listAllPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, sortBy, timeframe]);

  return (
    <Container className="mt-4">
      {loading && <LoadingOverlay />}

      <Row>
        <Col md={3} className="d-none d-md-block">
          <Sidebar />
        </Col>

        <Col md={9} xs={12}>
          <div className="mb-4">
            <SortSelect
              sortBy={sortBy}
              setSortBy={setSortBy}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
          </div>

          <div className="post-feed">
            {posts.length === 0 && !loading ? (
              <div className="text-center p-5 bg-white rounded shadow-sm border">
                <h5>No posts here yet.</h5>
                <p className="text-muted">
                  {slug === 'home'
                    ? 'Subscribe to some communities to see posts here!'
                    : 'Be the first one to share something in this community!'}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  handlePostClick={(id) => navigate(`/post/${id}`)}
                  onRefreshPost={listAllPosts}
                  onRefreshVotes={refreshVotedPost}
                />
              ))
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
