import React from "react";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";

// Dynamically import the user exposer content to avoid SSR issues
const UserExposerContent = dynamic(() => import("../components/UserExposerContent"), {
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
      Loading User Risk Management...
    </div>
  )
});

function UserExposer() {
  return (
    <Layout>
      <UserExposerContent />
    </Layout>
  );
}

// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default UserExposer;