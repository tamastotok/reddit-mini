import {
  Navbar,
  Nav,
  NavDropdown,
  Image,
  Button,
  Container,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useState, useEffect } from 'react';

function NavbarComponent() {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleCreatePost = () => {
    navigate('/post/create');
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const profileImage = '../src/assets/cat_profile.png';

  return (
    <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="me-3 ps-1" title="Homepage">
          DNR
        </Navbar.Brand>

        <Button variant="danger" className="me-3" onClick={handleCreatePost}>
          Create Post
        </Button>

        <div className="flex-grow-1 mx-3">
          <SearchBar />
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <NavDropdown
              title={
                <Image
                  src={profileImage}
                  roundedCircle
                  style={{ width: '40px', height: '40px' }}
                  alt="Profile"
                />
              }
              id="basic-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to={`/user/${username}`}>
                Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/settings">
                Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
