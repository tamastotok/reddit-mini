import { Form, FloatingLabel } from 'react-bootstrap';

function SortSelect({ sortBy, setSortBy, label = 'Sort by' }) {
  const options = [
    { value: 'date', label: 'Newest' },
    { value: 'upvotes', label: 'Most Upvotes' },
    { value: 'comments', label: 'Most Comments' },
  ];

  return (
    <FloatingLabel controlId="formSortBy" label={label} className="mt-3">
      <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Form.Select>
    </FloatingLabel>
  );
}

export default SortSelect;
