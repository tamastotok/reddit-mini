import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { getTopicReports, resolveReport } from '../services/moderation';

const ModQueue = () => {
  const { topicId } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await getTopicReports(topicId);
      setReports(res.data);
    } catch (err) {
      console.error('Hiba a jelentések betöltésekor', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const handleAction = async (reportId, action) => {
    try {
      await resolveReport(reportId, action);
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (error) {
      alert('Hiba történt a művelet során.', error);
    }
  };

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">🛡️ Moderator Queue</h2>
      {reports.length === 0 ? (
        <p className="text-muted">Nincsenek függőben lévő jelentések.</p>
      ) : (
        <Table hover responsive className="shadow-sm border">
          <thead className="bg-light">
            <tr>
              <th>Reporter</th>
              <th>Reason</th>
              <th>Target Content</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>u/{report.reporter_name}</td>
                <td>
                  <Badge bg="warning" text="dark">
                    {report.reason}
                  </Badge>
                </td>
                <td>
                  <small
                    className="text-truncate d-inline-block"
                    style={{ maxWidth: '200px' }}
                  >
                    {report.description || 'Nincs leírás'}
                  </small>
                </td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleAction(report.id, 'dismiss')}
                  >
                    Keep (Dismiss)
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleAction(report.id, 'resolve')}
                  >
                    Delete & Resolve
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ModQueue;
