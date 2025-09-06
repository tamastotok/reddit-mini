import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function FieldWithError({
  id,
  label,
  value,
  onChange,
  onFocus,
  error,
  type = 'text',
  placeholder,
  icon,
  onIconClick,
  isAutoFocused,
}) {
  return (
    <Form.Group controlId={id} className="mb-3">
      <div className="d-flex justify-content-between">
        <Form.Label>{label}</Form.Label>
        <Form.Label style={{ color: 'red' }}>{error}</Form.Label>
      </div>
      <div className="d-flex align-items-center">
        <Form.Control
          style={{ borderColor: error ? 'red' : '' }}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          autoFocus={isAutoFocused}
        />
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            onClick={onIconClick}
            style={{ cursor: 'pointer', marginLeft: '8px' }}
          />
        )}
      </div>
    </Form.Group>
  );
}

export default FieldWithError;
