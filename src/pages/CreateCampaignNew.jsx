import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle, Check, Upload, X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

function CreateCampaignNew() {
  const [campaignName, setCampaignName] = useState('');
  const [posterFiles, setPosterFiles] = useState([]);
  const [frameFiles, setFrameFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePosterSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    // Limit to 10 posters total
    const newPosters = [...posterFiles, ...validFiles].slice(0, 10);
    setPosterFiles(newPosters);
    setError('');
  };

  const handleFrameSelect = (files) => {
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
  };

  const removePoster = (index) => {
    setPosterFiles(posterFiles.filter((_, i) => i !== index));
  };

  const removeFrame = (index) => {
    setFrameFiles(frameFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!campaignName.trim()) {
      setError('Campaign name is required');
      return;
    }

    if (posterFiles.length === 0) {
      setError('At least one poster background is required');
      return;
    }

    if (frameFiles.length === 0) {
      setError('At least one frame is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      
      // Step 1: Create campaign with first frame (for backward compatibility)
      const campaignFormData = new FormData();
      campaignFormData.append('name', campaignName);
      campaignFormData.append('frame', frameFiles[0]);

      const campaignResponse = await axios.post(
        `${API_URL}/api/admin/campaign/`,
        campaignFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const campaignId = campaignResponse.data.id;

      // Step 2: Upload posters
      for (let i = 0; i < posterFiles.length; i++) {
        const posterFormData = new FormData();
        posterFormData.append('poster', posterFiles[i]);
        posterFormData.append('name', `Poster ${i + 1}`);
        posterFormData.append('is_default', i === 0 ? 'true' : 'false');

        await axios.post(
          `${API_URL}/api/admin/campaign/${campaignId}/posters/`,
          posterFormData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      // Step 3: Upload additional frames (skip first one, already uploaded)
      for (let i = 1; i < frameFiles.length; i++) {
        const frameFormData = new FormData();
        frameFormData.append('frame', frameFiles[i]);
        frameFormData.append('name', `Frame ${i + 1}`);
        frameFormData.append('is_default', 'false');

        await axios.post(
          `${API_URL}/api/admin/campaign/${campaignId}/frames/`,
          frameFormData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err.response?.data?.error || 'Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-gray-50)' }}>
      <div className="container" style={{ maxWidth: '64rem', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-gray-600)',
              fontFamily: 'var(--font-body)',
              marginBottom: '1rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gray-900)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray-600)'}
          >
            <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
            Back to Dashboard
          </button>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--color-gray-900)'
          }}>
            Create New Campaign
          </h1>
          <p style={{
            color: 'var(--color-gray-600)',
            fontFamily: 'var(--font-body)',
            marginTop: '0.5rem'
          }}>
            Upload poster backgrounds and frames for your campaign
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Check style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
            <span style={{ color: '#166534', fontFamily: 'var(--font-body)' }}>
              Campaign created successfully! Redirecting...
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626' }} />
            <span style={{ color: '#991b1b', fontFamily: 'var(--font-body)' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Campaign Name */}
          <div style={{
            backgroundColor: 'var(--color-white)',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-gray-700)',
              fontFamily: 'var(--font-body)',
              marginBottom: '0.5rem'
            }}>
              Campaign Name *
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Election 2024"
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                border: '1px solid var(--color-gray-300)',
                borderRadius: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          {/* Poster Upload */}
          <div style={{
            backgroundColor: 'var(--color-white)',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--color-gray-900)',
                  fontFamily: 'var(--font-display)'
                }}>
                  Poster Backgrounds
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-gray-600)',
                  fontFamily: 'var(--font-body)'
                }}>
                  Upload background images for your campaign (max 10)
                </p>
              </div>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePosterSelect(e.target.files)}
                  style={{ display: 'none' }}
                  disabled={posterFiles.length >= 10}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontFamily: 'var(--font-body)',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                  Add Posters
                </div>
              </label>
            </div>

            {posterFiles.length === 0 ? (
              <div style={{
                border: '2px dashed var(--color-gray-300)',
                borderRadius: '0.5rem',
                padding: '3rem',
                textAlign: 'center'
              }}>
                <ImageIcon style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: 'var(--color-gray-400)' }} />
                <p style={{ color: 'var(--color-gray-600)', fontFamily: 'var(--font-body)' }}>No posters uploaded yet</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', fontFamily: 'var(--font-body)', marginTop: '0.5rem' }}>
                  Click "Add Posters" to upload background images
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {posterFiles.map((file, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Poster ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        border: '2px solid var(--color-gray-200)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePoster(index)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        padding: '0.25rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <X style={{ width: '1rem', height: '1rem' }} />
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: '0.5rem',
                      left: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      fontSize: '0.75rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'var(--font-body)'
                    }}>
                      Poster {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Frame Upload */}
          <div style={{
            backgroundColor: 'var(--color-white)',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--color-gray-900)',
                  fontFamily: 'var(--font-display)'
                }}>
                  Frames (Overlays)
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-gray-600)',
                  fontFamily: 'var(--font-body)'
                }}>
                  Upload frame overlays (PNG with transparency recommended, max 10)
                </p>
              </div>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFrameSelect(e.target.files)}
                  style={{ display: 'none' }}
                  disabled={frameFiles.length >= 10}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontFamily: 'var(--font-body)',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                  Add Frames
                </div>
              </label>
            </div>

            {frameFiles.length === 0 ? (
              <div style={{
                border: '2px dashed var(--color-gray-300)',
                borderRadius: '0.5rem',
                padding: '3rem',
                textAlign: 'center'
              }}>
                <Upload style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: 'var(--color-gray-400)' }} />
                <p style={{ color: 'var(--color-gray-600)', fontFamily: 'var(--font-body)' }}>No frames uploaded yet</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', fontFamily: 'var(--font-body)', marginTop: '0.5rem' }}>
                  Click "Add Frames" to upload frame overlays
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {frameFiles.map((file, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Frame ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        border: '2px solid var(--color-gray-200)',
                        backgroundColor: 'var(--color-gray-100)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFrame(index)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        padding: '0.25rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <X style={{ width: '1rem', height: '1rem' }} />
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: '0.5rem',
                      left: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      fontSize: '0.75rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'var(--font-body)'
                    }}>
                      Frame {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                border: '1px solid var(--color-gray-300)',
                color: 'var(--color-gray-700)',
                backgroundColor: 'var(--color-white)',
                borderRadius: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--color-gray-50)')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-white)'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || posterFiles.length === 0 || frameFiles.length === 0}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: (loading || posterFiles.length === 0 || frameFiles.length === 0) ? 'var(--color-gray-400)' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (loading || posterFiles.length === 0 || frameFiles.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (loading || posterFiles.length === 0 || frameFiles.length === 0) ? 0.5 : 1,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading && posterFiles.length > 0 && frameFiles.length > 0) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && posterFiles.length > 0 && frameFiles.length > 0) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {loading ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCampaignNew;
