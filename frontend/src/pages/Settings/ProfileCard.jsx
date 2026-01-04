import { useState, useEffect, useContext } from 'react';
import { Card, Image, Button, Form, Stack } from 'react-bootstrap';
import { updateUserProfile } from '../../services/user';
import { UserContext } from '../../context/UserContext';

function ProfileCard({
  userData,
  isEditing,
  setIsEditing,
  fetchProfile,
  setShowModal,
  setShowPasswordModal,
}) {
  const { refreshUser } = useContext(UserContext);
  const [editedData, setEditedData] = useState({
    username: userData.username,
    bio: userData.profile?.bio || '',
    avatar: null,
  });

  useEffect(() => {
    setEditedData({
      username: userData.username,
      bio: userData.profile?.bio || '',
      avatar: null,
    });
  }, [userData]);

  const handleEditToggle = () => setIsEditing((prev) => !prev);
  const handleCancel = () => setIsEditing(false);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('first_name', userData.first_name || '');
    formData.append('profile.bio', editedData.bio);

    if (editedData.avatar instanceof File) {
      formData.append('profile.avatar', editedData.avatar);
    }

    try {
      await updateUserProfile(userData.id, formData);
      await fetchProfile();
      await refreshUser();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const getAvatarSrc = () => {
    if (editedData.avatar instanceof File) {
      return URL.createObjectURL(editedData.avatar);
    }
    return userData.profile?.avatar || '/src/assets/cat_profile.png';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedData((prev) => ({ ...prev, avatar: file }));
    }
  };

  return (
    <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
      <div className="bg-primary" style={{ height: '80px' }}></div>
      <Card.Body className="text-center pt-0" style={{ marginTop: '-75px' }}>
        <div className="position-relative d-inline-block mb-3">
          <Image
            src={getAvatarSrc()}
            roundedCircle
            className="border border-4 border-white shadow-sm bg-white"
            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
          />
          {isEditing && (
            <Form.Label
              htmlFor="avatar-upload"
              className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                border: '3px solid white',
              }}
            >
              <i className="bi bi-camera-fill"></i>
              <Form.Control
                id="avatar-upload"
                type="file"
                className="d-none"
                onChange={handleImageChange}
                accept="image/*"
              />
            </Form.Label>
          )}
        </div>

        {isEditing ? (
          <Form className="text-start px-3">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">
                Username (Read-only)
              </Form.Label>
              <Form.Control
                type="text"
                value={editedData.username}
                disabled
                className="bg-light border-0"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted">
                About Me (Bio)
              </Form.Label>
              <Form.Control
                as="textarea"
                name="bio"
                placeholder="Tell us about yourself..."
                value={editedData.bio}
                onChange={handleInputChange}
                rows={4}
                className="rounded-3 shadow-sm"
              />
            </Form.Group>

            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-center mb-2"
            >
              <Button
                variant="success"
                onClick={handleSave}
                className="rounded-pill px-4 fw-bold"
              >
                Save Changes
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleCancel}
                className="rounded-pill px-4"
              >
                Cancel
              </Button>
            </Stack>
          </Form>
        ) : (
          <div className="px-3">
            <Card.Title className="fs-3 fw-bold mb-1">
              {userData.username}
            </Card.Title>
            <Card.Text className="text-muted mb-4 px-2">
              {userData.profile?.bio || (
                <span className="fst-italic opacity-50">
                  No bio available yet.
                </span>
              )}
            </Card.Text>

            <Stack gap={2} className="col-md-10 mx-auto mb-3">
              <Button
                variant="primary"
                onClick={handleEditToggle}
                className="rounded-pill fw-bold"
              >
                Edit Profile
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setShowPasswordModal(true)}
                className="rounded-pill"
              >
                Change Password
              </Button>
              <hr className="my-2 opacity-10" />
              <Button
                variant="link"
                className="text-danger text-decoration-none small"
                onClick={() => setShowModal(true)}
              >
                Delete Account
              </Button>
            </Stack>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default ProfileCard;
