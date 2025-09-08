import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../../utils/api';
import CategorySelect from '../../components/Post/CategorySelect';
import TagSelect from '../../components/Post/TagSelect';
import PostForm from '../../components/Post/PostForm';
import NavigationButton from '../../components/NavigationButton';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('technology');
  const [tags, setTags] = useState([]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const userId = localStorage.getItem('user_id');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(tags);
    try {
      await api.post('/api/post/create/', {
        author: userId,
        title,
        content,
        category,
        tags: tags.map((tag) => ({ name: tag })),
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <PostForm
        show={showSuccessModal}
        handleClose={() => setShowSuccessModal(false)}
      />

      <Form onSubmit={handleSubmit} className="mb-4 px-3">
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formContent">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter post content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </Form.Group>

        {/* Category and Tag Select Components */}
        <CategorySelect category={category} setCategory={setCategory} />
        <TagSelect tags={tags} setTags={setTags} />

        <div className="mt-3 d-flex flex-row-reverse">
          <Button variant="primary" type="submit" className="ms-2 rounded-pill">
            Post
          </Button>
          <NavigationButton variant="secondary" url="/" name="Back" />
        </div>
      </Form>
    </>
  );
}

export default CreatePost;
