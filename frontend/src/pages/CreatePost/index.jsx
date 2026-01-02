import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPost } from '../../services/posts';
import usePopup from '../../hooks/usePopup';
import Popup from '../../components/Popup';
import PostForm from '../../components/Post/PostForm';

function CreatePost() {
  const popup = usePopup();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('user_id');
  const preSelectedTopicId = location.state?.selectedTopicId || '';

  const [post, setPost] = useState({
    title: '',
    content: '',
    topic: preSelectedTopicId,
    tags: [],
  });

  useEffect(() => {
    if (preSelectedTopicId) {
      setPost((prev) => ({ ...prev, topic: preSelectedTopicId }));
    }
  }, [preSelectedTopicId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPost({
        author: userId,
        ...post,
        tags: post.tags.map((tag) =>
          typeof tag === 'string' ? { name: tag } : tag
        ),
      });

      popup.openPopup('Success', 'Post created successfully.');
    } catch (error) {
      const backendMessage =
        error.response?.data?.detail ||
        error.response?.data?.tags?.[0]?.name?.[0] ||
        'Something went wrong. Please try again.';

      popup.openPopup('Error', backendMessage);
    }
  };

  const handleClosePopup = () => {
    if (popup.title === 'Success') {
      popup.closePopup();
      navigate('/');
    } else {
      popup.closePopup();
    }
  };

  return (
    <>
      <Popup
        show={popup.show}
        onClose={handleClosePopup}
        title={popup.title}
        message={popup.message}
      />

      <PostForm
        post={post}
        setPost={setPost}
        onSubmit={handleSubmit}
        submitLabel="Post"
        isTopicFixed={!!preSelectedTopicId}
      />
    </>
  );
}

export default CreatePost;
