import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../../utils/api';
import NavigationButton from '../../components/NavigationButton';
import ProfileCard from './ProfileCard';
import DeleteConfirmation from './DeleteConfirmation';
import PasswordChange from './PasswordChange';

function Settings() {
  const [userData, setUserData] = useState({
    username: '',
    bio: '',
    profile_picture: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const userId = localStorage.getItem('user_id');

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/profile/${userId}`);
      setUserData(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError('Failed to load user profile');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container className="mt-4">
      {loading ? (
        <Spinner animation="border" role="status" className="d-block mx-auto">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row className="justify-content-center">
          <Col md={6}>
            <ProfileCard
              userData={userData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              fetchProfile={fetchProfile}
              setShowModal={setShowModal}
              setShowPasswordModal={setShowPasswordModal}
            />
          </Col>
        </Row>
      )}
      <NavigationButton
        variant="secondary"
        url="/"
        name="Main page"
        className="mt-4"
      />

      <DeleteConfirmation
        showModal={showModal}
        setShowModal={setShowModal}
        userId={userId}
      />

      <PasswordChange
        showPasswordModal={showPasswordModal}
        setShowPasswordModal={setShowPasswordModal}
        userId={userId}
      />
    </Container>
  );
}

export default Settings;
