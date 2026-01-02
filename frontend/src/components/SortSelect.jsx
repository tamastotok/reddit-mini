import { Form, FloatingLabel, Row, Col } from 'react-bootstrap';

function SortSelect({ sortBy, setSortBy, timeframe, setTimeframe }) {
  // Primary sorting options
  const sortOptions = [
    { value: 'hot', label: 'Hot' },
    { value: 'new', label: 'New' },
    { value: 'top', label: 'Top' },
  ];

  // Secondary sorting options (only when primary='Top')
  const timeframeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <Row className="g-2 align-items-center">
      <Col xs="auto" style={{ minWidth: '150px' }}>
        <FloatingLabel controlId="formSortBy" label="Sort by">
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-0 shadow-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </FloatingLabel>
      </Col>

      {sortBy === 'top' && (
        <Col xs="auto" style={{ minWidth: '150px' }}>
          <FloatingLabel controlId="formTimeframe" label="Timeframe">
            <Form.Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border-0 shadow-sm"
            >
              {timeframeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </FloatingLabel>
        </Col>
      )}
    </Row>
  );
}

export default SortSelect;
