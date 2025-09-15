export default function Custom500() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#dc2626',
      fontFamily: 'Arial, sans-serif',
      flexDirection: 'column'
    }}>
      <h1>500 - Server Error</h1>
      <p>Something went wrong on our end. Please try again later.</p>
    </div>
  );
}
