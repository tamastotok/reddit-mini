import { Modal, Button } from 'react-bootstrap';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

function DeleteConfirmation({ showModal, setShowModal, userId }) {
  const navigate = useNavigate();

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/user/${userId}/delete/`);
      navigate('/register');
    } catch (error) {
      console.error('Failed to delete profile:', error);
    } finally {
      setShowModal(false);
    }
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete your profile? This action cannot be
        undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteConfirmation;
