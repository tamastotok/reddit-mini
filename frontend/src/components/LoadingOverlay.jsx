function LoadingOverlay({ loading }) {
  if (!loading) return null;
  return (
    <div
      className="loader-container position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start bg-light bg-opacity-50"
      style={{ zIndex: 1050, paddingTop: '30vh' }}
    >
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
