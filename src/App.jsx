import React, { useState } from 'react';
import Header from './components/Header';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import MapView from './components/MapView';
import AmbulanceAlert from './components/AmbulanceAlert';

function App() {
  const [densities, setDensities] = useState({ NORTH: 0, SOUTH: 0, EAST: 0, WEST: 0 });
  const [signals, setSignals] = useState({ NORTH: 'G', SOUTH: 'G', EAST: 'R', WEST: 'R' });
  const [countdown, setCountdown] = useState(15);
  const [isEmergency, setIsEmergency] = useState(false);

  // Derive peak lane
  const peakLane = Object.keys(densities).reduce((a, b) => densities[a] > densities[b] ? a : b, 'NONE');
  const maxDensity = densities[peakLane] || 0;

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden relative">
      <AmbulanceAlert isEmergency={isEmergency} />
      
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        {/* Left Sidebar - Hidden on mobile, flex on desktop */}
        <div className="hidden lg:flex">
          <SidebarLeft densities={densities} peakLane={maxDensity > 0 ? peakLane : null} />
        </div>

        {/* Center Map - Takes up remaining space */}
        <MapView 
          isEmergency={isEmergency}
          setDensities={setDensities}
          setSignals={setSignals}
          setCountdown={setCountdown}
          onEmergencyCleared={() => setIsEmergency(false)}
        />

        {/* Right Sidebar - Hidden on mobile, flex on desktop */}
        <div className="hidden lg:flex">
          <SidebarRight 
            signals={signals} 
            countdown={countdown} 
            isEmergency={isEmergency}
            onTriggerEmergency={() => setIsEmergency(true)}
          />
        </div>

        {/* Mobile bottom stack for essential controls (if on small device) */}
        <div className="flex lg:hidden flex-col gap-2 overflow-y-auto">
           <SidebarLeft densities={densities} peakLane={maxDensity > 0 ? peakLane : null} />
           <SidebarRight 
            signals={signals} 
            countdown={countdown} 
            isEmergency={isEmergency}
            onTriggerEmergency={() => setIsEmergency(true)}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
