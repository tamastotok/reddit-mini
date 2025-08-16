import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import NavigationButton from '../../components/NavigationButton';
import SortDropdown from './SortDropdown';
import CategoryDropdown from './CategoryDropdown';
import PostList from './PostList';

function SearchPost() {
  const location = useLocation();
  const [sortOption, setSortOption] = useState('date-newest'); 
  const [selectedCategory, setSelectedCategory] = useState(''); 
  const results = location.state?.results || [];

  const filteredResults = results
    .filter((post) => !selectedCategory || post.category === selectedCategory)
    .sort((a, b) => {
      switch (sortOption) {
        case 'date-newest':
          return new Date(b.created_at) - new Date(a.created_at); 
        case 'date-oldest':
          return new Date(a.created_at) - new Date(b.created_at); 
        case 'most-popular':
        case 'least-popular':
          return a.total_votes - b.total_votes; 
        default:
          return 0;
      }
    });

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between ps-3 pe-3 mb-3">
        <h2>Search Results</h2>
        <NavigationButton variant="secondary" url="/" name="Back" />
      </div>

      <div className="d-flex mb-3">
        <SortDropdown
          sortOption={sortOption}
          onSortChange={(e) => setSortOption(e)}
        />
        <CategoryDropdown
          selectedCategory={selectedCategory}
          onCategoryChange={(e) => setSelectedCategory(e)}
        />
      </div>

      <PostList posts={filteredResults} />
    </div>
  );
}

export default SearchPost;