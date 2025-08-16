import { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Row, Col } from 'react-bootstrap';

import api from '../../utils/api';

import UserPosts from './UserPosts';
import UserComments from './UserComments';

const UserProfile = () => {
  const [username, setUsername] = useState(null);
  const [data, setData] = useState({ posts: [], comments: [] });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!username) return;
        const res = await api.get(`/api/user-activity/${username}/`);
        const { posts, comments } = res.data;
        setData({ posts, comments });
      } catch (error) {
        console.error('Error fetching user activity', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Row>
        <Col>
          <h2>{username ? `${username}'s Profile` : 'Profile'}</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <Tabs id="profile-tabs" defaultActiveKey="posts" className="mb-3">
            <Tab eventKey="posts" title="Posts">
              <UserPosts posts={data.posts} />
            </Tab>
            <Tab eventKey="comments" title="Comments">
              <UserComments comments={data.comments} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
