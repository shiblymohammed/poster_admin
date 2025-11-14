import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import FrameUpload from './pages/FrameUpload';
import FrameManager from './pages/FrameManager';
import EnvTest from './pages/EnvTest';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create" 
          element={
            <ProtectedRoute>
              <CreateCampaign />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/frames/:campaignId" 
          element={
            <ProtectedRoute>
              <FrameManager />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/upload/:campaignId" 
          element={
            <ProtectedRoute>
              <FrameUpload />
            </ProtectedRoute>
          } 
        />
        <Route path="/env-test" element={<EnvTest />} />
      </Routes>
    </Router>
  );
}

export default App;
