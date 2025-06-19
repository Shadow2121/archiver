import React from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css'; // Default Amplify UI styles
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css'; 

import Dashboard from './components/Dashboard'; // Import your Dashboard component
import AddUrlPage from './components/AddUrlPage';
import ArchivedVersionsPage from './components/ArchivedVersionsPage';

function App({ signOut, user }) {
  // `signOut` and `user` are provided by `withAuthenticator` HOC

  return (
    <div>
    
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/login" element={<Dashboard user={user} />} />
        <Route path="/index.html" element={<Dashboard user={user} />} />
        <Route path="/add-url" element={<AddUrlPage user={user}  />} />
        <Route path="/versions" element={<ArchivedVersionsPage user={user} />} />
      </Routes>
    
    <button onClick={signOut} style={{ marginTop: '20px', padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
      Sign Out
    </button>
    </div>
  );
}

// Wrap your App component with withAuthenticator for easy authentication flow
export default withAuthenticator(App);