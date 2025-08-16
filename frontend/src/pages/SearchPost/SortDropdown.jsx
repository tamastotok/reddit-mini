import { Dropdown } from 'react-bootstrap';

function SortDropdown({ sortOption, onSortChange }) {
  return (
    <Dropdown onSelect={onSortChange}>
      <Dropdown.Toggle variant="primary" id="sort-dropdown">
        Sort by: {sortOption.replace('-', ' ')}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item eventKey="date-newest">Date - Newest</Dropdown.Item>
        <Dropdown.Item eventKey="date-oldest">Date - Oldest</Dropdown.Item>
        <Dropdown.Item eventKey="most-popular">Most Popular</Dropdown.Item>
        <Dropdown.Item eventKey="least-popular">Least Popular</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default SortDropdown;