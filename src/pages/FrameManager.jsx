import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Image as ImageIcon, AlertCircle, Copy, Check, ExternalLink, Save, X } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

function FrameManager() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaignAndFrames();
  }, [campaignId]);

  const fetchCampaignAndFrames = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch campaign details
      const campaignRes = await axios.get(
        `${API_URL}/api/admin/campaign/${campaignId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCampaign(campaignRes.data);

      // Fetch frames
      const framesRes = await axios.get(
        `${API_URL}/api/admin/campaign/${campaignId}/frames/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFrames(framesRes.data.frames || []);
    } catch (err) {
      setError('Failed to load frames');
      if (err.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = () => {
    if (campaign?.slug) {
      const userSiteUrl = import.meta.env.VITE_USER_SITE_URL || 'http://localhost:5173';
      const url = `${userSiteUrl}/${campaign.slug}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openCampaign = () => {
    if (campaign?.slug) {
      const userSiteUrl = import.meta.env.VITE_USER_SITE_URL || 'http://localhost:5173';
      window.open(`${userSiteUrl}/${campaign.slug}`, '_blank');
    }
  };

  const startEdit = () => {
    setEditName(campaign?.name || '');
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditName('');
  };

  const saveCampaignName = async () => {
    if (!editName.trim()) {
      setError('Campaign name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('name', editName);

      const response = await axios.put(
        `${API_URL}/api/admin/campaign/${campaignId}/`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCampaign(response.data);
      setEditMode(false);
      setError('');
    } catch (err) {
      setError('Failed to update campaign name');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (frameId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${API_URL}/api/admin/campaign/${campaignId}/frames/${frameId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFrames(frames.filter(f => f.id !== frameId));
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete frame');
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
        <div className="container">
          {/* Page Header */}
          <div style={{ marginBottom: '2rem' }}>
            {editMode ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    border: '2px solid var(--color-primary)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    color: 'var(--color-gray-900)',
                    outline: 'none'
                  }}
                  autoFocus
                />
                <button
                  onClick={saveCampaignName}
                  disabled={saving}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-success)',
                    color: 'var(--color-white)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Save style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-gray-300)',
                    color: 'var(--color-gray-700)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  color: 'var(--color-gray-900)',
                  margin: 0
                }}>
                  {campaign?.name || 'Campaign'} Frames
                </h1>
                <button
                  onClick={startEdit}
                  style={{
                    padding: '0.375rem',
                    color: 'var(--color-gray-600)',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray-600)'}
                >
                  <Edit style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>
            )}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--color-gray-600)',
              marginBottom: '1rem'
            }}>
              Manage frames for this campaign
            </p>
            
            {/* Campaign URL Actions */}
            {campaign && (
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginTop: '1rem'
              }}>
                <button
                  onClick={copyUrl}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: copied ? 'var(--color-success)' : 'var(--color-white)',
                    color: copied ? 'var(--color-white)' : 'var(--color-gray-700)',
                    border: copied ? 'none' : '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {copied ? (
                    <>
                      <Check style={{ width: '1rem', height: '1rem' }} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy style={{ width: '1rem', height: '1rem' }} />
                      <span>Copy Campaign URL</span>
                    </>
                  )}
                </button>
                <button
                  onClick={openCampaign}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--color-white)',
                    color: 'var(--color-gray-700)',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-white)';
                  }}
                >
                  <ExternalLink style={{ width: '1rem', height: '1rem' }} />
                  <span>Open Campaign</span>
                </button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div style={{ marginBottom: '2rem' }}>
            <button
              onClick={() => navigate(`/upload/${campaignId}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            >
              <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
              <span>Upload Frame</span>
            </button>
          </div>

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

          {/* Loading State */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div className="spinner" style={{
                width: '3rem',
                height: '3rem',
                border: '4px solid var(--color-primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%'
              }}></div>
            </div>
          )}

          {/* Frames Grid */}
          {!loading && frames.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {frames.map((frame) => (
                <div
                  key={frame.id}
                  style={{
                    backgroundColor: 'var(--color-white)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--color-gray-200)',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                >
                  {/* Frame Image */}
                  <div style={{
                    aspectRatio: '1',
                    backgroundColor: 'var(--color-gray-100)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {frame.frame_url ? (
                      <img
                        src={frame.frame_url}
                        alt={frame.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ImageIcon style={{ width: '3rem', height: '3rem', color: 'var(--color-gray-400)' }} />
                      </div>
                    )}
                  </div>

                  {/* Frame Info */}
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'var(--color-gray-900)',
                      marginBottom: '0.5rem'
                    }}>
                      {frame.name}
                    </h3>
                    
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        onClick={() => setDeleteConfirm(frame.id)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          border: '1px solid var(--color-gray-300)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--color-error)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.borderColor = 'var(--color-error)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'var(--color-gray-300)';
                        }}
                      >
                        <Trash2 style={{ width: '1rem', height: '1rem' }} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && frames.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--color-gray-300)'
            }}>
              <ImageIcon style={{ 
                width: '4rem', 
                height: '4rem', 
                color: 'var(--color-gray-400)',
                margin: '0 auto 1rem'
              }} />
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                color: 'var(--color-gray-900)',
                marginBottom: '0.5rem'
              }}>
                No frames yet
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--color-gray-600)',
                marginBottom: '1.5rem'
              }}>
                Upload your first frame to get started
              </p>
              <button
                onClick={() => navigate(`/upload/${campaignId}`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-white)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>Upload Frame</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              color: 'var(--color-gray-900)',
              marginBottom: '0.5rem'
            }}>
              Delete Frame?
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--color-gray-600)',
              marginBottom: '1.5rem'
            }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--color-gray-700)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-error)',
                  color: 'var(--color-white)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FrameManager;
