import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { createReport } from '../services/moderation';

const REASON_CHOICES = [
  { value: 'spam', label: 'Spam / Kéretlen tartalom' },
  { value: 'harassment', label: 'Zaklatás / Gyűlöletbeszéd' },
  { value: 'misinformation', label: 'Félretájékoztatás' },
  { value: 'inappropriate', label: 'Nem megfelelő tartalom' },
  { value: 'other', label: 'Egyéb' },
];

const ReportComponent = ({ show, onHide, postId = null, commentId = null }) => {
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReport({
        post: postId,
        comment: commentId,
        reason: reason,
        description: description,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onHide();
      }, 2000);
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="h5">Report Content</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success ? (
          <Alert variant="success">
            Köszönjük! A jelentést elküldtük a moderátoroknak.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Mi a probléma?</Form.Label>
              <Form.Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REASON_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">
                Részletek (opcionális)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Írd le röviden miért jelented..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="light"
                onClick={onHide}
                disabled={loading}
                className="rounded-pill px-4"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                type="submit"
                disabled={loading}
                className="rounded-pill px-4"
              >
                {loading ? 'Sending...' : 'Send Report'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ReportComponent;
