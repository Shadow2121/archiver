import React, { useState, useEffect } from 'react';
import { fetchAuthSession, signOut } from '@aws-amplify/auth'; // <--- Correct Amplify Auth imports for v6
import axios from 'axios'; // <--- Import axios
import './Dashboard.css'; // Assuming your CSS file is here
import { useNavigate } from 'react-router-dom'; 

function Dashboard({ user }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  // Define your API Gateway endpoint directly or import from aws-exports
  // We'll use the URL from Chat.jsx as a template, but you should use your Archiver API URL
  const apiUrl = "https://qgpfx91ang.execute-api.us-east-1.amazonaws.com/v1"; // <--- **IMPORTANT: Replace with your actual Archiver API Gateway URL**

  // Function to fetch URLs from the backend using axios
  const fetchUrls = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await fetchAuthSession(); // <--- Use fetchAuthSession
      const idToken = session.tokens?.idToken?.toString(); // Get the ID Token

      const response = await axios.post(
        `${apiUrl}/listurls`, // Your API path for listing URLs
        {},
        {
          headers: {
            Authorization: `${idToken}` // Manually include the JWT token
          }
        }
      );

      console.log('API response data:', response.data);

      console.log('URLs fetched successfully:', response.data);
      setUrls(response.data); // Assuming your lambda returns an array directly
    } catch (err) {
      console.error('Error fetching URLs:', err);
      // Update error message based on axios error structure
      setError(`Failed to load URLs. Details: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [user]);

  const handleAddNewLink = () => {
    navigate('/add-url'); 
    // This will be expanded in a later step
  };

  const handleSignOut = async () => {
    try {
      await signOut(); // <--- Use signOut from @aws-amplify/auth
      window.location.href = "/login"; // Redirect to login page
    } catch (err) {
      console.error("Error signing out:", err);
      // You might want to add a toast notification here as well
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-main"> {/* Renamed to avoid confusion with internal card headers */}
        <h2>Welcome to your Archiver Dashboard, {user.username}!</h2>
        <button onClick={handleSignOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>Your Archived URLs</h3>
          <button className="add-link-button" onClick={handleAddNewLink}>
            + Add New Link
          </button>
        </div>

        {loading && <p>Loading URLs...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && urls.length === 0 && !error && (
          <p>You haven't added any URLs for archiving yet. Click "Add New Link" to get started!</p>
        )}

        {!loading && urls.length > 0 && (
          <table className="urls-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Archived</th>
                <th>Versions</th> {/* Added this column based on your data structure */}
              </tr>
            </thead>
            <tbody>
              {urls.map((urlItem, index) => (
                <tr key={index}>
                  <td>
                    <a href={urlItem.Url} target="_blank" rel="noopener noreferrer"> {/* Make the URL clickable */}
                      {urlItem.Url}
                    </a>
                  </td>
                  <td>
                    {urlItem.Versions && urlItem.Versions.length > 0
                      ? new Date(urlItem.Versions[0].Timestamp).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    {/* Display number of versions and potentially a button to view them */}
                    {urlItem.Versions && urlItem.Versions.length > 0 ? (
                      <button onClick={() =>  navigate(`/versions`, {
                        state: { url: urlItem.Url }
                      })}> 
                        View ({urlItem.Versions.length})
                      </button>
                    ) : 'No versions'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;