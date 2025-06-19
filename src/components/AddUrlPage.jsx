import React, { useState } from 'react';
import { fetchAuthSession } from '@aws-amplify/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './AddUrlPage.css'; // Optional: for specific styles

function AddUrlPage({ user }) {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // Hook to navigate programmatically

  // IMPORTANT: Replace with your actual Archiver API Gateway URL
  const apiUrl = "https://qgpfx91ang.execute-api.us-east-1.amazonaws.com/v1";

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!urlInput.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      console.log("urlInput:::::", urlInput)
      const response = await axios.post(
        `${apiUrl}/urls`, // Your API Gateway endpoint for adding a single URL
        { url: urlInput.trim() }, // Body of the request, as specified: {'url': '...'}
        {
          headers: {
            Authorization: `${idToken}` // Include the JWT token
          }
        }
      );

      console.log("URL submitted successfully:", response.data);
      setSuccess(true);
      setUrlInput(''); // Clear the input field
      // Optionally, redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard'); // Redirect to dashboard
      }, 1500); 

    } catch (err) {
      console.error("Error submitting URL:", err);
      setError(`Failed to add URL: ${err.response?.data?.message || err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-url-page-container">
      <h2>Add New URL for Archiving</h2>
      <form onSubmit={handleSubmit} className="add-url-form">
        <input
          type="url" // Use type="url" for built-in browser validation
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Enter full URL (e.g., https://www.example.com)"
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Archive URL'}
        </button>
        <button type="button" onClick={() => navigate('/dashboard')} disabled={loading}>
          Cancel
        </button>
      </form>

      {loading && <p className="status-message info">Loading...</p>}
      {error && <p className="status-message error">{error}</p>}
      {success && <p className="status-message success">URL added successfully! Redirecting...</p>}
    </div>
  );
}

export default AddUrlPage;