import { Card, Image, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import api from '../../utils/api';

function ProfileCard({
  userData,
  isEditing,
  setIsEditing,
  fetchProfile,
  setShowModal,
  setShowPasswordModal,
}) {
  const [editedData, setEditedData] = useState({
    username: userData.username,
    bio: userData.bio,
    profile_picture: userData.profile_picture,
  });

  const handleEditToggle = () => setIsEditing((prev) => !prev);
  const handleCancel = () => setIsEditing(false);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('username', editedData.username);
    formData.append('bio', editedData.bio);
    if (editedData.profile_picture) {
      formData.append('profile_picture', editedData.profile_picture);
    }
    try {
      console.log(userData);
      const res = await api.put(`/api/user/${userData.id}/edit/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchProfile();
      setEditedData(res.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedData((prev) => ({ ...prev, profile_picture: file }));
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body className="text-center">
        <Image
          src={editedData.profile_picture || '../src/assets/cat_profile.png'}
          roundedCircle
          fluid
          style={{ width: '150px', height: '150px' }}
          className="mb-3"
        />
        {isEditing ? (
          <>
            <Form.Control
              type="text"
              name="username"
              value={editedData.username}
              onChange={handleInputChange}
            />
            <Form.Control
              as="textarea"
              name="bio"
              value={editedData.bio}
              onChange={handleInputChange}
              rows={3}
            />
            <Form.Control
              type="file"
              name="profile_picture"
              onChange={handleImageChange}
            />
            <Button variant="success" onClick={handleSave}>
              Save
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Card.Title>{userData.username}</Card.Title>
            <Card.Text>{userData.bio || 'No bio available'}</Card.Text>
            <Button variant="primary" onClick={handleEditToggle}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setShowModal(true)}>
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default ProfileCard;
