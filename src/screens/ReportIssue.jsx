import { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/dummyIssues';
import { useLanguage } from '../context/LanguageContext';

function useSpeechInput(onResult) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [micError, setMicError] = useState('');
  const activeRef   = useRef(false);
  const recogRef    = useRef(null);
  const onResultRef = useRef(onResult);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  const supported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const spawnRecog = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SR();
    recog.lang = 'en-IN';
    recog.continuous = true;
    recog.interimResults = true;
    recog.maxAlternatives = 1;

    recog.onresult = (e) => {
      let final = '', interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) { onResultRef.current(final.trim()); setInterim(''); }
      else setInterim(interim);
    };

    recog.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return;
      activeRef.current = false;
      setListening(false);
      setInterim('');
      if (e.error === 'not-allowed') {
        setMicError('Microphone access was denied. Please allow mic permission and try again.');
      } else if (e.error === 'network') {
        setMicError('Network error — please check your connection and try again.');
      } else {
        setMicError(`Mic error: ${e.error}`);
      }
    };

    recog.onend = () => {
      if (activeRef.current) {
        recogRef.current = spawnRecog();
      } else {
        setListening(false);
        setInterim('');
      }
    };

    try { recog.start(); } catch { /* ignore double-start */ }
    return recog;
  }, []);

  const start = useCallback(() => {
    if (!supported || activeRef.current) return;
    setMicError('');
    activeRef.current = true;
    setListening(true);
    setInterim('');
    recogRef.current = spawnRecog();
  }, [supported, spawnRecog]);

  const stop = useCallback(() => {
    activeRef.current = false;
    setListening(false);
    setInterim('');
    try { recogRef.current?.stop(); } catch { /* ignore */ }
    recogRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (activeRef.current) stop(); else start();
  }, [start, stop]);

  useEffect(() => () => {
    activeRef.current = false;
    try { recogRef.current?.abort(); } catch { /* ignore */ }
  }, []);

  return { listening, interim, toggle, supported, micError };
}

