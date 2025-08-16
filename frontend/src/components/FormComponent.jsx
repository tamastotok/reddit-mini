import { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../utils/constants';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Loading from './Loading';
import { Link } from 'react-router-dom';

function FormComponent({ route, method }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const name = method === 'login' ? 'Login' : 'Register';

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await api.post(route, { username, password });
      if (method === 'login') {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        localStorage.setItem('user_id', res.data.user_id);
        localStorage.setItem('username', username);
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.username?.[0] ||
        error.response?.data?.detail ||
        'An unexpected error occurred.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Form onSubmit={handleSubmit} className="my-form">
            <h1 className="text-center">{name}</h1>
            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mt-3 mb-3">
              {name}
            </Button>

            {/* Conditional message for login page */}
            {method === 'login' ? (
              <p className="text-center mt-3">
                Not a member?{' '}
                <Link to="/register" className="text-primary">
                  Register here
                </Link>
              </p>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                variant="secondary"
                type="submit"
                className="w-100 mt-3 mb-3"
              >
                Back to Login
              </Button>
            )}
            {loading && <Loading />}
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default FormComponent;
