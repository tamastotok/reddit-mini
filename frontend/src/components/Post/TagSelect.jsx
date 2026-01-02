import { useState } from 'react';
import { Form, Badge, Button, FloatingLabel } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import Popup from '../Popup';

function TagSelect({ tags, setTags }) {
  const [tagInput, setTagInput] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');

  const normalizeTag = (value) => {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  };

  const addTag = () => {
    const normalized = normalizeTag(tagInput);

    if (tags.includes(tagInput)) {
      setShowPopup(true);
      setPopupMsg('Tag is already added.');
      return;
    }

    if (normalized.length > 16) {
      setShowPopup(true);
      setPopupMsg('Tag must be 16 characters or less.');
      return;
    }

    if (normalized && !tags.includes(normalized) && tags.length < 3) {
      setTags([...tags, normalized]);
      setTagInput('');
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <>
      {/*Client side validation*/}
      <Popup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title="Error"
        message={popupMsg}
      />
      <Form.Group controlId="formTags" className="mt-3">
        <div className="d-flex gap-2">
          <FloatingLabel
            controlId="floatingTagInput"
            label="Tags"
            className="flex-grow-1"
          >
            <Form.Control
              size="xs"
              type="text"
              placeholder="Enter a tag"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              disabled={tags.length >= 3}
            />
          </FloatingLabel>
          <Button
            variant={
              tags.length >= 3 || !tagInput.trim()
                ? 'outline-secondary'
                : 'outline-primary'
            }
            onClick={addTag}
            disabled={tags.length >= 3 || !tagInput.trim()}
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>

        <Form.Text className="text-muted d-block mt-1">
          Up to 3 tags. Each max 16 chars. No spaces (they’ll be replaced with
          “-”).
        </Form.Text>

        {tags.length >= 3 && (
          <Form.Text className="text-danger d-block mt-1">
            Maximum 3 tags allowed.
          </Form.Text>
        )}
        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              pill
              bg="secondary"
              className="px-2"
              style={{ fontSize: '0.9rem' }}
            >
              {tag}
              <FontAwesomeIcon
                icon={faTimes}
                onClick={() => handleTagRemove(tag)}
                className="ms-2"
                style={{ cursor: 'pointer' }}
                title="Remove tag"
              />
            </Badge>
          ))}
        </div>
      </Form.Group>
    </>
  );
}

export default TagSelect;
