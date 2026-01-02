import { Form, Button } from 'react-bootstrap';
import TopicSelect from './TopicSelect';
import TagSelect from './TagSelect';
import NavigationButton from '../NavigationButton';

function PostForm({ post, setPost, onSubmit, submitLabel, isTopicFixed }) {
  return (
    <Form onSubmit={onSubmit} className="mb-4 px-3">
      <Form.Group controlId="formTitle" className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter post title"
          value={post.title}
          onChange={(e) => setPost({ ...post, title: e.target.value })}
          required
        />
      </Form.Group>

      <Form.Group controlId="formContent" className="mb-3">
        <Form.Label>Content</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          placeholder="What's on your mind?"
          value={post.content}
          onChange={(e) => setPost({ ...post, content: e.target.value })}
          required
        />
      </Form.Group>

      <TopicSelect
        selectedTopic={post.topic}
        setTopic={(topicId) => setPost({ ...post, topic: topicId })}
        required
        disabled={isTopicFixed}
      />

      <TagSelect
        tags={post.tags}
        setTags={(tags) => setPost({ ...post, tags })}
      />

      <div className="mt-3 d-flex flex-row-reverse">
        <Button variant="primary" type="submit" className="ms-2 rounded-pill">
          {submitLabel}
        </Button>
        <NavigationButton variant="secondary" url="/" name="Cancel" />
      </div>
    </Form>
  );
}

export default PostForm;
