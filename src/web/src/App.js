import React, { useState } from 'react';
import './App.css';

function App() {
  const [tree, setTree] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tempPath, setTempPath] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTree(null);
    setPreviewUrl(null);
    setTempPath(null);
    const formData = new FormData();
    const file = e.target.psd.files[0];
    if (!file) return;
    formData.append('psd', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setTree(data.tree);
        setTempPath(data.tempPath);
        setPreviewUrl(`/api/preview/${encodeURIComponent(data.tempPath)}`);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PSD Preview & Smart Object Editor (Experimental)</h1>
        <form onSubmit={handleUpload}>
          <input type="file" name="psd" accept=".psd" required />
          <button type="submit">Upload PSD</button>
        </form>
        {loading && <p>Uploading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {previewUrl && (
          <div style={{ margin: '1em 0' }}>
            <h2>Preview</h2>
            <img src={previewUrl} alt="PSD Preview" style={{ maxWidth: 600, maxHeight: 400, borderRadius: 8, boxShadow: '0 2px 8px #0008' }} loading="lazy" />
          </div>
        )}
        <h2>Layer Tree</h2>
        <pre style={{ textAlign: 'left', background: '#222', color: '#fff', padding: '1em', borderRadius: '5px', maxHeight: 400, overflow: 'auto' }}>
          {tree ? JSON.stringify(tree, null, 2) : 'No PSD uploaded yet.'}
        </pre>
      </header>
    </div>
  );
}

export default App;
