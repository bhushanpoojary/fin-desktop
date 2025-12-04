/**
 * Ultra-simple test component - no dependencies
 */
export default function UltraMinimalTest() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', fontSize: '32px', marginBottom: '20px' }}>
        🎉 Electron Window Loaded Successfully!
      </h1>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#4CAF50', marginTop: 0 }}>✅ Status: Working</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          If you can see this message, React is rendering correctly in Electron.
        </p>
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          URL: {window.location.href}
        </p>
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          User Agent: {navigator.userAgent.includes('Electron') ? '✅ Running in Electron' : '⚠️ Running in Browser'}
        </p>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffc107'
      }}>
        <h3 style={{ marginTop: 0, color: '#856404' }}>Next Steps:</h3>
        <ol style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <li>Verify this shows in Electron window</li>
          <li>Check browser DevTools console (Ctrl+Shift+I in Electron)</li>
          <li>Gradually add more components</li>
        </ol>
      </div>
    </div>
  );
}
