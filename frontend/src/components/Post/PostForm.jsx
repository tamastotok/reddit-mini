import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function PostForm({ show, handleClose }) {
  const navigate = useNavigate();

  const handleCloseAndRedirect = () => {
    handleClose();
    navigate('/'); // Redirect to homepage after closing the modal
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Success</Modal.Title>
      </Modal.Header>
      <Modal.Body>Your post was created successfully!</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseAndRedirect}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PostForm;
