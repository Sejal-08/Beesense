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

const MiniChart = ({ 
  data, 
  title, 
  valueKey, 
  color, 
  unit, 
  Icon 
}: { 
  data: any[], 
  title: string, 
  valueKey: string, 
  color: string, 
  unit: string,
  Icon: any
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  
  if (data.length === 0) return null;

  const width = 400;
  const height = 180;
  const padding = 30;

  const values = data.map(d => parseFloat(d[valueKey]));
  const minVal = Math.floor(Math.min(...values) - 2);
  const maxVal = Math.ceil(Math.max(...values) + 2);

  const getX = (index: number) => padding + (index / Math.max(1, data.length - 1)) * (width - 2 * padding);
  const getY = (val: number) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);

  const points = data.map((d, i) => `${getX(i)},${getY(parseFloat(d[valueKey]))}`).join(' ');
  const latestVal = data[data.length - 1][valueKey];

  return (
    <div className="mini-chart-card">
      <div className="chart-header">
        <div className="chart-title">
          <Icon size={14} fill={color} color={color} />
          {title}
        </div>
        <div className="chart-latest-value" style={{ border: `1px solid ${color}33`, color: 'var(--color-text-primary)' }}>
          {latestVal}{unit}
        </div>
      </div>
      
      <div 
        className="svg-container"
        onMouseLeave={() => setHoverIdx(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) * (width / rect.width);
          let closest = 0;
          let minDist = Infinity;
          data.forEach((_, i) => {
            const px = getX(i);
            const dist = Math.abs(px - x);
            if (dist < minDist) {
              minDist = dist;
              closest = i;
            }
          });
          setHoverIdx(closest);
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line key={ratio} x1={padding} y1={padding + ratio * (height - 2 * padding)} x2={width - padding} y2={padding + ratio * (height - 2 * padding)} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
          ))}
          
          <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
          
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(parseFloat(d[valueKey]))} r={hoverIdx === i ? "6" : "4"} fill="var(--color-bg-panel)" stroke={color} strokeWidth="2" style={{ transition: 'all 0.2s ease' }} />
              {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
                <text x={getX(i)} y={height - 5} fill="var(--color-text-muted)" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  {d.time}
                </text>
              )}
            </g>
          ))}
          
          {hoverIdx !== null && (
            <g>
              <line x1={getX(hoverIdx)} y1={padding} x2={getX(hoverIdx)} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="2 2" />
              <rect x={getX(hoverIdx) - 25} y={getY(parseFloat(data[hoverIdx][valueKey])) - 35} width="50" height="24" rx="4" fill="var(--color-bg-panel)" stroke={color} />
              <text x={getX(hoverIdx)} y={getY(parseFloat(data[hoverIdx][valueKey])) - 18} fill="var(--color-text-primary)" fontSize="10" textAnchor="middle" fontWeight="bold">
                {data[hoverIdx][valueKey]}{unit}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
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
