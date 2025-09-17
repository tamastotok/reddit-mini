// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import api from '../../services/api';
import Popup from '../../components/Popup';
import LoadingOverlay from '../../components/LoadingOverlay';
import PasswordRequirements from '../../components/Form/PasswordRequirements';
import FieldWithError from '../../components/Form/FieldWithError';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [popupMsg, setPopupMsg] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = (type) => {
    if (type === 'password') setShowPassword((prev) => !prev);
    if (type === 'confirm-password') setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError('');
    setUsernameError('');
    setShowPopup(false);
    setPopupMsg('');

    try {
      await api.post('/api/user/register/', {
        email,
        username,
        password,
        password2: confirmPassword,
      });
      navigate('/login');
    } catch (error) {
      const data = error?.response?.data;
      const emailMsg = data?.email?.[0] || '';
      const userMsg = data?.username?.[0] || '';

      setEmailError(emailMsg);
      setUsernameError(userMsg);

      if (!emailMsg && !userMsg) {
        const message = error.message
          ? `${error.message}.`
          : 'An unexpected error occurred.';
        setPopupMsg(message);
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
        title="Registration Error"
        message={popupMsg}
      />
      <Row className="justify-content-center mt-5">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Form onSubmit={handleSubmit} className="my-form">
            <h1 className="text-center">Register</h1>

            <FieldWithError
              id="formEmail"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailError('')}
              error={emailError}
              type="email"
              placeholder="Enter email"
              isAutoFocused={true}
            />

            <FieldWithError
              id="formUsername"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setUsernameError('')}
              error={usernameError}
              type="text"
              placeholder="Enter username"
            />

            <FieldWithError
              id="formPassword"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              icon={showPassword ? faEyeSlash : faEye}
              onIconClick={() => togglePasswordVisibility('password')}
            />

            <FieldWithError
              id="formPassword2"
              label="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              icon={showConfirmPassword ? faEyeSlash : faEye}
              onIconClick={() => togglePasswordVisibility('confirm-password')}
            />

            <PasswordRequirements
              email={email}
              username={username}
              password={password}
              passwordsMatch={password === confirmPassword}
              disableButton={setCanSubmit}
            />

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3"
              disabled={!canSubmit || loading}
            >
              Register
            </Button>
          </Form>

          <Button
            onClick={() => navigate('/login')}
            variant="secondary"
            type="button"
            className="w-100 mt-3"
          >
            Back to Login
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
