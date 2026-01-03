import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Row, Col, Container, Spinner } from 'react-bootstrap';
import { getAllPosts, getPostById } from '../../services/posts';
import PostCard from '../../components/PostCard';
import LoadingOverlay from '../../components/LoadingOverlay';
import SortSelect from '../../components/SortSelect';
import Sidebar from '../../components/SideBar';
import api from '../../services/api';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [sortBy, setSortBy] = useState('new');
  const [timeframe, setTimeframe] = useState('today');
  const observerLoader = useRef(null);

  const listAllPosts = useCallback(async () => {
    let currentTopic = 'home';

    if (location.pathname === '/r/all') {
      currentTopic = 'all';
    } else if (slug) {
      currentTopic = slug;
    }

    try {
      setLoading(true);
      const res = await getAllPosts({
        topic: currentTopic,
        sort: sortBy,
        timeframe: sortBy === 'top' ? timeframe : undefined,
      });
      setPosts(res.data.results);
      setNextPage(res.data.next);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [location.pathname, slug, sortBy, timeframe]);

  const handleLoadMore = useCallback(async () => {
    if (!nextPage || loadingMore) return;

    try {
      setLoadingMore(true);
      const res = await api.get(nextPage);

      setPosts((prev) => [...prev, ...res.data.results]);
      setNextPage(res.data.next);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [nextPage, loadingMore]);

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
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    if (observerLoader.current) {
      observer.observe(observerLoader.current);
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (observerLoader.current) observer.disconnect();
    };
  }, [handleLoadMore]);

  useEffect(() => {
    listAllPosts();
  }, [listAllPosts]);

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
                  {slug === 'home' || !slug
                    ? 'Subscribe to some communities to see posts here!'
                    : 'Be the first one to share something in this community!'}
                </p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    handlePostClick={(id) => navigate(`/post/${id}`)}
                    onRefreshPost={listAllPosts}
                    onRefreshVotes={refreshVotedPost}
                  />
                ))}
                <div
                  ref={observerLoader}
                  className="d-flex justify-content-center p-4"
                  style={{ minHeight: '100px' }}
                >
                  {loadingMore && (
                    <Spinner animation="border" variant="primary" />
                  )}
                  {!nextPage && posts.length > 0 && (
                    <p className="text-muted italic">
                      You reached the bottom. 👋
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
