import { useState, useEffect } from 'react';
import { Hexagon, Activity, Waves, ArrowLeft, RefreshCw, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
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

interface HiveInsights {
  overall_status?: string;
  health_score?: number;
  swarm_risk?: string;
  queen_status?: string;
  foraging_activity?: string;
  disturbance_detected?: string;
  alert_severity?: string;
  inspection_recommendation?: string;
  temperature?: number;
  humidity?: number;
  rms_energy?: number;
  zcr?: number;
  spectral_centroid?: number;
  peak_frequency?: number;
  spectral_bandwidth?: number;
  spectral_entropy?: number;
  spectrogram_url?: string;
}

const API_GATEWAY_URL = 'https://qy0g6eet0g.execute-api.us-east-1.amazonaws.com/default/FetchBeeAudioAPI';

export default function Dashboard() {
  const [deviceList, setDeviceList] = useState<DeviceSummary[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceSummary | null>(null);
  const [audioSegments, setAudioSegments] = useState<Segment[]>([]);
  const [insights, setInsights] = useState<HiveInsights | null>(null);
  const [allMetrics, setAllMetrics] = useState<any[]>([]);
  
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

  // 2. Fetch audio and mock insights for a specific device
  const fetchDeviceData = async (deviceId: string) => {
    setLoadingAudio(true);
    
    // Fetch live acoustic metrics from DynamoDB via API Gateway
    const METRICS_API_URL = 'https://pymedugo4e.execute-api.us-east-1.amazonaws.com/';
    const url = new URL(METRICS_API_URL);
    url.searchParams.append('device_id', deviceId.replace('device_', ''));
    if (startDate) url.searchParams.append('start', startDate);
    if (endDate) url.searchParams.append('end', endDate);

    fetch(url.toString())
      .then(res => res.json())
      .then(data => {
        // Data is now an array of all timestamps for the selected dates!
        if (Array.isArray(data) && data.length > 0) {
          setAllMetrics(data);
          const latest = data[0]; // Grab the most recent entry for the banner
          if (latest.features) {
            setInsights({
              // Real telemetry straight from DynamoDB!
              rms_energy: latest.features.rms_energy,
              zcr: latest.features.zcr,
              spectral_centroid: latest.features.spectral_centroid,
              peak_frequency: latest.features.peak_frequency,
              spectral_bandwidth: latest.features.spectral_bandwidth,
              spectral_entropy: latest.features.spectral_entropy,
              // AI Insights
              overall_status: latest.insights?.overall_status,
              alert_severity: latest.insights?.alert_severity,
              inspection_recommendation: latest.insights?.inspection_recommendation,
              queen_status: latest.insights?.queen_status,
              health_score: latest.insights?.health_score,
              swarm_risk: latest.insights?.swarm_risk,
              foraging_activity: latest.insights?.foraging_activity
            });
          }
        } else {
          setInsights(null);
        }
      })
      .catch(err => console.error("Error fetching metrics:", err));

    try {
      const params = new URLSearchParams();
      params.append('action', 'get_audio');
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
      setAudioSegments([]);
    } finally {
      setLoadingAudio(false);
    }
  };

  useEffect(() => {
    fetchDeviceList();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceData(selectedDevice.id);
    }
  }, [selectedDevice, startDate, endDate]);

  const handleDeviceClick = (device: DeviceSummary) => {
    if (selectedDevice?.id !== device.id) {
      setAudioSegments([]); 
      setInsights(null);
      setSelectedDevice(device);
    }
  };

  const handlePlay = (e: React.SyntheticEvent<HTMLAudioElement>, segment: Segment) => {
    const audios = document.getElementsByTagName('audio');
    for (let i = 0; i < audios.length; i++) {
      if (audios[i] !== e.currentTarget) {
        audios[i].pause();
      }
    }
    
    // Extract timestamp from the filename to match with DynamoDB 'timestamp'
    // e.g., "audio_2026-08-03_15-43-12.wav" -> "2026-08-03 15:43:12"
    const filenameOnly = segment.filename.split('/').pop() || '';
    const rawTimeStr = filenameOnly.replace('audio_', '').replace('.wav', '');
    let formattedTimestamp = '';
    if (rawTimeStr.includes('_')) {
      const [datePart, timePart] = rawTimeStr.split('_');
      formattedTimestamp = `${datePart} ${timePart.replace(/-/g, ':')}`;
    } else {
      formattedTimestamp = rawTimeStr;
    }
    
    // Find the specific metrics for this audio file
    const matchedMetric = allMetrics.find(m => m.timestamp === formattedTimestamp || m.s3_key === segment.filename);
    
    if (matchedMetric && matchedMetric.features) {
      setInsights({
        rms_energy: matchedMetric.features.rms_energy,
        zcr: matchedMetric.features.zcr,
        spectral_centroid: matchedMetric.features.spectral_centroid,
        peak_frequency: matchedMetric.features.peak_frequency,
        spectral_bandwidth: matchedMetric.features.spectral_bandwidth,
        spectral_entropy: matchedMetric.features.spectral_entropy,
        overall_status: matchedMetric.insights?.overall_status,
        alert_severity: matchedMetric.insights?.alert_severity,
        inspection_recommendation: matchedMetric.insights?.inspection_recommendation,
        queen_status: matchedMetric.insights?.queen_status,
        health_score: matchedMetric.insights?.health_score,
        swarm_risk: matchedMetric.insights?.swarm_risk,
        foraging_activity: matchedMetric.insights?.foraging_activity
      });
    } else {
      console.log("No matching metric found for timestamp:", formattedTimestamp, "or s3_key:", segment.filename);
    }
  };

  const handleGlobalRefresh = () => {
    fetchDeviceList();
    if (selectedDevice) {
      fetchDeviceData(selectedDevice.id);
    }
  };

  const isDeviceActive = (lastActive?: string) => {
    if (!lastActive) return false;
    try {
      const dateStr = lastActive.includes(' ') ? lastActive.replace(' ', 'T') + 'Z' : lastActive;
      const lastActiveDate = new Date(dateStr);
      const now = new Date();
      const diffHours = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);
      return diffHours <= 6;
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-primary)', colorScheme: 'dark', fontFamily: 'inherit', width: '100%' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-primary)', colorScheme: 'dark', fontFamily: 'inherit', width: '100%' }} />
            </div>
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
            <p>Choose a device from the list to explore AI insights and acoustic data.</p>
          </div>
        ) : loadingAudio ? (
          <div className="empty-state">
            <RefreshCw className="animate-spin" size={64} color="var(--color-honey-primary)" style={{ animation: 'spin 1.5s linear infinite' }} />
            <h3>Analyzing Acoustic Data...</h3>
            <p>Extracting Mel Spectrograms and generating AI insights.</p>
          </div>
        ) : (
          <>
            <header className="content-header" style={{ position: 'relative' }}>
              <div className="badge" style={{ background: '#10b98122', color: '#10b981', border: '1px solid #10b98155', display: 'inline-block' }}>
                + AI ANALYSIS • {selectedDevice.id.toUpperCase()}
              </div>
              
              <button 
                onClick={handleGlobalRefresh}
                className="glass-panel-hover"
                style={{ position: 'absolute', top: '12px', right: '12px', padding: '10px', background: 'transparent', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Refresh All Data"
              >
                <RefreshCw size={18} />
              </button>

              <h2 style={{ marginTop: '12px', fontFamily: '"Georgia", serif', fontSize: '2.5rem', fontWeight: 400 }}>Device {selectedDevice.id.replace('device_', '')} AI insights</h2>
              
              {/* --- AI INSIGHTS BANNER --- */}
              {insights && insights.overall_status && (
                <div style={{ marginTop: '20px', marginBottom: '8px' }}>
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: (insights.overall_status.includes('No Significant') || insights.overall_status.includes('No Bee')) ? '#eadba8' : '#e0f2e9',
                    border: `1px solid ${(insights.overall_status.includes('No Significant') || insights.overall_status.includes('No Bee')) ? '#cca82b' : '#86cfa7'}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{
                      color: (insights.overall_status.includes('No Significant') || insights.overall_status.includes('No Bee')) ? '#876906' : '#1e8449',
                      marginTop: '2px'
                    }}>
                      {(insights.overall_status.includes('No Significant') || insights.overall_status.includes('No Bee')) ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: (insights.overall_status.includes('No Significant') || insights.overall_status.includes('No Bee')) ? '#6b5305' : '#0f4224'
                      }}>
                        {insights.overall_status.replace('⚠ ', '').replace('✅ ', '').replace('🟢 ', '').replace('🟡 ', '').replace('🔴 ', '')}
                      </h3>
                      {insights.inspection_recommendation && (
                        <p style={{ margin: 0, color: (insights.overall_status.includes('No Significant') || insights.overall_status.includes('No Bee')) ? '#6b5305' : '#196b3a', fontSize: '0.9rem' }}>
                          {insights.inspection_recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
            </header>
            <div className="content-divider" style={{ margin: '0 48px' }}></div>
            
            <div className="dashboard-scroll-area">

              <div className="dashboard-split-view">
                
                {/* --- LEFT COLUMN: INSIGHTS --- */}
                <div className="insights-column">
                  
                  {/* HEALTH DIAGNOSTICS */}
                  {insights && insights.health_score !== undefined && (
                    <div style={{ marginBottom: '48px' }}>
                      <div className="section-title-clean">HEALTH DIAGNOSTICS</div>
                      <div className="insight-panel">
                        <div className="insight-list">
                          <div className="insight-list-item">
                            <span className="insight-label">Hive health score</span>
                            <span className="insight-value">{insights.health_score === 0 ? '--' : insights.health_score}</span>
                          </div>
                          <div className="insight-list-item">
                            <span className="insight-label">Queen status</span>
                            <span className="insight-value" style={{ color: insights.queen_status === 'Absent' ? '#ef4444' : 'inherit' }}>{insights.queen_status === 'N/A' ? 'Not detected' : (insights.queen_status || '--')}</span>
                          </div>
                          <div className="insight-list-item">
                            <span className="insight-label">Alert severity</span>
                            <span className="insight-value" style={{ color: insights.alert_severity === 'High' ? '#ef4444' : 'inherit' }}>{insights.alert_severity === 'None' ? 'No alert' : (insights.alert_severity || '--')}</span>
                          </div>
                          <div className="insight-list-item">
                            <span className="insight-label">Swarm risk</span>
                            <span className="insight-value" style={{ color: insights.swarm_risk === 'High' ? '#ef4444' : 'inherit' }}>{insights.swarm_risk === 'N/A' ? '--' : (insights.swarm_risk || '--')}</span>
                          </div>
                          <div className="insight-list-item">
                            <span className="insight-label">Foraging activity</span>
                            <span className="insight-value">{insights.foraging_activity === 'N/A' ? '--' : (insights.foraging_activity || '--')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TECHNICAL ACOUSTICS */}
                  {insights && (
                    <div>
                      <div className="section-title-clean">TECHNICAL ACOUSTICS</div>
                      <div className="insight-panel">
                        <div className="insight-list">
                          <div className="insight-list-item">
                            <span className="insight-label">RMS energy</span>
                            <span className="insight-value">{insights.rms_energy ? insights.rms_energy.toFixed(4) : '0'}</span>
                          </div>
                          <div className="insight-list-item">
                            <span className="insight-label">Zero crossing</span>
                            <span className="insight-value">{insights.zcr ? insights.zcr.toFixed(5) : '0'}</span>
                          </div>
                          <div className="insight-list-item">
                            <span className="insight-label">Spectral centroid</span>
                            <span className="insight-value">{insights.spectral_centroid ? insights.spectral_centroid.toFixed(1) : '0'} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Hz</span></span>
                          </div>
                          <div className="insight-list-item">
                            <span className="insight-label">Peak frequency</span>
                            <span className="insight-value">{insights.peak_frequency ? insights.peak_frequency.toFixed(1) : '0'} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Hz</span></span>
                          </div>
                          <div className="insight-list-item">
                            <span className="insight-label">Bandwidth</span>
                            <span className="insight-value">{insights.spectral_bandwidth ? insights.spectral_bandwidth.toFixed(1) : '0'} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Hz</span></span>
                          </div>
                          <div className="insight-list-item">
                            <span className="insight-label">Entropy</span>
                            <span className="insight-value">{insights.spectral_entropy ? insights.spectral_entropy.toFixed(3) : '0'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- RIGHT COLUMN: AUDIO --- */}
                <div className="audio-column">
                  <div className="section-title-clean">
                    <span>AUDIO RECORDINGS</span>
                    <span style={{ fontWeight: 400, textTransform: 'none' }}>{audioSegments.length} clips</span>
                  </div>
                  
                  <div className="audio-cards-grid">
                    {audioSegments.length > 0 ? (
                      (() => {
                        const grouped: Record<string, typeof audioSegments> = {};
                        audioSegments.forEach(data => {
                          const dateMatch = data.filename.match(/\d{4}-\d{2}-\d{2}/);
                          const datePart = dateMatch ? dateMatch[0] : 'Unknown'; 
                          const dateLabel = datePart.length > 5 ? datePart.substring(5) : datePart;
                          
                          if (!grouped[dateLabel]) grouped[dateLabel] = [];
                          grouped[dateLabel].push(data);
                        });

                        return Object.entries(grouped).map(([dateLabel, segments]) => (
                          <div key={dateLabel} style={{ marginBottom: '24px' }}>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '12px', fontFamily: 'monospace' }}>
                              {dateLabel}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {segments.map((data, idx) => (
                                <div key={idx} className="audio-card-minimal">
                                  <span className="audio-filename">{data.filename.split('_').pop()}</span>
                                  <audio controls src={data.url} onPlay={(e) => handlePlay(e, data)} style={{ flex: 1, height: '32px' }} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()
                    ) : (
                      <div style={{ color: 'var(--color-text-muted)', padding: '40px 20px', textAlign: 'center' }}>
                        No audio segments found.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
