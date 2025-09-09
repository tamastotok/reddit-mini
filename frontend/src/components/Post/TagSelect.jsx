import { useState } from 'react';
import { Form, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function TagSelect({ tags, setTags }) {
  const [tagInput, setTagInput] = useState('');

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const trimmed = tagInput.trim();

      if (trimmed && !tags.includes(trimmed) && tags.length < 3) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Form.Group controlId="formTags" className="mt-3">
      <Form.Label>Tags</Form.Label>
      <div className="d-flex align-items-center gap-2 mb-2">
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

      <Form.Control
        type="text"
        placeholder="Enter your tag"
        value={tagInput}
        onChange={handleTagInputChange}
        onKeyDown={handleTagAdd}
        disabled={tags.length >= 3}
      />

      <Form.Text className="text-muted d-block mt-1">
        You can add up to 3 tags. Press Enter to add.
      </Form.Text>

      <Form.Text className="text-muted d-block">
        Tap the <FontAwesomeIcon icon={faTimes} /> next to a tag to remove it.
      </Form.Text>

      {tags.length >= 3 && (
        <Form.Text className="text-danger d-block mt-1">
          Maximum 3 tags allowed.
        </Form.Text>
      )}
    </Form.Group>
  );
}

export default TagSelect;
