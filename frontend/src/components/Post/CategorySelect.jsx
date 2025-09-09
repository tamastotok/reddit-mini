import { Form } from 'react-bootstrap';
import { FloatingLabel } from 'react-bootstrap';
import useFetchCategories from '../../hooks/useCategories';
import { useState } from 'react';

function CategorySelect({ category, setCategory }) {
  const { categories, loading } = useFetchCategories();
  const [isHidden, setIsHidden] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value.trim();
    setCategory(value);
    if (value !== '') setIsHidden(true);
  };

  return (
    <FloatingLabel controlId="formCategory" label="Category" className="mt-3">
      <Form.Select
        value={category}
        onChange={handleChange}
        required
        disabled={loading}
      >
        {!isHidden && (
          <option value="" disabled hidden>
            Select a Category
          </option>
        )}
        {categories.map((cat, idx) => (
          <option key={idx} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </Form.Select>
    </FloatingLabel>
  );
}

export default CategorySelect;
