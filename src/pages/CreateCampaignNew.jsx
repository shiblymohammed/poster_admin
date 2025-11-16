import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle, Check, Upload, X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

function CreateCampaignNew() {
  const [campaignName, setCampaignName] = useState('');
  const [posterFile, setPosterFile] = useState(null);
  const [frameFile, setFrameFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePosterSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPosterFile(file);
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleFrameSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFrameFile(file);
      setError('');
    } else {
      setError('Please select a valid image file (PNG recommended)');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!campaignName.trim()) {
      setError('Campaign name is required');
      return;
    }

    if (!posterFile) {
      setError('Poster background is required');
      return;
    }

    if (!frameFile) {
      setError('Frame is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      
      // Step 1: Create campaign with frame
      const campaignFormData = new FormData();
      campaignFormData.append('name', campaignName);
      campaignFormData.append('frame', frameFile);

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

      // Step 2: Upload poster
      const posterFormData = new FormData();
      posterFormData.append('poster', posterFile);
      posterFormData.append('name', 'Poster');
      posterFormData.append('is_default', 'true');

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
            Upload 1 poster background and 1 frame for your campaign
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
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--color-gray-900)',
                fontFamily: 'var(--font-display)'
              }}>
                Poster Background *
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-gray-600)',
                fontFamily: 'var(--font-body)'
              }}>
                Upload the background image for your campaign
              </p>
            </div>

            {!posterFile ? (
              <label style={{ cursor: 'pointer', display: 'block' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterSelect}
                  style={{ display: 'none' }}
                />
                <div style={{
                  border: '2px dashed var(--color-gray-300)',
                  borderRadius: '0.5rem',
                  padding: '3rem',
                  textAlign: 'center',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-gray-300)'}
                >
                  <ImageIcon style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: 'var(--color-gray-400)' }} />
                  <p style={{ color: 'var(--color-gray-600)', fontFamily: 'var(--font-body)' }}>Click to upload poster</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', fontFamily: 'var(--font-body)', marginTop: '0.5rem' }}>
                    JPG, PNG recommended
                  </p>
                </div>
              </label>
            ) : (
              <div style={{ position: 'relative', maxWidth: '400px' }}>
                <img
                  src={URL.createObjectURL(posterFile)}
                  alt="Poster"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '0.5rem',
                    border: '2px solid var(--color-gray-200)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPosterFile(null)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem'
                  }}
                >
                  <X style={{ width: '1rem', height: '1rem' }} />
                  Remove
                </button>
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
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--color-gray-900)',
                fontFamily: 'var(--font-display)'
              }}>
                Frame (Overlay) *
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-gray-600)',
                fontFamily: 'var(--font-body)'
              }}>
                Upload frame overlay (PNG with transparency recommended)
              </p>
            </div>

            {!frameFile ? (
              <label style={{ cursor: 'pointer', display: 'block' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFrameSelect}
                  style={{ display: 'none' }}
                />
                <div style={{
                  border: '2px dashed var(--color-gray-300)',
                  borderRadius: '0.5rem',
                  padding: '3rem',
                  textAlign: 'center',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-gray-300)'}
                >
                  <Upload style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: 'var(--color-gray-400)' }} />
                  <p style={{ color: 'var(--color-gray-600)', fontFamily: 'var(--font-body)' }}>Click to upload frame</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', fontFamily: 'var(--font-body)', marginTop: '0.5rem' }}>
                    PNG with transparency recommended
                  </p>
                </div>
              </label>
            ) : (
              <div style={{ position: 'relative', maxWidth: '400px' }}>
                <img
                  src={URL.createObjectURL(frameFile)}
                  alt="Frame"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '0.5rem',
                    border: '2px solid var(--color-gray-200)',
                    backgroundColor: 'var(--color-gray-100)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFrameFile(null)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem'
                  }}
                >
                  <X style={{ width: '1rem', height: '1rem' }} />
                  Remove
                </button>
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
              disabled={loading || !posterFile || !frameFile}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: (loading || !posterFile || !frameFile) ? 'var(--color-gray-400)' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (loading || !posterFile || !frameFile) ? 'not-allowed' : 'pointer',
                opacity: (loading || !posterFile || !frameFile) ? 0.5 : 1,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading && posterFile && frameFile) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && posterFile && frameFile) {
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
