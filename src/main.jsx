import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom';

// AWS Amplify Imports
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports'; // Import your Amplify configuration

Amplify.configure(awsExports); // Configure Amplify with your settings


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
