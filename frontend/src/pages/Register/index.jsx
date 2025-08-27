import { useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../utils/constants';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Loading from '../../components/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import PasswordRequirements from '../../components/PasswordRequirements';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isDisabled, setIsDisabled] = useState(true);

  const disableButton = (state) => {
    setIsDisabled(state);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (type) => {
    if (type === 'password') setShowPassword((prev) => !prev);
    if (type === 'confirm-password') setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      await api.post('/api/user/register/', {
        email,
        username,
        password,
        password2: confirmPassword,
      });
      navigate('/login');
    } catch (error) {
      const errorMessage =
        error.response?.data.email?.[0] ||
        error.response?.data.username?.[0] ||
        error.response?.data.detail ||
        error.response?.data.password ||
        error.message ||
        'An unexpected error occurred.';
      alert(errorMessage);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Form onSubmit={handleSubmit} className="my-form">
            <h1 className="text-center">Register</h1>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                required
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </Form.Group>

            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-2">
              <Form.Label>Password</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  aria-describedby="passwordHelp"
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={() => togglePasswordVisibility('password')}
                  style={{ cursor: 'pointer', marginLeft: '8px' }}
                />
              </div>
            </Form.Group>

            <Form.Group controlId="formPassword2">
              <Form.Label>Confirm password</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  required
                  onChange={(e) => setconfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                  onClick={() => togglePasswordVisibility('confirm-password')}
                  style={{ cursor: 'pointer', marginLeft: '8px' }}
                />
              </div>
              <PasswordRequirements
                email={email}
                username={username}
                password={password}
                passwordsMatch={
                  password && password === confirmPassword ? true : false
                }
                disableButton={disableButton}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3 mb-3"
              disabled={!isDisabled}
            >
              Register
            </Button>

            {loading && <Loading />}
          </Form>

          <Button
            onClick={() => navigate('/login')}
            variant="secondary"
            type="submit"
            className="w-100 mt-3 mb-3"
          >
            Back to Login
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
