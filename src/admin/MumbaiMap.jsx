import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';

const HOTSPOTS = [
  { name: 'Andheri',  lat: 19.1364, lng: 72.8296, issues: 22, top: 'Streetlight', resolved: 15 },
  { name: 'Bandra',   lat: 19.0607, lng: 72.8362, issues: 18, top: 'Garbage',     resolved: 11 },
  { name: 'Dadar',    lat: 19.0270, lng: 72.8381, issues: 14, top: 'Road',        resolved: 9  },
  { name: 'Goregaon', lat: 19.1666, lng: 72.8506, issues: 16, top: 'Road',        resolved: 10 },
  { name: 'Powai',    lat: 19.1187, lng: 72.9053, issues: 12, top: 'Electricity', resolved: 7  },
  { name: 'Chembur',  lat: 19.0600, lng: 72.8970, issues: 15, top: 'Sewage',      resolved: 8  },
  { name: 'Juhu',     lat: 19.1075, lng: 72.8263, issues: 10, top: 'Noise',       resolved: 6  },
  { name: 'Kurla',    lat: 19.0726, lng: 72.8845, issues: 13, top: 'Water',       resolved: 7  },
  { name: 'Borivali', lat: 19.2290, lng: 72.8560, issues: 9,  top: 'Garbage',     resolved: 5  },
  { name: 'Vashi',    lat: 19.0696, lng: 72.9987, issues: 8,  top: 'Water',       resolved: 4  },
];

function getColor(issues) {
  if (issues >= 35) return '#ef4444';
  if (issues >= 25) return '#f97316';
  if (issues >= 15) return '#f59e0b';
  return '#22c55e';
}

function getLabel(issues) {
  if (issues >= 35) return 'Critical';
  if (issues >= 25) return 'High';
  if (issues >= 15) return 'Moderate';
  return 'Low';
}

export default function MumbaiMap({ hotspots = HOTSPOTS }) {
  return (
    <div style={{ height: '380px', width: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={[19.0760, 72.8777]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {hotspots.map((spot) => {
          const color = getColor(spot.issues);
          return (
            <Circle
              key={spot.name}
              center={[spot.lat, spot.lng]}
              radius={1400 + Math.max(spot.issues, 0) * 420}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.38, weight: 2.5 }}
            >
              <Tooltip permanent={spot.issues >= 35} direction="top" offset={[0, -8]}>
                <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.5 }}>
                  <div style={{ color }}>{spot.name}</div>
                  <div style={{ color: '#64748b', fontWeight: 600 }}>{spot.issues} issues · {getLabel(spot.issues)}</div>
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>Top: {spot.top}</div>
                </div>
              </Tooltip>
            </Circle>
          );
        })}
      </MapContainer>

      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 999,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
        borderRadius: 12, padding: '8px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {[
          { label: 'Critical  (35+)', color: '#ef4444' },
          { label: 'High  (25–34)', color: '#f97316' },
          { label: 'Moderate  (15–24)', color: '#f59e0b' },
          { label: 'Low  (<15)', color: '#22c55e' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#334155' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export { HOTSPOTS, getColor, getLabel };

