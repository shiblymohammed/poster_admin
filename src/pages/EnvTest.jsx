import { API_URL } from '../config/api';

function EnvTest() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Environment Variable Test</h1>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>API_URL:</h2>
        <p style={{ fontSize: '1.2rem', color: API_URL.includes('localhost') ? 'red' : 'green' }}>
          {API_URL}
        </p>
        
        <h2 style={{ marginTop: '2rem' }}>Environment Variables:</h2>
        <pre style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify({
            VITE_API_URL: import.meta.env.VITE_API_URL,
            MODE: import.meta.env.MODE,
            DEV: import.meta.env.DEV,
            PROD: import.meta.env.PROD,
          }, null, 2)}
        </pre>

        <h2 style={{ marginTop: '2rem' }}>Test API Call:</h2>
        <button 
          onClick={async () => {
            try {
              const response = await fetch(`${API_URL}/api/admin/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'test', password: 'test' })
              });
              const data = await response.json();
              alert(`API Response: ${JSON.stringify(data)}`);
            } catch (err) {
              alert(`Error: ${err.message}`);
            }
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Test API Connection
        </button>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <h3>Expected Values:</h3>
          <ul>
            <li><strong>Local:</strong> http://localhost:8000</li>
            <li><strong>Production:</strong> https://postermaker-backend.onrender.com</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            If you see localhost in production, the environment variable is not set correctly in Vercel!
          </p>
        </div>
      </div>
    </div>
  );
}

export default EnvTest;
