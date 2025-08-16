import { Dropdown } from 'react-bootstrap';

const categories = [
  { key: 'technology', label: 'Technology' },
  { key: 'science', label: 'Science' },
  { key: 'health', label: 'Health' },
  { key: 'education', label: 'Education' },
  { key: 'business', label: 'Business' },
  { key: 'finance', label: 'Finance' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'travel', label: 'Travel' },
  { key: 'food', label: 'Food' },
  { key: 'sports', label: 'Sports' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'politics', label: 'Politics' },
  { key: 'environment', label: 'Environment' },
  { key: 'art_culture', label: 'Art & Culture' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'productivity', label: 'Productivity' },
  { key: 'diy_crafts', label: 'DIY & Crafts' },
  { key: 'parenting', label: 'Parenting' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'relationships', label: 'Relationships' },
  { key: 'custom', label: 'Custom' },
];

function CategoryDropdown({ selectedCategory, onCategoryChange }) {
  return (
    <Dropdown onSelect={onCategoryChange}>
      <Dropdown.Toggle variant="primary" id="category-dropdown">
        {selectedCategory
          ? categories.find((c) => c.key === selectedCategory).label
          : 'Filter by Category'}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item eventKey="">All Categories</Dropdown.Item>
        {categories.map((category) => (
          <Dropdown.Item key={category.key} eventKey={category.key}>
            {category.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default CategoryDropdown;