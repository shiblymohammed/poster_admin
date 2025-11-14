import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle, Check, Upload, X } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

function CreateCampaign() {
  const [campaignName, setCampaignName] = useState('');
  const [frameFiles, setFrameFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setError('Please select valid image files (PNG recommended)');
      return;
    }

    // Limit to 10 frames total
    const newFrames = [...frameFiles, ...validFiles].slice(0, 10);
    setFrameFiles(newFrames);
    setError('');
    
    if (newFrames.length >= 10) {
      setError('Maximum 10 frames allowed per campaign');
    }
  };

  const removeFrame = (index) => {
    setFrameFiles(frameFiles.filter((_, i) => i !== index));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files);
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
    if (!campaignName.trim()) {
      setError('Campaign name is required');
      return;
    }
    if (frameFiles.length === 0) {
      setError('Please upload at least one frame image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      
      // Step 1: Create campaign with first frame
      const formData = new FormData();
      formData.append('name', campaignName);
      formData.append('frame', frameFiles[0]);

      const response = await axios.post(
        `${API_URL}/api/admin/campaign/`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      const campaignId = response.data.id;

      // Step 2: Upload additional frames if any
      if (frameFiles.length > 1) {
        for (let i = 1; i < frameFiles.length; i++) {
          const frameFormData = new FormData();
          frameFormData.append('name', `Frame ${i + 1}`);
          frameFormData.append('frame', frameFiles[i]);
          frameFormData.append('is_default', 'false');

          await axios.post(
            `${API_URL}/api/admin/campaign/${campaignId}/frames/`,
            frameFormData,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              } 
            }
          );
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
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
              onClick={() => navigate('/dashboard')}
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
        <div className="container" style={{ maxWidth: '600px' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: 'var(--color-gray-900)',
              marginBottom: '0.5rem'
            }}>
              Create Campaign
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--color-gray-600)'
            }}>
              Create a new campaign to organize your frames
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
                Campaign created successfully! Redirecting...
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
              {/* Campaign Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--color-gray-700)',
                  marginBottom: '0.5rem'
                }}>
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Election 2024"
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

              {/* Frame Upload */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--color-gray-700)',
                  marginBottom: '0.5rem'
                }}>
                  Frame Images (up to 10)
                </label>

                {/* Upload Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-gray-300)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    backgroundColor: isDragging ? '#eff6ff' : 'transparent',
                    transition: 'all 0.2s',
                    marginBottom: frameFiles.length > 0 ? '1rem' : '0'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    style={{ display: 'none' }}
                    id="frame-input"
                    disabled={frameFiles.length >= 10}
                  />
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    margin: '0 auto 0.75rem',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Upload style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-gray-600)' }} />
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--color-gray-700)',
                    marginBottom: '0.5rem'
                  }}>
                    {isDragging ? 'Drop here' : 'Drag and drop multiple files or'}
                  </p>
                  <label
                    htmlFor="frame-input"
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      backgroundColor: frameFiles.length >= 10 ? 'var(--color-gray-400)' : 'var(--color-primary)',
                      color: 'var(--color-white)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: frameFiles.length >= 10 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {frameFiles.length >= 10 ? 'Max Frames Reached' : 'Choose Files'}
                  </label>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    color: 'var(--color-gray-500)',
                    marginTop: '0.5rem'
                  }}>
                    PNG recommended for transparency • {frameFiles.length}/10 frames
                  </p>
                </div>

                {/* Preview Grid */}
                {frameFiles.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    {frameFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          border: '1px solid var(--color-gray-200)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          backgroundColor: 'var(--color-gray-50)'
                        }}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Frame ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeFrame(index)}
                          style={{
                            position: 'absolute',
                            top: '0.25rem',
                            right: '0.25rem',
                            width: '1.5rem',
                            height: '1.5rem',
                            backgroundColor: 'var(--color-error)',
                            color: 'var(--color-white)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-md)'
                          }}
                        >
                          <X style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <div style={{
                          position: 'absolute',
                          bottom: '0.25rem',
                          left: '0.25rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: 'var(--color-white)',
                          padding: '0.125rem 0.375rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.625rem',
                          fontFamily: 'var(--font-body)'
                        }}>
                          {index === 0 ? 'Default' : `#${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !campaignName.trim() || frameFiles.length === 0}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: loading || !campaignName.trim() || frameFiles.length === 0 ? 'var(--color-gray-400)' : 'var(--color-primary)',
                  color: 'var(--color-white)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: loading || !campaignName.trim() || frameFiles.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      border: '2px solid var(--color-white)',
                      borderTopColor: 'transparent',
                      borderRadius: '50%'
                    }}></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>Create Campaign</span>
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

export default CreateCampaign;
