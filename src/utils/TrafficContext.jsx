import React, { createContext, useContext, useState, useEffect } from 'react';

const TrafficContext = createContext();

export const useTraffic = () => useContext(TrafficContext);

export const TrafficProvider = ({ children }) => {
  const [data, setData] = useState({
    densities: { north: 0, south: 0, east: 0, west: 0 },
    signals: { north: "R", south: "R", east: "R", west: "R" },
    emergency: null,
    health: { fps: 0, latency: 0, hardware: false },
    timestamp: "--:--:--"
  });

  const [mode, setMode] = useState("simulation");

  // Simulation Logic
  useEffect(() => {
    if (mode !== "simulation") return;
    const id = setInterval(() => {
      setData(prev => ({
        ...prev,
        densities: {
          north: Math.floor(Math.random() * 30),
          south: Math.floor(Math.random() * 30),
          east: Math.floor(Math.random() * 30),
          west: Math.floor(Math.random() * 30)
        },
        health: { fps: 30, latency: 15, hardware: false },
        timestamp: new Date().toLocaleTimeString()
      }));
    }, 5000);
    return () => clearInterval(id);
  }, [mode]);

  // Live Logic
  useEffect(() => {
    if (mode !== "live") return;
    const fetchLive = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/status");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.warn("Live API not found, falling back to offline indicators");
      }
    };
    const id = setInterval(fetchLive, 3000);
    return () => clearInterval(id);
  }, [mode]);

  return (
    <TrafficContext.Provider value={{ data, setData, mode, setMode }}>
      {children}
    </TrafficContext.Provider>
  );
};
