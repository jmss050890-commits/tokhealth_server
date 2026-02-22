import { useState, useEffect } from "react";
import "@/App.css";
import DisclaimerScreen from "@/pages/DisclaimerScreen";
import Dashboard from "@/pages/Dashboard";

function App() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    // Check if user previously accepted disclaimer
    const accepted = localStorage.getItem('tokhealth_disclaimer_accepted');
    if (accepted === 'true') {
      setDisclaimerAccepted(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
  };

  return (
    <div className="App">
      {!disclaimerAccepted ? (
        <DisclaimerScreen onAccept={handleAcceptDisclaimer} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

export default App;
