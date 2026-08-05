import { ArrowRight, ActivitySquare, BarChart3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import '../App.css';
import deployment7 from '../assets/images/7.jpeg';
import annamLogo from '../assets/images/annam_ai_logo.jpg';
import heroBee from '../assets/images/hero_bee.jpg';
import heroFlower1 from '../assets/images/hero_flower1.jpg';
import heroFlower2 from '../assets/images/hero_flower2.jpg';



const BeeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
    <ellipse cx="12" cy="14" rx="5" ry="7" fill="#d97706" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7.5 12.5 h9 M7.2 15 h9.6 M7.5 17.5 h9" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="7" r="2.5" fill="var(--color-bg-panel, transparent)" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 5 c-1 -2 -3 -1 -3 -1 M13.5 5 c1 -2 3 -1 3 -1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 11 c-3 -2 -4 1 -3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 11 c3 -2 4 1 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);


export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={annamLogo} alt="Annam AI" style={{ height: '36px' }} />
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 4px' }}></div>
          <BeeIcon />
          <span>BeeSense</span>
        </div>
        <div className="nav-actions">

          <button className="nav-cta" onClick={() => navigate('/dashboard')}>
            Live Data <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">+ INTELLIGENT HIVE MONITORING</div>
          <h1 className="hero-title">Every hive<br/>has a <span className="highlight">voice.</span></h1>
          <p className="hero-subtitle">
            BeeSense listens continuously to the low hum of the colony, turning raw acoustic signal into readable hive health — no frames pulled, no smoke, no disruption.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <Shield className="stat-icon" size={20} />
              <div>
                <span className="stat-value">Non-invasive</span>
                <span className="stat-label">HIVE STAYS SEALED</span>
              </div>
            </div>
            <div className="stat-item">
              <BarChart3 className="stat-icon" size={20} />
              <div>
                <span className="stat-value">Early detection</span>
                <span className="stat-label">DAYS OF LEAD TIME</span>
              </div>
            </div>
            <div className="stat-item">
              <ActivitySquare className="stat-icon" size={20} />
              <div>
                <span className="stat-value">Always listening</span>
                <span className="stat-label">24/7 CAPTURE</span>
              </div>
            </div>
          </div>

          <button className="primary-cta" onClick={() => navigate('/dashboard')}>
            View live dashboard <ArrowRight size={18} />
          </button>
        </div>
        
        <div className="hero-hex-grid-container">
          <div className="hex-grid-inner">
            <div className="hex-image-wrapper hex-top">
              <img src={heroBee} alt="Bee in flight" className="hex-image" />
            </div>
            <div className="hex-image-wrapper hex-bottom-left">
              <img src={heroFlower1} alt="Pink Aster" className="hex-image" />
            </div>
            <div className="hex-image-wrapper hex-bottom-right">
              <img src={heroFlower2} alt="Purple Flower" className="hex-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Bee Sounds Matter Section */}
      <section id="why-sounds-matter" className="why-sounds-section">
        <div className="section-header">
          <h2 className="section-title">Why bee sounds <em>matter</em></h2>
          <p className="section-subtitle">
            Colonies broadcast their condition constantly. Each state below has a distinct frequency fingerprint — BeeSense is trained to tell them apart.
          </p>
        </div>

        <div className="sounds-grid">
          <div className="sound-card">
            <div className="sound-card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 14h16M6 10h12M8 6h8M10 2h4" />
                <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
              </svg>
              <span className="sound-label">180-320 HZ</span>
              <h3>Normal Activity</h3>
            </div>
            <p>Steady, consistent buzzing indicates a healthy, active colony engaged in communication, brood care, and foraging.</p>
          </div>

          <div className="sound-card">
            <div className="sound-card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a93b26" strokeWidth="2">
                <circle cx="8" cy="8" r="3" fill="#a93b26" />
                <circle cx="16" cy="10" r="3" fill="#a93b26" />
                <circle cx="12" cy="16" r="3" fill="#a93b26" />
              </svg>
              <span className="sound-label">PITCH RISING</span>
              <h3>Swarming</h3>
            </div>
            <p>Pre-swarm frequency shifts serve as early warnings, allowing beekeepers to intervene and prevent significant colony loss.</p>
          </div>

          <div className="sound-card">
            <div className="sound-card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z" strokeDasharray="4 2" />
              </svg>
              <span className="sound-label">IRREGULAR</span>
              <h3>Queenless Colony</h3>
            </div>
            <p>Irregular, high-pitched buzzing often signals the loss of a queen, enabling timely intervention to restore stability.</p>
          </div>

          <div className="sound-card">
            <div className="sound-card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
              <span className="sound-label">TIGHT / RAPID</span>
              <h3>Heat Stress</h3>
            </div>
            <p>Distinctive sound patterns emerge when bees work to cool an overheated hive, allowing early detection of environmental stress.</p>
          </div>

          <div className="sound-card">
            <div className="sound-card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-honey-primary)" strokeWidth="2">
                <path d="M12 2L20 6.5V15.5L12 20L4 15.5V6.5L12 2Z" fill="var(--color-honey-primary)" />
                <path d="M12 20V11M12 11L20 6.5M12 11L4 6.5" stroke="#f4f1e1" />
              </svg>
              <span className="sound-label">AMPLITUDE</span>
              <h3>Colony Strength</h3>
            </div>
            <p>The intensity of hive sounds provides direct insights into colony activity, pollination potential, and honey production.</p>
          </div>
        </div>
      </section>

      {/* Applications and Benefits Section */}
      <section id="applications" className="features-section apps-section-dark">
        <div className="section-header">
          <h2 className="section-title" style={{ fontSize: '2.8rem', maxWidth: '800px', margin: '0 auto 16px' }}>Built for every scale,<br/>from the <em>whole field</em> to one hive.</h2>
          <p className="section-subtitle" style={{ maxWidth: '700px', margin: '0 auto 48px', fontSize: '1.05rem', lineHeight: '1.6' }}>
            The same acoustic signal that tracks a single colony's health scales to a<br/>
            dashboard for thousands — so every beekeeper, from backyard to<br/>
            broadacre, only shows up when it matters.
          </p>
        </div>

        <div className="hex-grid">
          {/* Card 01 */}
          <div className="hex-card">
            <span className="card-number">01</span>
            <div className="hex-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>Commercial Apiaries</h3>
            <p>Watch thousands of hives from one dashboard. <strong>Dispatch a beekeeper only when the AI flags a swarm risk</strong> — not on a fixed inspection schedule.</p>
          </div>

          {/* Card 02 */}
          <div className="hex-card">
            <span className="card-number">02</span>
            <div className="hex-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3>Precision Agriculture</h3>
            <p>Track foraging-activity indexes through bloom season so pollination hits its peak — and every acre gets covered <strong>right when it counts</strong>.</p>
          </div>
          
          {/* Card 03 */}
          <div className="hex-card">
            <span className="card-number">03</span>
            <div className="hex-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>Prevent Swarming</h3>
            <p>Catch the queen's acoustic "piping" and "quacking" days before a swarm. <strong>Step in early</strong> instead of losing half the colony overnight.</p>
          </div>

          {/* Card 04 */}
          <div className="hex-card">
            <span className="card-number">04</span>
            <div className="hex-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M4.93 4.93l1.41 1.41" />
                <path d="M17.66 17.66l1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="M6.34 17.66l-1.41 1.41" />
                <path d="M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <h3>Reduce Labor Costs</h3>
            <p>Stop opening healthy hives just to check on them. Let the AI listen around the clock and <strong>only call your crew out for real anomalies</strong>.</p>
          </div>

          {/* Card 05 */}
          <div className="hex-card">
            <span className="card-number">05</span>
            <div className="hex-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
              </svg>
            </div>
            <h3>Maximize Honey Yield</h3>
            <p>Read raw foraging activity straight from the hive's sound. <strong>Know the exact moment the nectar flow peaks</strong> and act on it.</p>
          </div>

          {/* Card 06 */}
          <div className="hex-card">
            <span className="card-number">06</span>
            <div className="hex-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Biosecurity & Pest Control</h3>
            <p>Recognize the chaotic acoustic signature of a wasp attack, hornet raid, or parasite outbreak — <strong>before the colony collapses</strong>.</p>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section id="capabilities" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Core <em>capabilities</em></h2>
          <p className="section-subtitle">
            Built for the field first — reliable at the edge, synced when it can reach the cloud.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </div>
            <h3>Hybrid Data Pipeline</h3>
            <p>Pairs real-time AWS GSM publishing with automated SD card backups to guarantee zero data loss during cellular dropouts.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" x2="20" y1="9" y2="9" />
                <line x1="4" x2="20" y1="15" y2="15" />
                <line x1="10" x2="8" y1="3" y2="21" />
                <line x1="16" x2="14" y1="3" y2="21" />
              </svg>
            </div>
            <h3>Smart Audio Processing</h3>
            <p>Utilizes advanced on-device edge processing to filter background noise, saving battery and transmitting only validated bee acoustics.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <h3>Environmental Monitoring</h3>
            <p>Onboard temperature, humidity, and barometric sensors track critical hive metrics to protect brood health and commercial yields.</p>
          </div>
        </div>
      </section>

      {/* Hardware Section */}
      <section id="hardware" className="hardware-section">
        <h2 className="section-title text-center" style={{ marginBottom: '48px' }}>Hardware <span className="highlight">Overview</span></h2>
        
        <div className="hardware-layout">
          <div className="assembly-visual">
            <img src={deployment7} alt="BeeSense Assembly" className="assembly-img" />
            <div className="glow-effect secondary"></div>
          </div>
          <div className="assembly-content">
            <p className="section-text" style={{ marginBottom: '32px' }}>
              Built on the ultra-low-power nRF5340 processor and a custom PCB, the BeeSense device combines a high-capacity Li-ion battery, digital microphone, and environmental sensors for durable, remote apiary monitoring.
            </p>
            
            <div className="specs-table-wrapper">
              <table className="specs-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Specification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Input voltage range</td>
                    <td>5 V External / 3.7 V Internal Li-ion</td>
                  </tr>
                  <tr>
                    <td>Processing architecture</td>
                    <td>Dual-Core ARM Cortex-M33 (nRF5340)</td>
                  </tr>
                  <tr>
                    <td>Memory</td>
                    <td>512 KB RAM + 16 MB SPI Flash Buffer</td>
                  </tr>
                  <tr>
                    <td>Cellular connectivity</td>
                    <td>EC200 GSM module</td>
                  </tr>
                  <tr>
                    <td>Audio interface</td>
                    <td>Digital Microphone (8/16 kHz, 16-bit Mono)</td>
                  </tr>
                  <tr>
                    <th>On-board Processing</th>
                    <td>Edge processing filtering</td>
                  </tr>
                  <tr>
                    <td>Environmental Sensors</td>
                    <td>IMU, Temperature, Humidity, Optical</td>
                  </tr>
                  <tr>
                    <td>Power Optimization</td>
                    <td>Pseudo-Sleep Mode (1 mA draw)</td>
                  </tr>
                  <tr>
                    <td>Interface connectors</td>
                    <td>SPI x1, I2C x1, UART x1</td>
                  </tr>
                  <tr>
                    <td>Storage expansion</td>
                    <td>SIM card slot and SD card slot</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      

      <footer className="home-footer">
        <p>© BeeSense Apiary Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
