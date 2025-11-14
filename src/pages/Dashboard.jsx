import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Image, Edit, Trash2, LogOut, Zap, AlertCircle, Copy, Check } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Fetching campaigns with token:', token ? 'Token exists' : 'No token');
      const response = await axios.get(`${API_URL}/api/admin/campaigns/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Campaigns response:', response.data);
      setCampaigns(response.data.campaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to load campaigns');
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/api/admin/campaign/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(campaigns.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete campaign');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const copyUrl = (campaign) => {
    const url = `http://localhost:5173/${campaign.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(campaign.id);
    setTimeout(() => setCopiedId(null), 2000);
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)' }} />
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '1.25rem',
                color: 'var(--color-gray-900)'
              }}>
                LapoAitools
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                color: 'var(--color-gray-600)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gray-900)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray-600)'}
            >
              <LogOut style={{ width: '1.25rem', height: '1.25rem' }} />
              <span className="desktop-only">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '1.5rem 0' }}>
        <div className="container">
          {/* Page Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: 'var(--color-gray-900)',
              marginBottom: '0.5rem'
            }}>
              Campaigns
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--color-gray-600)'
            }}>
              Manage your election campaign posters
            </p>
          </div>

          {/* Create Button */}
          <div style={{ marginBottom: '2rem' }}>
            <button
              onClick={() => navigate('/create')}
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
              <span>Create Campaign</span>
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

          {/* Campaigns Grid */}
          {!loading && campaigns.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
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
                  {/* Campaign Header */}
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-gray-200)' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      color: 'var(--color-gray-900)',
                      marginBottom: '0.5rem'
                    }}>
                      {campaign.name}
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: 'var(--color-gray-600)'
                    }}>
                      Code: {campaign.code}
                    </p>
                  </div>

                  {/* Frame Count */}
                  <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--color-gray-50)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Image style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-gray-600)' }} />
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        color: 'var(--color-gray-600)'
                      }}>
                        {campaign.frame_count || 0} frames
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => navigate(`/frames/${campaign.id}`)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--color-white)',
                          borderRadius: 'var(--radius-md)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                      >
                        <Edit style={{ width: '1rem', height: '1rem' }} />
                        <span>Manage</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(campaign.id)}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid var(--color-gray-300)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--color-error)',
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
                      </button>
                    </div>
                    <button
                      onClick={() => copyUrl(campaign)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: copiedId === campaign.id ? 'var(--color-success)' : 'var(--color-white)',
                        color: copiedId === campaign.id ? 'var(--color-white)' : 'var(--color-gray-700)',
                        border: copiedId === campaign.id ? 'none' : '1px solid var(--color-gray-300)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                    >
                      {copiedId === campaign.id ? (
                        <>
                          <Check style={{ width: '1rem', height: '1rem' }} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy style={{ width: '1rem', height: '1rem' }} />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && campaigns.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--color-gray-300)'
            }}>
              <Image style={{ 
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
                No campaigns yet
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--color-gray-600)',
                marginBottom: '1.5rem'
              }}>
                Create your first campaign to get started
              </p>
              <button
                onClick={() => navigate('/create')}
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
                <span>Create Campaign</span>
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
              Delete Campaign?
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--color-gray-600)',
              marginBottom: '1.5rem'
            }}>
              This action cannot be undone. All frames will be deleted.
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

export default Dashboard;
