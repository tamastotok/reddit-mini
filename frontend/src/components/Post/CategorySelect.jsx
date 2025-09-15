import { Form, FloatingLabel } from 'react-bootstrap';
import useFetchCategories from '../../hooks/useCategories';

function CategorySelect({
  category,
  setCategory,
  required = false,
  showAllOption = false,
  label = 'Category',
}) {
  const { categories, loading } = useFetchCategories();

  const handleChange = (e) => {
    setCategory(e.target.value);
  };

  return (
    <FloatingLabel controlId="formCategory" label={label} className="mt-3">
      <Form.Select
        value={category}
        onChange={handleChange}
        required={required}
        disabled={loading}
      >
        {showAllOption ? (
          <option value="">All Categories</option>
        ) : (
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
