import { Modal, Form, Button } from 'react-bootstrap';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import api from '../../utils/api';

function PasswordChange({ showPasswordModal, setShowPasswordModal, userId }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (type) => {
    if (type === 'old') setShowOldPassword((prev) => !prev);
    if (type === 'new') setShowNewPassword((prev) => !prev);
    if (type === 'confirm') setShowConfirmPassword((prev) => !prev);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      await api.put(`/api/user/${userId}/change-password/`, {
        current_password: oldPassword,
        new_password: newPassword,
      });
      alert('Password changed successfully!');
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password.');
    }
  };

  return (
    <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Current Password */}
          <Form.Group controlId="formOldPassword">
            <Form.Label>Current Password</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <FontAwesomeIcon
                icon={showOldPassword ? faEyeSlash : faEye}
                onClick={() => togglePasswordVisibility('old')}
                style={{ cursor: 'pointer', marginLeft: '8px' }}
              />
            </div>
          </Form.Group>

          {/* New Password */}
          <Form.Group controlId="formNewPassword" className="mt-3">
            <Form.Label>New Password</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <FontAwesomeIcon
                icon={showNewPassword ? faEyeSlash : faEye}
                onClick={() => togglePasswordVisibility('new')}
                style={{ cursor: 'pointer', marginLeft: '8px' }}
              />
            </div>
          </Form.Group>

          {/* Confirm New Password */}
          <Form.Group controlId="formConfirmPassword" className="mt-3">
            <Form.Label>Confirm New Password</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                onClick={() => togglePasswordVisibility('confirm')}
                style={{ cursor: 'pointer', marginLeft: '8px' }}
              />
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleChangePassword}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PasswordChange;
