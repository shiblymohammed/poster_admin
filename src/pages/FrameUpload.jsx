import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

function FrameUpload() {
  const { campaignId } = useParams();
  const [frameName, setFrameName] = useState('');
  const [frameFile, setFrameFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFrameFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError('');
    } else {
      setError('Please select a valid image file (PNG recommended)');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!frameFile || !frameName) {
      setError('Please provide both frame name and image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('name', frameName);
      formData.append('frame_image', frameFile);

      await axios.post(
        `${API_URL}/api/admin/campaign/${campaignId}/frames/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate(`/frames/${campaignId}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload frame');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFrameFile(null);
    setPreviewUrl('');
    setFrameName('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-gray-200)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(`/frames/${campaignId}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--color-gray-600)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem'
              }}
            >
              <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '1.5rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: 'var(--color-gray-900)',
              marginBottom: '0.5rem'
            }}>
              Upload Frame
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--color-gray-600)'
            }}>
              Add a new frame to your campaign
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Check style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-success)' }} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-success)' }}>
                Frame uploaded successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-error)' }} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-error)' }}>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--color-gray-200)',
              padding: '1.5rem'
            }}>
              {/* Frame Name Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--color-gray-700)',
                  marginBottom: '0.5rem'
                }}>
                  Frame Name
                </label>
                <input
                  type="text"
                  value={frameName}
                  onChange={(e) => setFrameName(e.target.value)}
                  placeholder="e.g., Victory Frame"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-gray-300)'}
                />
              </div>

              {/* File Upload */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--color-gray-700)',
                  marginBottom: '0.5rem'
                }}>
                  Frame Image
                </label>

                {!frameFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    style={{
                      border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-gray-300)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '3rem 1rem',
                      textAlign: 'center',
                      backgroundColor: isDragging ? '#eff6ff' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                      style={{ display: 'none' }}
                      id="file-input"
                    />
                    <div style={{
                      width: '4rem',
                      height: '4rem',
                      margin: '0 auto 1rem',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-gray-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Upload style={{ width: '2rem', height: '2rem', color: 'var(--color-gray-600)' }} />
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'var(--color-gray-900)',
                      marginBottom: '0.5rem'
                    }}>
                      {isDragging ? 'Drop your image here' : 'Drag and drop your frame'}
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: 'var(--color-gray-600)',
                      marginBottom: '1rem'
                    }}>
                      or click the button below
                    </p>
                    <label
                      htmlFor="file-input"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-white)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Choose File
                    </label>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.75rem',
                      color: 'var(--color-gray-500)',
                      marginTop: '1rem'
                    }}>
                      PNG recommended for transparency
                    </p>
                  </div>
                ) : (
                  <div style={{
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    position: 'relative'
                  }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        borderRadius: 'var(--radius-md)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleClear}
                      style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        width: '2rem',
                        height: '2rem',
                        backgroundColor: 'var(--color-white)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-md)',
                        border: '1px solid var(--color-gray-200)'
                      }}
                    >
                      <X style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-gray-600)' }} />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !frameFile || !frameName}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: uploading || !frameFile || !frameName ? 'var(--color-gray-400)' : 'var(--color-primary)',
                  color: 'var(--color-white)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: uploading || !frameFile || !frameName ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? (
                  <>
                    <div className="spinner" style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      border: '2px solid var(--color-white)',
                      borderTopColor: 'transparent',
                      borderRadius: '50%'
                    }}></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>Upload Frame</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default FrameUpload;
