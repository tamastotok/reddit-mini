import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import api from '../../services/api';
import CategorySelect from '../../components/Post/CategorySelect';
import TagSelect from '../../components/Post/TagSelect';
import NavigationButton from '../../components/NavigationButton';
import Popup from '../../components/Popup';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMsg, setPopupMsg] = useState('');

  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/post/create/', {
        author: userId,
        title,
        content,
        category,
        tags: tags.map((tag) => ({ name: tag })),
      });

      setShowPopup(true);
      setPopupTitle('Success');
      setPopupMsg('Post created successfully.');
    } catch (error) {
      const backendMessage =
        error.response?.data?.detail ||
        error.response?.data?.tags?.[0].name[0] ||
        'Something went wrong. Please try again.';
      setShowPopup(true);
      setPopupTitle('Error');
      setPopupMsg(backendMessage);
    }
  };

  const handleClosePopup = () => {
    if (popupTitle === 'Success') {
      setShowPopup(false);
      navigate('/');
    }
    setShowPopup(false);
  };

  return (
    <>
      {/*Server side validation*/}
      <Popup
        show={showPopup}
        onClose={handleClosePopup}
        title={popupTitle}
        message={popupMsg}
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

        <CategorySelect
          category={category}
          setCategory={setCategory}
          required
        />
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
