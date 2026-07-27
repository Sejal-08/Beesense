import { useState } from 'react';
import { Hexagon, Activity, Waves, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import devicesData from '../data/devices.json';
import annamLogo from '../assets/images/annam_ai_logo.jpg';
import '../index.css';

// Types
interface Segment {
  filename: string;
  url: string;
}

interface Device {
  id: string;
  name: string;
  segments: Segment[];
}

// Utility: Date Parser
const parseFilenameTime = (filename: string) => {
  let match = filename.match(/_(\d{2}-\d{2}-\d{4})_(\d{2}-\d{2}-\d{2})/);
  if (match) {
    const [, dateStr, timeStr] = match;
    const time = timeStr.split('-').slice(0, 2).join(':');
    return { date: dateStr, time };
  }
  
  match = filename.match(/(\d{4}-\d{2}-\d{2})--(\d{2}-\d{2}-\d{2})/);
  if (match) {
    const [, dateStr, timeStr] = match;
    const time = timeStr.split('-').slice(0, 2).join(':');
    return { date: dateStr, time };
  }

  return { date: 'Unknown', time: '00:00' };
};

// Utility: Metrics Generator
const getMetrics = (filename: string) => {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  const tempIn = (32 + (hash % 6) + (hash % 10) / 10).toFixed(1);
  const humIn = 55 + (hash % 15);
  
  const tempOut = (22 + ((hash >> 2) % 10) + (hash % 10) / 10).toFixed(1);
  const humOut = 45 + ((hash >> 2) % 25);
  
  return { tempIn, humIn, tempOut, humOut };
};



export default function Dashboard() {
  const devices = devicesData as Device[];
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handlePlay = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audios = document.getElementsByTagName('audio');
    for (let i = 0; i < audios.length; i++) {
      if (audios[i] !== e.currentTarget) {
        audios[i].pause();
      }
    }
  };

  const chartData = selectedDevice?.segments.map(s => {
    const timeInfo = parseFilenameTime(s.filename);
    const metrics = getMetrics(s.filename);
    return {
      ...timeInfo,
      ...metrics,
      filename: s.filename,
      url: s.url
    };
  }) || [];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '20px' }}>
          <img src={annamLogo} alt="Annam AI" className="logo-dark-mode" style={{ height: '36px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Hexagon className="text-honey-primary" size={28} color="#c68a4d" />
            <h1>Bee Audio Data</h1>
          </div>
        </div>
        <div style={{ padding: '0 24px 24px 24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.5px' }}>
            <ArrowLeft size={16} /> Back to BeeSense Home
          </Link>
        </div>
        <div className="device-list">
          {devices.map((device) => (
            <button
              key={device.id}
              className={`device-item ${selectedDevice?.id === device.id ? 'active' : ''}`}
              onClick={() => setSelectedDevice(device)}
            >
              <Activity size={16} />
              <span>{device.name}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="main-content">
        {selectedDevice ? (
          <>
            <header className="content-header">
              <div className="badge">+ SPECIMEN LOG • {selectedDevice.id.toUpperCase()}</div>
              <h2>{selectedDevice.name} Audio Segments</h2>
              <p>Explore the recorded acoustic data for {selectedDevice.id}. Select a segment below to listen.</p>
            </header>
            
            <div className="dashboard-scroll-area">
              {/* 
              <div className="section-title-sm">+ CLIMATE READINGS</div>
              
              <div className="charts-grid">
                <MiniChart data={chartData} title="Temperature — Inside Hive" valueKey="tempIn" color="#c68a4d" unit="°C" Icon={Hexagon} />
                <MiniChart data={chartData} title="Humidity — Inside Hive" valueKey="humIn" color="#6b8e23" unit="%" Icon={Hexagon} />
              </div>
              */}

              <div className="section-title-sm">+ RECORDED SEGMENTS</div>
              
              <div className="audio-cards-grid">
                {chartData.map((data, idx) => (
                  <div key={idx} className="audio-card-slim">
                    <div className="audio-card-slim-header">
                      <span className="audio-filename">{data.filename}</span>
                      <div className="audio-wave-icon">
                        <Waves size={14} />
                      </div>
                    </div>
                    <div className="audio-player-slim">
                      <audio controls src={data.url} onPlay={handlePlay} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Hexagon size={64} color="var(--color-honey-primary)" />
            <h3>Select a device to view audio data</h3>
            <p>Choose one of the devices from the sidebar to explore the recorded bee sounds.</p>
          </div>
        )}
      </main>
    </div>
  );
}
