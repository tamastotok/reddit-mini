import { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateTopic() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/topic-tags/');
        setAvailableCategories(res.data);
      } catch (err) {
        console.error('Could not load tags!', err);
        setError('Failed to load community tags. Please try again later.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchTags();
  }, []);

  const handleTagToggle = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const topicData = {
      name: name,
      description: description,
      tags: selectedTags,
    };

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/topics/',
        topicData
      );
      navigate(`/r/${response.data.slug}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.name ||
          err.response?.data?.detail ||
          'Error creating community. The name might be taken.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading categories...</p>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center mt-5 mb-5">
      <Card
        className="shadow-sm border-0"
        style={{ maxWidth: '700px', width: '100%', borderRadius: '15px' }}
      >
        <Card.Body className="p-4">
          <h2 className="fw-bold mb-4">Create a Community</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. programming"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
              />
              <Form.Text className="text-muted">
                Community names are unique and cannot be changed later.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Describe what people will do here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold d-block mb-3">
                Select Topics / Tags
              </Form.Label>

              {availableCategories.length === 0 ? (
                <Alert variant="warning">
                  No tag categories found. Add them in Django Admin!
                </Alert>
              ) : (
                availableCategories.map((category) => (
                  <div key={category.id} className="mb-4">
                    <h6
                      className="text-muted text-uppercase border-bottom pb-1"
                      style={{ fontSize: '0.8rem', letterSpacing: '1px' }}
                    >
                      {category.name}
                    </h6>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {category.tags && category.tags.length > 0 ? (
                        category.tags.map((tag) => (
                          <Button
                            key={tag.id}
                            variant={
                              selectedTags.includes(tag.id)
                                ? 'primary'
                                : 'outline-secondary'
                            }
                            size="sm"
                            className="rounded-pill px-3"
                            onClick={() => handleTagToggle(tag.id)}
                            type="button"
                          >
                            {tag.name}
                          </Button>
                        ))
                      ) : (
                        <span className="text-muted small italic">
                          No tags in this category
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end border-top pt-3">
              <Button
                variant="light"
                onClick={() => navigate(-1)}
                className="rounded-pill px-4"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="rounded-pill px-4 fw-bold"
              >
                {loading ? 'Creating...' : 'Create Community'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CreateTopic;
