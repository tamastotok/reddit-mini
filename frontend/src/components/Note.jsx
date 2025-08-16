import { Button } from 'react-bootstrap';

function Note({ note, onDelete }) {
  const date = new Date(note.created_at).toLocaleDateString();

  return (
    <div>
      <p className="note-title">{note.title}</p>
      <p className="note-content">{note.content}</p>
      <p className="note-date">{date}</p>
      <Button variant="danger" type="button" onClick={() => onDelete(note.id)}>
        Delete
      </Button>
    </div>
  );
}

export default Note;
