import React from "react";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";

// Dynamically import the settings content to avoid SSR issues
const SettingsContent = dynamic(() => import("../components/SettingsContent"), {
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
      Loading Settings...
    </div>
  )
});

function Settings() {
  return (
    <Layout>
      <SettingsContent />
    </Layout>
  );
}

// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default Settings;