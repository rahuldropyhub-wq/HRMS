import './App.css'

function App() {
  return (
    <div style={{ width: '320px', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <img src="/vite.svg" alt="Logo" style={{ width: 24, height: 24 }} />
        <h2 style={{ fontSize: '16px', margin: 0, color: '#0f172a' }}>Dropyhub Activity</h2>
      </div>

      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Current Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>Extension is Active</span>
        </div>
      </div>
      
      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '16px', textAlign: 'center' }}>
        Linked to HRMS Session.
      </p>
    </div>
  )
}

export default App
