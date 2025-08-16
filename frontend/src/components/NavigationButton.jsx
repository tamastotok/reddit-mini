import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function NavigationButton({ variant, url, name }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (url === '/logout') {
      localStorage.clear();
    }
    navigate(url);
  };

  return (
    <Button variant={variant} onClick={handleClick}>
      {name}
    </Button>
  );
}

export default NavigationButton;
