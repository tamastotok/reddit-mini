import { useLocation } from 'react-router-dom';
import Popup from './Popup';

function SessionExpiredPopup({ sessionExpired, handlePopupClose }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  if (!sessionExpired || isLoginPage || isRegisterPage) return null;

  return (
    <Popup
      show={sessionExpired}
      onClose={handlePopupClose}
      title="Session Expired"
      message="Your session has expired. Please log in again."
    />
  );
}

export default SessionExpiredPopup;
