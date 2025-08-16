import { useState } from 'react';
import { Form, Badge } from 'react-bootstrap';

function TagSelect({ tags, setTags }) {
  const [tagInput, setTagInput] = useState('');

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagAdd = (e) => {
    // Prevent form submission when pressing Enter
    if (e.key === 'Enter') {
      e.preventDefault();

      if (tagInput && !tags.includes(tagInput) && tags.length < 3) {
        setTags([...tags, tagInput]);
        setTagInput('');
      }
    }
  };

  const handleTagRemove = (tag) => {
    setTags(tags.filter((item) => item !== tag));
  };

  return (
    <Form.Group controlId="formTags" className="mt-3">
      <Form.Label>Tags</Form.Label>
      <div className="d-flex flex-wrap">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            pill
            bg="secondary"
            className="me-2 mb-2"
            onClick={() => handleTagRemove(tag)}
            style={{ cursor: 'pointer' }}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <Form.Control
        type="text"
        placeholder="Type and press Enter to add a tag"
        value={tagInput}
        onChange={handleTagInputChange}
        onKeyDown={handleTagAdd}
        disabled={tags.length >= 3}
      />
      <Form.Text className="text-muted">
        You can add up to 3 tags. Press Enter to add a tag.
      </Form.Text>
      {tags.length >= 3 && (
        <Form.Text className="text-danger">
          You can only select up to 3 tags.
        </Form.Text>
      )}
    </Form.Group>
  );
}

export default TagSelect;
