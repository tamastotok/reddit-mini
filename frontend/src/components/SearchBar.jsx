import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputGroup, FormControl } from 'react-bootstrap';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import api from '../utils/api';
import Popup from './Popup';

function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');

  const onSearch = async () => {
    if (!query.trim()) {
      return;
    }

    try {
      const res = await api.get(`/api/search/?q=${query}`);
      navigate('/post/search', { state: { results: res.data } });
    } catch (error) {
      const msg = error.message
        ? `${error.message}.`
        : 'An unexpected error occurred.';
      console.log(error);
      setPopupMsg(msg);
      setShowPopup(true);
      navigate('/');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch();
    }
  };

  return (
    <div className="mt-3">
      <Popup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title="Search Error"
        message={popupMsg}
      />
      <InputGroup>
        <InputGroup.Text>
          <FontAwesomeIcon icon={faSearch} />
        </InputGroup.Text>
        <FormControl
          placeholder="Search by title, content, or author"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search"
        />
      </InputGroup>
    </div>
  );
}

export default SearchBar;
