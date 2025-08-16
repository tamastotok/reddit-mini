import { Form } from 'react-bootstrap';

function CategorySelect({ category, setCategory }) {
  return (
    <Form.Group controlId="formCategory" className="mt-3">
      <Form.Label>Category</Form.Label>
      <Form.Control
        as="select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      >
        <option value="technology">Technology</option>
        <option value="science">Science</option>
        <option value="health">Health</option>
        <option value="education">Education</option>
        <option value="business">Business</option>
        <option value="finance">Finance</option>
        <option value="lifestyle">Lifestyle</option>
        <option value="travel">Travel</option>
        <option value="food">Food</option>
        <option value="sports">Sports</option>
        <option value="entertainment">Entertainment</option>
        <option value="politics">Politics</option>
        <option value="environment">Environment</option>
        <option value="art_culture">Art & Culture</option>
        <option value="gaming">Gaming</option>
        <option value="productivity">Productivity</option>
        <option value="diy_crafts">DIY & Crafts</option>
        <option value="parenting">Parenting</option>
        <option value="fashion">Fashion</option>
        <option value="relationships">Relationships</option>
        <option value="custom">Custom</option>
      </Form.Control>
    </Form.Group>
  );
}

export default CategorySelect;
