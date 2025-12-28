import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { Server, Database, Code } from 'lucide-react';

export default function Admin() {
  const { serverStatus } = useContext(DataContext);

  return (
    <div className="page">
      <h1>Panneau d'Administration</h1>

      <div className="admin-grid">
        <div className="info-section">
          <h2>
            <Server size={20} /> État du Serveur
          </h2>
          <div className="info-row">
            <span className="info-label">Statut:</span>
            <span style={{
              color: serverStatus === 'connected' ? '#10b981' : '#ef4444'
            }}>
              {serverStatus === 'connected' ? '✓ Connecté' : '✗ Déconnecté'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">API URL:</span>
            <span>http://localhost:5000/api</span>
          </div>
        </div>

        <div className="info-section">
          <h2>
            <Database size={20} /> Base de Données
          </h2>
          <div className="info-row">
            <span className="info-label">Type:</span>
            <span>SQLite3</span>
          </div>
          <div className="info-row">
            <span className="info-label">Fichier:</span>
            <span>water_quality.db</span>
          </div>
        </div>

        <div className="info-section">
          <h2>
            <Code size={20} /> Modèle ML
          </h2>
          <div className="info-row">
            <span className="info-label">Type:</span>
            <span>Gradient Boosting Classifier</span>
          </div>
          <div className="info-row">
            <span className="info-label">Classes:</span>
            <span>Good, Medium, Danger</span>
          </div>
          <div className="info-row">
            <span className="info-label">Accuracy:</span>
            <span>&gt;95%</span>
          </div>
        </div>
      </div>

      <div className="api-endpoints">
        <h2>Endpoints API</h2>
        <table className="endpoints-table">
          <thead>
            <tr>
              <th>Méthode</th>
              <th>Endpoint</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GET</td>
              <td>/health</td>
              <td>Vérifier serveur</td>
            </tr>
            <tr>
              <td>POST</td>
              <td>/sensor/data</td>
              <td>Envoyer données capteurs</td>
            </tr>
            <tr>
              <td>GET</td>
              <td>/readings</td>
              <td>Récupérer mesures</td>
            </tr>
            <tr>
              <td>GET</td>
              <td>/heatmap</td>
              <td>Données pour carte</td>
            </tr>
            <tr>
              <td>GET</td>
              <td>/statistics</td>
              <td>Statistiques</td>
            </tr>
            <tr>
              <td>POST</td>
              <td>/predict</td>
              <td>Prédiction uniquement</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
