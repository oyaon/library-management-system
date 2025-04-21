import React from 'react';

const AdminPage: React.FC = () => {
  return (
    <div style={{ padding: 32 }}>
      <h2>Admin Dashboard</h2>
      <p>Welcome, admin! This page is only accessible to users with the 'admin' role.</p>
    </div>
  );
};

export default AdminPage;
