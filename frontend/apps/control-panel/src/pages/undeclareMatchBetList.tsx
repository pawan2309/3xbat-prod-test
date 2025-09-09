import React from "react";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";

// Dynamically import the bet management content to avoid SSR issues
const UndeclareMatchBetListContent = dynamic(() => import("../components/UndeclareMatchBetListContent"), {
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
      Loading Bet Management...
    </div>
  )
});

function UndeclareMatchBetList() {
  return (
    <Layout>
      <UndeclareMatchBetListContent />
    </Layout>
  );
}

// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default UndeclareMatchBetList;