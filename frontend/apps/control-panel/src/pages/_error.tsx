import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

function Error({ statusCode }: ErrorProps) {
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
      <h1>{statusCode ? `Error ${statusCode}` : 'An error occurred'}</h1>
      <p>Something went wrong. Please try again later.</p>
    </div>
  );
}

export default Error;
