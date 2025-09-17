import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  USER_ID,
  USERNAME,
} from '../../utils/constants';

import api from '../../services/api';
import Popup from '../../components/Popup';
import LoadingOverlay from '../../components/LoadingOverlay';
import FieldWithError from '../../components/Form/FieldWithError';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [popupMsg, setPopupMsg] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPopupMsg('');
    setShowPopup(false);

    try {
      const res = await api.post('/api/token/', { username, password });

      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      localStorage.setItem(USER_ID, res.data.user_id);
      localStorage.setItem(USERNAME, username);

      navigate('/');
    } catch (error) {
      const data = error?.response?.data;
      const usernameMsg = data?.username?.[0] || '';
      const passwordMsg = data?.password?.[0] || '';
      setUsernameError(usernameMsg);
      setPasswordError(passwordMsg);

      if (!usernameMsg && !passwordMsg) {
        setPopupMsg(`${data.detail}.`);
        setShowPopup(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoadingOverlay loading={loading} />
      <Popup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title="Login Error"
        message={popupMsg}
      />
      <Row className="justify-content-center mt-5">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Form onSubmit={handleSubmit} className="my-form">
            <h1 className="text-center">Login</h1>

            <FieldWithError
              id="formUsername"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setUsernameError('')}
              error={usernameError}
              type="text"
              placeholder="Enter username"
              isAutoFocused={true}
            />

            <FieldWithError
              id="formPassword"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordError('')}
              error={passwordError}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              icon={showPassword ? faEyeSlash : faEye}
              onIconClick={togglePasswordVisibility}
            />

            <Button variant="primary" type="submit" className="w-100 mt-3 mb-3">
              Login
            </Button>
          </Form>

          <p className="text-center mt-3">
            Not a member?{' '}
            <Link to="/register" className="text-primary">
              Register here
            </Link>
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
