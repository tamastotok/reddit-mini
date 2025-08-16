import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import api from '../utils/api';

function SearchBar() {
  const [query, setQuery] = useState('');

  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const res = await api.get(`/api/search/?q=${query}`);
      navigate('/post/search', { state: { results: res.data } });

      console.log(res.data);
    } catch (error) {
      navigate('/post/search', { state: { results: [] } });
    }
  };

  return (
    <div className="mt-3">
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search by title, content, or author"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search"
        />
        <Button variant="primary" onClick={handleSearch}>
          Search
        </Button>
      </InputGroup>
    </div>
  );
}

export default SearchBar;
