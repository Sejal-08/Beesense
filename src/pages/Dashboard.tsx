import { useState, useEffect } from 'react';
import { Hexagon, Activity, Waves, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../index.css';

// Types
interface Segment {
  filename: string;
  url: string;
}

interface DeviceSummary {
  id: string;
  lastActive: string;
}

const API_GATEWAY_URL = 'https://qy0g6eet0g.execute-api.us-east-1.amazonaws.com/default/FetchBeeAudioAPI';

export default function Dashboard() {
  const [deviceList, setDeviceList] = useState<DeviceSummary[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceSummary | null>(null);
  const [audioSegments, setAudioSegments] = useState<Segment[]>([]);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);

  // 1. Fetch the master list of devices
  const fetchDeviceList = async () => {
    setLoadingList(true);
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}?action=list_devices`);
      if (!response.ok) throw new Error('Failed to fetch device list');
      const data: DeviceSummary[] = await response.json();
      setDeviceList(data);
    } catch (err: any) {
      console.error(err);
      setError("Waiting for AWS API Gateway configuration...");
    } finally {
      setLoadingList(false);
    }
  };

  // 2. Fetch audio for a specific device when clicked (or dates change)
  const fetchDeviceAudio = async (deviceId: string) => {
    setLoadingAudio(true);
    try {
      const params = new URLSearchParams();
      params.append('action', 'get_audio');
      // Pass the raw ID (e.g. '22') by removing the 'device_' prefix if it exists
      const rawId = deviceId.replace('device_', '');
      params.append('device_id', rawId);
      
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      
      const response = await fetch(`${API_GATEWAY_URL}?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch audio');
      
      const data: Segment[] = await response.json();
      setAudioSegments(data);
    } catch (err: any) {
      console.error(err);
      // Fail silently for audio so it doesn't break the whole app, just shows empty
      setAudioSegments([]);
    } finally {
      setLoadingAudio(false);
    }
  };

  // Fetch device list immediately on load
  useEffect(() => {
    fetchDeviceList();
  }, []);

  // Whenever the selected device or dates change, fetch that specific audio
  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceAudio(selectedDevice.id);
    }
  }, [selectedDevice, startDate, endDate]);

  const handleDeviceClick = (device: DeviceSummary) => {
    if (selectedDevice?.id !== device.id) {
      setAudioSegments([]); // Clear old audio immediately
      setSelectedDevice(device);
    }
  };

  const handlePlay = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audios = document.getElementsByTagName('audio');
    for (let i = 0; i < audios.length; i++) {
      if (audios[i] !== e.currentTarget) {
        audios[i].pause();
      }
    }
  };

  const handleGlobalRefresh = () => {
    fetchDeviceList();
    if (selectedDevice) {
      fetchDeviceAudio(selectedDevice.id);
    }
  };

  const isDeviceActive = (lastActive?: string) => {
    if (!lastActive) return false;
    try {
      // Parse 'YYYY-MM-DD HH:MM:SS' as UTC by replacing space with T and appending Z
      const dateStr = lastActive.includes(' ') ? lastActive.replace(' ', 'T') + 'Z' : lastActive;
      const lastActiveDate = new Date(dateStr);
      const now = new Date();
      const diffHours = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    } catch {
      return false;
    }
  };

  return (
    <div className="app-container honeycomb-bg">
      <aside className="sidebar">
        <div className="sidebar-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center' }} title="Back to Home">
              <ArrowLeft size={24} />
            </Link>
            <Hexagon className="text-honey-primary" size={24} color="var(--color-honey-primary)" />
            <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Live Telemetry</h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0, paddingLeft: '36px' }}>
            Live Audio
          </p>
        </div>
        
        <div className="device-list">
          {loadingList ? (
             <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <RefreshCw className="animate-spin" size={20} />
             </div>
          ) : deviceList.length > 0 ? (
            deviceList.map((device) => {
              const active = isDeviceActive(device.lastActive);
              return (
                <button
                  key={device.id}
                  className={`device-item ${selectedDevice?.id === device.id ? 'active' : ''}`}
                  onClick={() => handleDeviceClick(device)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', color: active ? 'inherit' : 'var(--color-text-muted)' }}>
                    <Activity size={16} color={active ? '#10b981' : '#6b7280'} />
                    <span>Device {device.id.replace('device_', '')} {active ? '(Live)' : '(Inactive)'}</span>
                  </div>
                  {device.lastActive && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', paddingLeft: '24px' }}>
                      Last Active: {device.lastActive}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
               No devices registered in database.
            </div>
          )}
        </div>
        
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-primary)', colorScheme: 'dark', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-primary)', colorScheme: 'dark', fontFamily: 'inherit' }} />
          </div>
          <button 
            onClick={fetchDeviceList}
            style={{ width: '100%', padding: '10px', background: 'var(--color-bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
          >
            <RefreshCw size={16} /> Refresh Devices
          </button>
        </div>
      </aside>

      <main className="main-content">
        {error ? (
          <div className="empty-state">
            <AlertCircle size={64} color="#f59e0b" />
            <h3>Connection Pending</h3>
            <p>Please ensure the live data connection is configured properly.</p>
          </div>
        ) : !selectedDevice ? (
          <div className="empty-state">
            <Hexagon size={64} color="var(--color-honey-primary)" />
            <h3>Select a Device</h3>
            <p>Choose a device from the list to explore its recorded audio.</p>
          </div>
        ) : loadingAudio ? (
          <div className="empty-state">
            <RefreshCw className="animate-spin" size={64} color="var(--color-honey-primary)" style={{ animation: 'spin 1.5s linear infinite' }} />
            <h3>Fetching Audio Files...</h3>
            <p>Retrieving secure links from AWS...</p>
          </div>
        ) : (
          <>
            <header className="content-header" style={{ position: 'relative' }}>
              <div className="badge" style={{ background: '#10b98122', color: '#10b981', border: '1px solid #10b98155', display: 'inline-block' }}>
                + LIVE STREAM • {selectedDevice.id.toUpperCase()}
              </div>
              
              <button 
                onClick={handleGlobalRefresh}
                className="glass-panel-hover"
                style={{ position: 'absolute', top: '12px', right: '12px', padding: '10px', background: 'var(--color-bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Refresh All Data"
              >
                <RefreshCw size={18} />
              </button>

              <h2 style={{ marginTop: '12px' }}>Device {selectedDevice.id.replace('device_', '')} Audio Log</h2>
              <p>Explore the live acoustic data for {selectedDevice.id}. Select a segment below to listen.</p>
            </header>
            
            <div className="dashboard-scroll-area">
              <div className="audio-cards-grid">
                {audioSegments.length > 0 ? (
                  audioSegments.map((data, idx) => (
                    <div key={idx} className="audio-card-slim glass-panel glass-panel-hover">
                      <div className="audio-card-slim-header">
                        <span className="audio-filename">{data.filename.split('/').pop()}</span>
                        <div className="audio-wave-icon">
                          <Waves size={14} />
                        </div>
                      </div>
                      <div className="audio-player-slim">
                        <audio controls src={data.url} onPlay={handlePlay} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    color: 'var(--color-text-muted)', 
                    padding: '60px 20px', 
                    textAlign: 'center',
                    gridColumn: '1 / -1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ background: 'rgba(0,0,0,0.1)', padding: '24px', borderRadius: '50%', marginBottom: '16px' }}>
                      <Waves size={32} opacity={0.5} />
                    </div>
                    {startDate || endDate 
                      ? `No audio recordings found for the selected date range (${startDate} to ${endDate}).`
                      : "No audio segments found for this device yet."}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
