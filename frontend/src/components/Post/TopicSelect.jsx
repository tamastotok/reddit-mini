import { Form, FloatingLabel } from 'react-bootstrap';
import useFetchTopics from '../../hooks/useFetchTopics';

function TopicSelect({ selectedTopic, setTopic, required }) {
  const { topics, loading } = useFetchTopics();

  return (
    <FloatingLabel controlId="formCategory" label="Topic" className="mt-3">
      <Form.Select
        value={selectedTopic || ''}
        onChange={(e) => setTopic(e.target.value)}
        required={required}
        disabled={loading}
      >
        <option value="" disabled>
          Choose a community...
        </option>
        {topics.map((topic) => (
          <option key={topic.id} value={topic.id}>
            r/{topic.name}
          </option>
        ))}
      </Form.Select>
      {loading && (
        <Form.Text className="text-muted">Loading communities...</Form.Text>
      )}
    </FloatingLabel>
  );
}

export default TopicSelect;
