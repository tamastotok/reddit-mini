import { Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

function EditDeleteButtons({ onEdit, onDelete }) {
  return (
    <div
      className="d-flex align-items-center rounded-pill px-1 ms-2"
      style={{ padding: '5.75px 0px' }}
    >
      <Badge
        bg="secondary"
        pill
        className="me-2 hover-bg-primary"
        style={{ cursor: 'pointer' }}
        onClick={onEdit}
      >
        <FontAwesomeIcon icon={faEdit} className="me-1" />
        Edit
      </Badge>

      <Badge
        bg="secondary"
        pill
        className="hover-bg-danger"
        style={{ cursor: 'pointer' }}
        onClick={onDelete}
      >
        <FontAwesomeIcon icon={faTrash} className="me-1" />
        Delete
      </Badge>
    </div>
  );
}

export default EditDeleteButtons;
