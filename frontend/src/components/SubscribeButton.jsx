import { useState } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';

function SubscribeButton({ topicSlug, initialIsSubscribed }) {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/topics/${topicSlug}/subscribe/`
      );
      setIsSubscribed(res.data.subscribed);
    } catch (err) {
      console.error('Hiba a feliratkozásnál', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isSubscribed ? 'outline-secondary' : 'primary'}
      className="rounded-pill px-4 fw-bold"
      onClick={handleToggle}
      disabled={loading}
    >
      {isSubscribed ? 'Leave' : 'Join'}
    </Button>
  );
}

export default SubscribeButton;
