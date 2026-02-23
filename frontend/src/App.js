import { useState, useEffect } from "react";
import "@/App.css";
import DisclaimerScreen from "@/pages/DisclaimerScreen";
import Dashboard from "@/pages/Dashboard";
import AuthScreen from "@/pages/AuthScreen";
import { Toaster } from 'sonner';

function App() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user previously accepted disclaimer
    const accepted = localStorage.getItem('tokhealth_disclaimer_accepted');
    if (accepted === 'true') {
      setDisclaimerAccepted(true);
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('tokhealth_token');
    const user = localStorage.getItem('tokhealth_user');
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
    
    setLoading(false);
  }, []);

  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('tokhealth_token');
    localStorage.removeItem('tokhealth_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="animate-pulse text-sky-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      {!disclaimerAccepted ? (
        <DisclaimerScreen onAccept={handleAcceptDisclaimer} />
      ) : !isAuthenticated ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <Dashboard currentUser={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
