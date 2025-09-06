import api from './api';

const searchPosts = async (query, navigate, setPopupMsg, setShowPopup) => {
  if (!query.trim()) return;

  try {
    const res = await api.get(`/api/search/?q=${query}`);
    navigate('/post/search', { state: { results: res.data } });
  } catch (error) {
    const msg = error.message
      ? `${error.message}.`
      : 'An unexpected error occurred.';
    console.error(error);
    if (setPopupMsg) setPopupMsg(msg);
    if (setShowPopup) setShowPopup(true);
    navigate('/');
  }
};

export default searchPosts;
