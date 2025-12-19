import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle, Loader2, Settings, Database, 
  User, Image as ImageIcon, ExternalLink, ShieldCheck, Zap, 
  Lock, LogIn, LogOut, XCircle, AlertCircle, Shield, Save, 
  Cpu, Award, Landmark, FileUp, Power, RefreshCw, Info, Copy
} from 'lucide-react';

/**
 * EduFlow Dasis - Real Engine (Updated for Redirect URI Fix)
 * Created by: INISIAL TH
 * Versi: 2025.2.1
 */

const App = () => {
  const DEFAULT_MASTER_PASSWORD = 'admin123';

  // --- STATE MANAGEMENT ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [view, setView] = useState('student'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0); 
  const [notification, setNotification] = useState(null);
  const [googleToken, setGoogleToken] = useState(null);
  
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('eduflow_config_v2025_final');
    return saved ? JSON.parse(saved) : {
      apiKey: '',
      clientId: '',
      folderId: '',
      spreadsheetId: '',
      masterPassword: DEFAULT_MASTER_PASSWORD
    };
  });

  const [studentData, setStudentData] = useState({ nama: '', kk: null, akte: null, pip: null });
  const [logs, setLogs] = useState([]);

  // --- NOTIFICATION HANDLER ---
  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // --- GOOGLE OAUTH LOGIC ---
  const handleGoogleAuth = () => {
    if (!config.clientId) {
      showNotify('error', 'Masukkan Client ID terlebih dahulu di pengaturan.');
      return;
    }
    
    // Penyesuaian Redirect URI agar tepat sasaran (Origin + Pathname)
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
                    `client_id=${config.clientId}&` +
                    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                    `response_type=token&` +
                    `scope=${encodeURIComponent(scope)}`;
    
    window.location.assign(authUrl);
  };

  // Capture Token from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.replace('#', '?')).get('access_token');
      if (token) {
        setGoogleToken(token);
        localStorage.setItem('g_access_token_2025', token);
        window.history.replaceState({}, document.title, window.location.pathname);
        showNotify('success', 'Akun Google berhasil terhubung!');
        setView('settings');
      }
    } else {
      const savedToken = localStorage.getItem('g_access_token_2025');
      if (savedToken) setGoogleToken(savedToken);
    }
  }, []);

  // --- API LOGIC ---
  const uploadToDrive = async (file, fileName) => {
    const metadata = { name: fileName, parents: [config.folderId] };
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${googleToken}` },
      body: formData
    });

    if (!response.ok) throw new Error('Gagal upload ke Drive. Periksa izin Folder ID.');
    return await response.json();
  };

  const scanWithVision = async (file) => {
    const reader = new FileReader();
    const base64Promise = new Promise((resolve) => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    const base64 = await base64Promise;

    const body = {
      requests: [{
        image: { content: base64 },
        features: [{ type: 'TEXT_DETECTION' }]
      }]
    };

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${config.apiKey}`, {
      method: 'POST',
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (data.error) throw new Error('Vision API Error: ' + data.error.message);
    return data.responses[0]?.fullTextAnnotation?.text || 'Teks tidak terdeteksi';
  };

  const saveToSheets = async (row) => {
    const body = { values: [row] };
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Sheet1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${googleToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error('Gagal simpan ke Sheets. Pastikan Spreadsheet ID benar.');
    return await response.json();
  };

  // --- AUTOMATION ENGINE ---
  const runAutomation = async (e) => {
    e.preventDefault();
    if (!googleToken) {
      showNotify('error', 'Admin belum menghubungkan akun Google.');
      return;
    }
    if (!studentData.nama || !studentData.kk) {
      showNotify('error', 'Nama & Foto KK wajib diisi.');
      return;
    }

    setIsProcessing(true);
    try {
      setStep(1); // Upload
      const driveRes = await uploadToDrive(studentData.kk, `KK_${studentData.nama}_${Date.now()}.jpg`);
      
      setStep(2); // OCR Scan
      const ocrResult = await scanWithVision(studentData.kk);
      
      setStep(3); // Save Data
      const timestamp = new Date().toLocaleString('id-ID');
      const row = [timestamp, studentData.nama, 'KK', ocrResult.substring(0, 1000), driveRes.webViewLink];
      await saveToSheets(row);

      setLogs(prev => [{ id: Date.now(), nama: studentData.nama, status: 'Berhasil', waktu: timestamp }, ...prev]);
      showNotify('success', 'Dokumen Berhasil Diproses & Dicatat!');
      setStudentData({ nama: '', kk: null, akte: null, pip: null });
    } catch (err) {
      showNotify('error', err.message);
    } finally {
      setIsProcessing(false);
      setStep(0);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPasswordInput === config.masterPassword) {
      setIsAuthenticated(true);
      setView('admin');
      showNotify('success', 'Akses Admin Diterima.');
    } else {
      showNotify('error', 'Sandi Salah.');
    }
  };

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showNotify('success', 'URL berhasil disalin!');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased text-left">
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-right-4 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm font-bold">{notification.message}</p>
        </div>
      )}

      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-2xl text-white shadow-xl shadow-blue-200"><Zap className="w-5 h-5" /></div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">EduFlow Dasis</h1>
            <p className="text-[9px] text-slate-400 uppercase font-bold italic mt-1 tracking-widest">Portal Siswa Digital</p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'admin' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Dashboard</button>
            <button onClick={() => setView('settings')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'settings' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Settings</button>
            <button onClick={() => {setIsAuthenticated(false); setView('student');}} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Power className="w-4 h-4" /></button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10 flex-grow w-full">
        {view === 'login' && !isAuthenticated && (
          <div className="max-w-sm mx-auto mt-20 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl"><Shield className="w-10 h-10 text-blue-400" /></div>
            <h2 className="text-2xl font-black mb-2 text-slate-900">Otentikasi Staf</h2>
            <p className="text-slate-400 text-xs mb-8 font-semibold uppercase tracking-wide">Area Terbatas Admin</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="password" placeholder="Sandi Admin" className="w-full px-6 py-5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-center font-bold text-lg" value={adminPasswordInput} onChange={(e) => setAdminPasswordInput(e.target.value)} autoFocus />
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-black transition-all">MASUK SISTEM</button>
              <button type="button" onClick={() => setView('student')} className="w-full text-slate-400 text-[10px] font-bold uppercase py-2">Kembali</button>
            </form>
          </div>
        )}

        {view === 'student' && (
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 bg-white p-8 md:p-14 rounded-[3rem] border border-slate-100 shadow-2xl">
              <div className="flex items-center gap-5 mb-12 text-left border-b border-slate-50 pb-8">
                <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl"><FileUp className="w-8 h-8" /></div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Pengumpulan Berkas</h2>
                  <p className="text-slate-400 font-bold uppercase text-[11px] mt-2 tracking-widest">Mesin Otomasi Digital v2025</p>
                </div>
              </div>
              
              <form onSubmit={runAutomation} className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Nama Lengkap Siswa</label>
                  <input type="text" className="w-full px-8 py-6 rounded-3xl border border-slate-100 outline-none text-2xl font-bold focus:ring-8 focus:ring-blue-50 transition-all bg-slate-50" placeholder="Sesuai Ijazah..." value={studentData.nama} onChange={(e) => setStudentData({...studentData, nama: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FileUploadCard label="Foto KK" icon={<User className="text-blue-500 w-6 h-6" />} file={studentData.kk} onChange={(e) => setStudentData({...studentData, kk: e.target.files[0]})} />
                  <FileUploadCard label="Akte Lahir" icon={<Award className="text-emerald-500 w-6 h-6" />} file={studentData.akte} onChange={(e) => setStudentData({...studentData, akte: e.target.files[0]})} />
                  <FileUploadCard label="Buku PIP" icon={<Landmark className="text-amber-500 w-6 h-6" />} file={studentData.pip} onChange={(e) => setStudentData({...studentData, pip: e.target.files[0]})} />
                </div>

                <button disabled={isProcessing} className={`w-full py-7 rounded-[2.5rem] font-black text-white shadow-2xl transition-all flex justify-center items-center gap-5 text-2xl ${isProcessing ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
                  {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : <Zap className="w-8 h-8" />}
                  {isProcessing ? 'SEDANG MEMPROSES...' : 'KIRIM DATA SEKARANG'}
                </button>
              </form>
            </div>
            
            <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden h-full">
              <h3 className="font-black text-xl mb-12 border-b border-white/10 pb-6 text-left tracking-tight flex items-center gap-3"><Cpu className="text-blue-400 w-6 h-6" /> Status Mesin</h3>
              <div className="space-y-10 relative z-10 text-left">
                <StatusStep active={step >= 1} current={step === 1} label="Cloud Upload" desc="Drive Storage" />
                <StatusStep active={step >= 2} current={step === 2} label="OCR Scanning" desc="Vision AI Scanning" />
                <StatusStep active={step >= 3} current={step === 3} label="Database Sync" desc="Result Reporting" />
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && isAuthenticated && (
          <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl">
            <div className="p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-left">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">Rekapitulasi Mesin</h2>
                <p className="text-slate-400 font-bold uppercase text-[11px] mt-3 tracking-widest italic">Data Aktif di Google Sheets</p>
              </div>
              <a href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}`} target="_blank" rel="noreferrer" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-emerald-700 flex items-center gap-3 transition-all">
                <ExternalLink className="w-4 h-4" /> BUKA DATABASE
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  <tr><th className="px-12 py-7">Siswa</th><th className="px-12 py-7">Status</th><th className="px-12 py-7">Waktu</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.length > 0 ? logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-12 py-7 font-extrabold text-slate-700 text-lg">{log.nama}</td>
                      <td className="px-12 py-7"><div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase"><CheckCircle className="w-3.5 h-3.5" /> Selesai</div></td>
                      <td className="px-12 py-7 text-slate-400 font-bold text-xs">{log.waktu}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="px-12 py-20 text-center text-slate-300 font-bold italic">Belum ada data masuk sesi ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'settings' && isAuthenticated && (
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-left animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4"><Settings className="w-8 h-8" /> Konfigurasi Cloud</h2>
            
            <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-left">
                  <p className="font-bold text-blue-900 uppercase text-xs tracking-widest">Akses Google Cloud</p>
                  <p className="text-[10px] text-blue-700 font-medium italic">Wajib terhubung agar fitur unggah berkas aktif.</p>
                </div>
                <button onClick={handleGoogleAuth} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all">
                  <RefreshCw className={`w-4 h-4 ${googleToken ? '' : 'animate-spin'}`} />
                  {googleToken ? 'Akun Terhubung' : 'Hubungkan Akun'}
                </button>
              </div>
              
              {/* SOLUSI AKSES DIBLOKIR INFO */}
              <div className="p-4 bg-white/60 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-3 h-3 text-blue-800" />
                  <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest leading-none">Whitelist Redirect URI</p>
                </div>
                <p className="text-[10px] text-slate-600 mb-3 leading-relaxed">Daftarkan URL di bawah ini pada Google Cloud Console Anda di bagian <b>"Authorized redirect URIs"</b> untuk mencegah eror "Akses Diblokir":</p>
                <div className="flex gap-2">
                  <code className="flex-grow p-2 bg-slate-100 rounded-xl text-[10px] break-all font-mono text-blue-700 border border-slate-200">{window.location.origin + window.location.pathname}</code>
                  <button onClick={() => copyToClipboard(window.location.origin + window.location.pathname)} className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"><Copy className="w-3 h-3 text-slate-400" /></button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <ConfigInput label="Google Vision API Key" value={config.apiKey} onChange={(val) => setConfig({...config, apiKey: val})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConfigInput label="Folder ID Google Drive" value={config.folderId} onChange={(val) => setConfig({...config, folderId: val})} />
                <ConfigInput label="Spreadsheet ID Google Sheets" value={config.spreadsheetId} onChange={(val) => setConfig({...config, spreadsheetId: val})} />
              </div>
              <ConfigInput label="OAuth Client ID" value={config.clientId} onChange={(val) => setConfig({...config, clientId: val})} />
              
              <div className="pt-8 border-t border-slate-100 space-y-4">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest block leading-none ml-1">🔒 Ganti Password Admin</label>
                <input type="text" className="w-full px-6 py-5 rounded-2xl border border-blue-100 outline-none text-lg font-bold bg-blue-50 focus:ring-8 focus:ring-blue-100 transition-all text-blue-800" value={config.masterPassword} onChange={(e) => setConfig({...config, masterPassword: e.target.value})} />
              </div>
              
              <button onClick={() => {localStorage.setItem('eduflow_config_v2025_final', JSON.stringify(config)); showNotify('success', 'Konfigurasi Disimpan!');}} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"><Save className="w-5 h-5" /> SIMPAN PERMANEN</button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-slate-100 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <p className="text-black text-[11px] font-black uppercase tracking-[0.4em]">&copy; 2025 EDUFLOW by INISIAL TH</p>
          <button onClick={() => !isAuthenticated && setView('login')} className="opacity-10 hover:opacity-100 transition-opacity text-black text-[10px] font-bold uppercase tracking-widest hover:text-blue-600">{isAuthenticated ? 'SISTEM AKTIF' : 'STAF SAJA'}</button>
        </div>
      </footer>
    </div>
  );
};

// Sub-komponen
const FileUploadCard = ({ label, icon, file, onChange }) => (
  <div className="relative group h-40">
    <div className={`p-4 rounded-3xl border-2 border-dashed transition-all h-full flex flex-col items-center justify-center text-center ${file ? 'border-emerald-200 bg-emerald-50 shadow-inner' : 'border-slate-200 bg-white group-hover:bg-blue-50/50'}`}>
      <div className="mb-3 p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
      <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter mb-1 leading-tight">{label}</p>
      <p className="text-[9px] text-slate-400 truncate w-full px-4 italic leading-none">{file ? file.name : 'Pilih Foto'}</p>
      <input type="file" accept="image/*" onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
    </div>
  </div>
);

const StatusStep = ({ active, current, label, desc }) => (
  <div className={`flex items-start gap-6 transition-all duration-700 ${active ? 'opacity-100 translate-x-0' : 'opacity-20 -translate-x-4'}`}>
    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 transition-all shadow-lg ${current ? 'bg-yellow-400 animate-pulse ring-8 ring-yellow-400/20' : active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
      {active && !current ? <CheckCircle className="w-6 h-6 text-white" /> : <div className="w-2.5 h-2.5 bg-white/30 rounded-full"></div>}
    </div>
    <div className="flex flex-col text-left justify-center h-12">
      <span className={`text-lg font-extrabold tracking-tight leading-none ${current ? 'text-yellow-400' : 'text-white'}`}>{label}</span>
      <span className="text-[11px] text-white/30 font-black uppercase tracking-widest mt-2 leading-none">{desc}</span>
    </div>
  </div>
);

const ConfigInput = ({ label, value, onChange }) => (
  <div className="text-left">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">{label}</label>
    <input type="text" className="w-full px-6 py-5 rounded-2xl border border-slate-100 outline-none text-sm font-mono bg-white focus:ring-4 focus:ring-slate-50 transition-all shadow-sm" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default App;
