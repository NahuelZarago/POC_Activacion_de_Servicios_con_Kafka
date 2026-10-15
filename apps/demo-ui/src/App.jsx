import { useState } from 'react';

function App() {
  const [status, setStatus] = useState('Esperando interacción...');

  const handleActivate = async (failureMode) => {
    setStatus('Procesando solicitud de activación...');
    
    try {
      const res = await fetch('http://localhost:3000/activations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: `C-${Math.floor(Math.random() * 10000)}`,
          planId: 'Plan Digital',
          simulateFailure: failureMode
        })
      });
      
      const data = await res.json();
      setStatus(`¡Petición enviada! ID de Activación: ${data.activationId} (Estado: ${data.status})`);
    } catch (error) {
      setStatus('Error: No se pudo conectar con el API de activación (Revisá que activation-api esté corriendo).');
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>POC Activación de Servicios con Kafka</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Panel de control para simular la coreografía de eventos. Cada botón inyecta un escenario diferente en la arquitectura.
      </p>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={() => handleActivate('none')}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          ▶️ Camino Feliz (Sin fallos)
        </button>

        <button 
          onClick={() => handleActivate('billing')}
          style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          🛑 Forzar fallo en Billing
        </button>

        <button 
          onClick={() => handleActivate('provisioning')}
          style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          ⚠️ Forzar fallo en Provisioning
        </button>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Estado del Frontend:</h3>
        <code style={{ fontSize: '1.1em', color: '#1f2937' }}>{status}</code>
      </div>
    </div>
  )
}

export default App;