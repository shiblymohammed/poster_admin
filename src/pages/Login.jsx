import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Zap, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // CRITICAL DEBUG - This should appear immediately
    console.log('=== FORM SUBMITTED ===');
    console.log('Username:', username);
    console.log('Password length:', password.length);
    
    setError('');
    setLoading(true);

    // Debug: Log API URL
    console.log('API URL:', API_URL);
    console.log('Login URL:', `${API_URL}/api/admin/login/`);
    console.log('Attempting login... (may take 30-60s if backend is sleeping)');

    try {
      const response = await axios.post(`${API_URL}/api/admin/login/`, {
        username,
        password
      }, {
        timeout: 60000 // 60 seconds timeout for cold start
      });

      console.log('Login successful!');
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error code:', err.code);
      console.error('Credentials sent:', { username, passwordLength: password.length });
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = 'Request timeout. Backend may be sleeping (Render free tier). Please wait 30 seconds and try again.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Backend may be down or URL is incorrect.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Server configuration error (400). ALLOWED_HOSTS not configured on Render.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid credentials. Use: aseeb / Dr.aseeb123';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" style={{ color: 'var(--color-primary)' }} />
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.25rem',
              color: 'var(--color-gray-900)'
            }}>
              LapoAitools Admin
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-gray-200)',
            padding: '2rem'
          }}>
            {/* Title */}
            <div className="text-center mb-8">
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.875rem',
                color: 'var(--color-gray-900)',
                marginBottom: '0.5rem'
              }}>
                Welcome Back
              </h1>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: 'var(--color-gray-600)'
              }}>
                Sign in to manage your campaigns
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-error)', flexShrink: 0 }} />
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--color-error)'
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--color-gray-700)',
                  marginBottom: '0.5rem'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-gray-300)'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--color-gray-700)',
                  marginBottom: '0.5rem'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-gray-300)'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: loading ? 'var(--color-gray-400)' : 'var(--color-primary)',
                  color: 'var(--color-white)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--color-primary-dark)')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'var(--color-primary)')}
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
