import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import { fetchAuthSession } from '@aws-amplify/auth';
import axios from 'axios';
import './ArchivedVersionsPage.css'; // Create this CSS file for styling

function ArchivedVersionsPage({ user }) {
  const location = useLocation(); // <--- Get the location object
  const originalUrl = location.state?.url;

  const navigate = useNavigate();

  const [loadingPreview, setLoadingPreview] = useState(false); // <--- New state for preview loading
  const [previewError, setPreviewError] = useState(null); // <--- New state for preview error

  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for preview feature
  const [previewContent, setPreviewContent] = useState(null); // Stores the HTML content for preview
  const [previewLoading, setPreviewLoading] = useState(false);
  const [currentPreviewS3Path, setCurrentPreviewS3Path] = useState(null); // To highlight current previewed item


  // IMPORTANT: Your actual API Gateway URL
  const apiUrl = "https://qgpfx91ang.execute-api.us-east-1.amazonaws.com/v1";

  useEffect(() => {
    const fetchArchivedVersions = async () => {
      setLoading(true);
      setError(null);
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (!idToken) {
          setError("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }

        // Encode the URL here, right before using it in the API path
        
        // Fetch versions for the specific URL
        // API Gateway path is /retrieveArchives/{url} for GET method
        const response = await axios.post(
          `${apiUrl}/archives`, // Use the encoded URL in the path
          { url: originalUrl },
          {
            headers: {
              Authorization: `${idToken}`
            }
          }
        );

        // Assuming response.data is an array of version objects
        // Example: [{ Timestamp: "...", S3Path: "..." }]
        setVersions(response.data);
      } catch (err) {
        console.error('Error fetching archived versions:', err);
        setError(`Failed to load versions: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (originalUrl) {
      fetchArchivedVersions();
    }
  }, [originalUrl, user]); // Re-run effect if URL changes or user re-authenticates

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleViewArchive = async (s3Path) => {
    setLoadingPreview(true);
    setPreviewError(null);
    setPreviewContent(null); // Clear previous content
    setCurrentPreviewS3Path(s3Path); // Set current preview path for highlighting

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        setPreviewError("Authentication token not found. Please log in.");
        setLoadingPreview(false);
        return;
      }

      const response = await axios.post(
        `${apiUrl}/preview`, // Your API Gateway endpoint for generating presigned URL
        { path: s3Path }, // Body of the request, as expected by PreviewLambda
        {
          headers: {
            Authorization: `${idToken}` // Include the JWT token
          }
        }
      );

      const presignedUrl = response.data.presignedUrl; // Assuming your lambda returns { "presignedUrl": "..." }

      if (!presignedUrl) {
        throw new Error("Failed to get presigned URL for preview.");
      }
      // Fetch the content using the pre-signed URL (assuming it's HTML)
      const contentResponse = await axios.get(presignedUrl, {
        // You might need to adjust headers for fetching content directly from S3 pre-signed URL
        // withCredentials: true, // If cross-origin or auth is required
      });

      setPreviewContent(contentResponse.data); // Store the HTML content

    //   if (presignedUrl) {
    //     window.open(presignedUrl, '_blank'); // Open the presigned URL in a new tab
    //   } else {
    //     setPreviewError("Could not get a valid presigned URL.");
    //   }

    } catch (err) {
      console.error("Error generating presigned URL:", err);
      setPreviewError(`Failed to generate preview: ${err.response?.data?.message || err.message || err.toString()}`);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className="archived-versions-container">
      <h2>Archived Versions for:</h2>
      <p className="original-url-display">{originalUrl}</p>

      <button onClick={handleBackToDashboard} className="back-button">
        &larr; Back to Dashboard
      </button>

      {loading && <p>Loading archived versions...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && versions.length === 0 && !error && (
        <p>No archived versions found for this URL.</p>
      )}

      {!loading && versions.length > 0 && (
        <table className="versions-table">
          <thead>
            <tr>
              <th>Archived Date</th>
              <th>S3 Path</th>
              <th>View</th> {/* New column for viewing the actual archive */}
            </tr>
          </thead>
          <tbody>
            {versions.map((version, index) => (
              <tr key={index}>
                <td>{new Date(version.Timestamp).toLocaleDateString()}</td>
                <td>{version.S3Path}</td>
                <td>
                  {/* Change from <a> to <button> and call handleViewArchive */}
                  <button
                    onClick={() => handleViewArchive(version.S3Path)}
                    className="view-archive-button" // You might want to define this style in CSS
                    disabled={loadingPreview} // Disable button while a preview is loading
                  >
                    {loadingPreview ? 'Loading...' : 'View Archive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Preview Section */}
      <div className="preview-section">
        {previewLoading && <p className="status-message info">Loading preview...</p>}
        {previewError && <p className="status-message error">{previewError}</p>}
        {previewContent && (
          <>
            <h3>Preview of Archived Content:</h3>
            <div className="iframe-container">
              {/* Using dangerouslySetInnerHTML to render the HTML content directly */}
              <iframe
                srcDoc={previewContent}
                title="Archived Content Preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms" // Essential for security
                style={{ width: '100%', height: '500px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)' }}
              ></iframe>
            </div>
            <p className="info">Note: Some content (e.g., external CSS/JS, images with relative paths) might not render correctly in this inline preview.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ArchivedVersionsPage;