function MicButton({ listening, onClick, supported, small = false }) {
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      title={listening ? 'Stop recording' : 'Speak to fill this field'}
      className={`flex-shrink-0 flex items-center justify-center rounded-xl border transition-all ${
        small ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
      } ${
        listening
          ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-200'
          : 'bg-secondary border-border text-muted-foreground hover:text-primary hover:border-primary/40'
      }`}
    >
      {listening
        ? <span className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-60" />
            <i className="fas fa-stop relative text-white" style={{ fontSize: '0.6rem' }} />
          </span>
        : <i className="fas fa-microphone" />
      }
    </button>
  );
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RED_ICON = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:36px;height:48px;">
    <div style="position:absolute;left:50%;top:2px;width:30px;height:30px;transform:translateX(-50%) rotate(-45deg);transform-origin:center;background:linear-gradient(145deg,#fb7185,#dc2626);border:3px solid white;border-radius:50% 50% 50% 0;box-shadow:0 10px 26px rgba(220,38,38,0.45),0 0 0 8px rgba(220,38,38,0.12);"></div>
    <div style="position:absolute;left:50%;top:12px;width:9px;height:9px;transform:translateX(-50%);border-radius:999px;background:white;box-shadow:0 1px 4px rgba(0,0,0,0.22);"></div>
  </div>`,
  iconSize: [36, 48],
  iconAnchor: [18, 38],
});

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'CivicAssist/1.0' } }
    );
    const data = await res.json();
    const a = data.address || {};
    const parts = [
      a.suburb || a.neighbourhood || a.village || a.town || a.city_district,
      a.city || a.town || a.county,
      a.state,
    ].filter(Boolean);
    return parts.slice(0, 2).join(', ') || data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function searchAddress(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'CivicAssist/1.0' } }
    );
    return await res.json();
  } catch {
    return [];
  }
}

function parseCoordinateInput(value) {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const first = Number(match[1]);
  const second = Number(match[2]);
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
  if (Math.abs(first) <= 90 && Math.abs(second) <= 180) return { lat: first, lng: second };
  if (Math.abs(first) <= 180 && Math.abs(second) <= 90) return { lat: second, lng: first };
  return null;
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom, { animate: true }); }, [center, zoom]);
  return null;
}

function ClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function ReportIssue() {
  const { submitIssue, navigateTo } = useApp();
  const { t, categoryLabel } = useLanguage();
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', imageFile: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const titleVoice = useSpeechInput(useCallback((text) => {
    setForm(prev => ({ ...prev, title: (prev.title ? prev.title + ' ' : '') + text.trim() }));
    setErrors(prev => ({ ...prev, title: '' }));
  }, []));

  const descVoice = useSpeechInput(useCallback((text) => {
    setForm(prev => ({ ...prev, description: (prev.description ? prev.description + ' ' : '') + text.trim() }));
    setErrors(prev => ({ ...prev, description: '' }));
  }, []));

  const [locationMode, setLocationMode] = useState('type');
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [mapCoords, setMapCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchTimeout = useRef(null);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    update('imageFile', file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const applyCoords = async (lat, lng) => {
    setMapCoords([lat, lng]);
    setMapCenter([lat, lng]);
    setMapZoom(17);
    setGeocoding(true);
    const addr = await reverseGeocode(lat, lng);
    update('location', addr);
    setGeocoding(false);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    setLocationMode('map');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => { await applyCoords(coords.latitude, coords.longitude); setGpsLoading(false); },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleMapClick = async (lat, lng) => applyCoords(lat, lng);

  const handleSearchInput = (val) => {
    update('location', val);
    setSearchResults([]);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    const exactCoords = parseCoordinateInput(val);
    if (exactCoords) { setLocationMode('map'); applyCoords(exactCoords.lat, exactCoords.lng); return; }
    if (val.length < 3) return;
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      const results = await searchAddress(val);
      setSearchResults(results);
      setSearchLoading(false);
    }, 450);
  };

  const pickSearchResult = (r) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    const a = r.address || {};
    const parts = [
      a.suburb || a.neighbourhood || a.village || a.town || a.city_district,
      a.city || a.town || a.county,
      a.state,
    ].filter(Boolean);
    const addr = parts.slice(0, 2).join(', ') || r.display_name;
    setMapCoords([lat, lng]);
    setMapCenter([lat, lng]);
    setMapZoom(16);
    update('location', addr);
    setSearchResults([]);
    setLocationMode('map');
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = t('report.errors.titleRequired');
    if (!form.description.trim()) errs.description = t('report.errors.descriptionRequired');
    if (!form.category)           errs.category    = t('report.errors.categoryRequired');
    if (!form.location.trim())    errs.location    = t('report.errors.locationRequired');
    if (!form.imageFile)          errs.image       = t('report.errors.photoRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await submitIssue({
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        imageFile: form.imageFile,
        coordinates: mapCoords ? { lat: mapCoords[0], lng: mapCoords[1] } : null,
      });
      navigateTo('feed');
    } catch (err) {
      setErrors({ submit: err.message || t('report.errors.submitFailed') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigateTo('feed')} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <i className="fas fa-arrow-left text-sm" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('report.title')}</h1>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            {t('report.category')} <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => update('category', cat.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  form.category === cat.id ? 'border-transparent text-primary-foreground shadow-md' : 'bg-secondary border-border text-muted-foreground hover:border-primary/30'
                }`}
                style={form.category === cat.id ? { background: 'var(--gradient-primary)' } : {}}>
                <i className={`fas ${cat.icon}`} />
                {categoryLabel(cat.id)}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            {t('report.issueTitle')} <span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input type="text" value={titleVoice.listening && titleVoice.interim ? form.title + (form.title ? ' ' : '') + titleVoice.interim : form.title}
              onChange={e => update('title', e.target.value)}
              placeholder={titleVoice.listening ? '🎙️ Listening…' : t('report.issueTitlePlaceholder')}
              className={`flex-1 px-4 py-3 rounded-xl bg-secondary border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                titleVoice.listening ? 'border-red-400 ring-2 ring-red-200' : 'border-border'
              }`}
            />
            <MicButton
              listening={titleVoice.listening}
              supported={titleVoice.supported}
              onClick={() => { if (descVoice.listening) descVoice.toggle(); titleVoice.toggle(); }}
            />
          </div>
          {titleVoice.listening && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              Recording… speak your issue title, tap stop when done
            </p>
          )}
          {titleVoice.micError && (
            <p className="text-xs text-orange-500 mt-1 flex items-center gap-1.5">
              <i className="fas fa-triangle-exclamation" />
              {titleVoice.micError}
            </p>
          )}
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            {t('report.description')} <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <textarea
              value={descVoice.listening && descVoice.interim ? form.description + (form.description ? ' ' : '') + descVoice.interim : form.description}
              onChange={e => update('description', e.target.value)}
              placeholder={descVoice.listening ? '🎙️ Listening… describe the issue in detail' : t('report.descriptionPlaceholder')}
              rows={4}
              className={`w-full px-4 py-3 pb-12 rounded-xl bg-secondary border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none ${
                descVoice.listening ? 'border-red-400 ring-2 ring-red-200' : 'border-border'
              }`}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {descVoice.listening && (
                <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  Recording
                </span>
              )}
              <MicButton
                listening={descVoice.listening}
                supported={descVoice.supported}
                onClick={() => { if (titleVoice.listening) titleVoice.toggle(); descVoice.toggle(); }}
                small
              />
            </div>
          </div>
          {descVoice.micError && (
            <p className="text-xs text-orange-500 mt-1 flex items-center gap-1.5">
              <i className="fas fa-triangle-exclamation" />
              {descVoice.micError}
            </p>
          )}
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">{t('report.location')} <span className="text-destructive">*</span></label>
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={handleGPS} disabled={gpsLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-60"
              style={locationMode === 'map' && mapCoords ? { background: 'var(--gradient-primary)', color: '#fff', borderColor: 'transparent' } : {}}>
              {gpsLoading ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <i className="fas fa-location-crosshairs" />}
              {t('report.useMyLocation')}
            </button>
            <button type="button" onClick={() => setLocationMode(m => m === 'map' ? 'type' : 'map')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
              style={locationMode === 'map' ? { background: 'var(--gradient-primary)', color: '#fff', borderColor: 'transparent' } : {}}>
              <i className="fas fa-map-location-dot" />
              {locationMode === 'map' ? t('report.hideMap') : t('report.pickOnMap')}
            </button>
          </div>

          <div className="relative">
            <i className={`fas fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-sm z-10 ${errors.location ? 'text-destructive' : 'text-muted-foreground'}`} />
            <input type="text" value={geocoding ? '' : form.location} onChange={e => handleSearchInput(e.target.value)}
              placeholder={geocoding ? t('report.detectingAddress') : t('report.searchAddress')} readOnly={geocoding}
              className={`w-full pl-10 pr-10 py-3 rounded-xl bg-secondary border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.location ? 'border-destructive' : 'border-border'}`}
            />
            {(searchLoading || geocoding) && <span className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-[9999] rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
                {searchResults.map((r, i) => (
                  <button key={i} type="button" onClick={() => pickSearchResult(r)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors border-b border-border/50 last:border-0">
                    <i className="fas fa-location-dot text-primary mt-0.5 flex-shrink-0 text-sm" />
                    <span className="text-xs text-foreground leading-relaxed line-clamp-2">{r.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}

          {locationMode === 'map' && (
            <div className="mt-3 relative rounded-2xl overflow-hidden border border-border/60" style={{ height: 320, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
              <div className="absolute top-3 left-3 z-[1000] rounded-2xl px-4 py-3 pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', border: '1px solid rgba(0,0,0,0.06)', minWidth: 160, maxWidth: 240 }}>
                <p className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 mb-0.5">{t('report.preciseLocation')}</p>
                <p className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2">
                  {geocoding ? <span className="text-slate-400 font-normal text-xs animate-pulse">{t('report.detecting')}</span> : form.location || <span className="text-slate-400 font-normal text-xs">{t('report.tapMapToPin')}</span>}
                </p>
                {mapCoords && !geocoding && <p className="text-[9px] font-mono text-slate-400 mt-1">{mapCoords[0].toFixed(5)}, {mapCoords[1].toFixed(5)}</p>}
              </div>
              {!mapCoords && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] rounded-xl px-4 py-2 pointer-events-none" style={{ background: 'rgba(15,23,42,0.80)', backdropFilter: 'blur(8px)' }}>
                  <p className="text-[11px] font-semibold text-white/90 tracking-wide whitespace-nowrap flex items-center gap-2">
                    <i className="fas fa-hand-pointer text-blue-300" />{t('report.clickMapHelp')}
                  </p>
                </div>
              )}
              <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: '100%', height: '100%' }} zoomControl scrollWheelZoom>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' maxZoom={19} />
                <MapController center={mapCenter} zoom={mapZoom} />
                <ClickHandler onMapClick={handleMapClick} />
                {mapCoords && <Marker position={mapCoords} icon={RED_ICON} />}
              </MapContainer>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            {t('report.photo')} <span className="text-destructive">*</span>
            <span className="ml-2 text-xs font-normal text-muted-foreground">{t('report.required')}</span>
          </label>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button onClick={() => { setPreview(null); update('imageFile', null); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80 transition-colors">
                <i className="fas fa-xmark" />
              </button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all ${errors.image ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary/40 bg-secondary/50'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg mb-2 ${errors.image ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                <i className="fas fa-camera" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('report.clickUpload')}</span>
              <span className="text-xs text-muted-foreground/60 mt-1">{t('report.photoHelp')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          )}
          {errors.image && <p className="text-xs text-destructive mt-1">{errors.image}</p>}
        </div>

        {errors.submit && (
          <div className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl">
            <i className="fas fa-circle-exclamation text-red-500 text-sm" />
            <span className="text-red-600 text-sm">{errors.submit}</span>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary mt-2">
          {loading
            ? <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('report.submitting')}</>
            : <><i className="fas fa-paper-plane" /> {t('report.submit')}</>}
        </button>
      </div>
    </div>
  );
}
