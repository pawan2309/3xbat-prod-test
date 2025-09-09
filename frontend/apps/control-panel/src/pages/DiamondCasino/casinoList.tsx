import React from "react";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";

// Dynamically import the casino content to avoid SSR issues
const CasinoListContent = dynamic(() => import("../../components/CasinoListContent"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      fontSize: '18px',
      color: '#6b7280'
    }}>
      Loading Casino Operations...
    </div>
  )
});

function CasinoList() {
  return (
    <Layout>
      <CasinoListContent />
    </Layout>
  );
}

// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default CasinoList;