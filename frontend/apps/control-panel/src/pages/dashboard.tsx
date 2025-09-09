import React from "react";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

// Dynamically import the dashboard content to avoid SSR issues
const DashboardContent = dynamic(() => import("../components/DashboardContent"), {
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
      Loading Dashboard...
    </div>
  )
});

function Dashboard() {
  return (
    <ProtectedRoute>
      <Layout>
        <DashboardContent />
      </Layout>
    </ProtectedRoute>
  );
}

// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default Dashboard;