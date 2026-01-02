import { useState } from 'react';

const usePopup = () => {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const openPopup = (popupTitle, popupMessage) => {
    setTitle(popupTitle);
    setMessage(popupMessage);
    setShow(true);
  };

  const closePopup = () => setShow(false);

  return {
    show,
    title,
    message,
    openPopup,
    closePopup,
  };
};

export default usePopup;
