import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import NavigationButton from '../../components/NavigationButton';
import CategorySelect from '../../components/Post/CategorySelect';
import TagSelect from '../../components/Post/TagSelect';
import api from '../../services/api';

function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('technology');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const res = await api.get(`/api/posts/${postId}/`);
        setTitle(res.data.title);
        setContent(res.data.content);
        setCategory(res.data.category);
        setTags(res.data.tags);
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    };

    fetchPostData();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/api/post/${postId}/update/`, {
        title,
        content,
        category,
        tags: tags.map((tag) => ({ name: tag })),
      });
      console.log('Post updated successfully');
      navigate('/');
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('technology');
    setTags([]);
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className="mb-4 ps-3">
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

        <div className="mt-3">
          <Button variant="primary" type="submit" className="me-2">
            Update
          </Button>
          <Button variant="secondary" onClick={resetForm} className="me-2">
            Cancel
          </Button>
          <NavigationButton variant="secondary" url="/" name="Back" />
        </div>
      </Form>
    </>
  );
}

export default EditPost;
