import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, updatePost } from '../../services/posts';
import usePopup from '../../hooks/usePopup';
import Popup from '../../components/Popup';
import PostForm from '../../components/Post/PostForm';

function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const popup = usePopup();

  const [post, setPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
  });

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const res = await getPostById(postId);
        setPost(res.data);
      } catch (error) {
        console.error('Error fetching post data:', error);
        popup.openPopup('Error', 'Failed to load post data.');
      }
    };

    fetchPostData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updatePost(postId, {
        ...post,
        tags: post.tags.map((tag) =>
          typeof tag === 'string' ? { name: tag } : tag
        ),
      });

      popup.openPopup('Success', 'Post updated successfully.');
    } catch (error) {
      const backendMessage =
        error.response?.data?.detail ||
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
        submitLabel="Update"
      />
    </>
  );
}

export default EditPost;
