import React from 'react';
import './App.css';

function App() {
  return (
    <div className="container">
      <h1>Identus 50 - QA/QC Dashboard</h1>
      <div className="card">
        <h2>Identus 50</h2>
        <p><strong>Dirección:</strong> 123 Biscayne Ave, Miami, FL</p>
        <p><strong>Contratista:</strong> Nottos Electrical</p>
        <p><strong>PM:</strong> Carlos Lopez</p>
      </div>
      
      <h3>Edificios</h3>
      <div className="grid">
        <div className="card">
          <h4>Clubhouse</h4>
          <p>Pisos: 1</p>
          <p>Unidades por piso: 1</p>
        </div>
        <div className="card">
          <h4>Parking</h4>
          <p>Pisos: 1</p>
          <p>Unidades por piso: 1</p>
        </div>
      </div>
    </div>
  );
}

export default App;