import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Loader2, 
  Settings, 
  Database, 
  User, 
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Zap,
  Lock,
  LogIn,
  LogOut,
  XCircle,
  AlertCircle,
  Shield,
  Save,
  Cpu,
  Award,
  Landmark,
  FileUp,
  Power
} from 'lucide-react';

/**
 * EduFlow Dasis - Engine
 * Created by: INISIAL TH
 * Versi: 2025.1.0
 */

const App = () => {
  // --- KONFIGURASI DEFAULT ---
  const DEFAULT_MASTER_PASSWORD = 'admin123';

  // --- STATE MANAGEMENT ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [view, setView] = useState('student'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0); 
  const [notification, setNotification] = useState(null);
  
  // Memuat Konfigurasi dari LocalStorage agar permanen
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('eduflow_config_v2025');
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

  // --- HELPER FUNCTIONS ---
  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPasswordInput === config.masterPassword) {
      setIsAuthenticated(true);
      setView('admin');
      showNotify('success', 'Akses Admin Diterima.');
    } else {
      showNotify('error', 'Sandi Salah. Akses Ditolak.');
    }
  };

  const saveConfiguration = () => {
    localStorage.setItem('eduflow_config_v2025', JSON.stringify(config));
    showNotify('success', 'Konfigurasi Sistem Berhasil Disimpan Permanen.');
  };

  const runAutomation = async (e) => {
    e.preventDefault();
    if (!studentData.nama || !studentData.kk) {
      showNotify('error', 'Lengkapi Nama & Foto KK minimal.');
      return;
    }
    setIsProcessing(true);
    setStep(1); await new Promise(r => setTimeout(r, 1500)); // Simulasi Upload
    setStep(2); await new Promise(r => setTimeout(r, 2000)); // Simulasi OCR
    setStep(3); await new Promise(r => setTimeout(r, 1200)); // Simulasi Simpan
    setIsProcessing(false);
    setStep(0);
    
    const newLog = { 
      id: Date.now(), 
      nama: studentData.nama, 
      status: 'Selesai', 
      waktu: new Date().toLocaleString('id-ID'), 
      tipe: 'Set Lengkap' 
    };
    setLogs(prev => [newLog, ...prev]);
    showNotify('success', 'Berkas Berhasil Terkirim ke Cloud.');
    setStudentData({ nama: '', kk: null, akte: null, pip: null });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all duration-300 transform translate-y-0 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
           notification.type === 'error' ? <XCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-200">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-left leading-tight">
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">EduFlow Dasis</h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold italic mt-1">Siswa Portal</p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'admin' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Dashboard</button>
            <button onClick={() => setView('settings')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'settings' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Settings</button>
            <button onClick={() => {setIsAuthenticated(false); setView('student'); setAdminPasswordInput('');}} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <Power className="w-4 h-4" />
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10 flex-grow w-full">
        {/* LOGIN VIEW (Hidden Entry) */}
        {view === 'login' && !isAuthenticated && (
          <div className="max-w-sm mx-auto mt-20 bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl">
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-900">Otentikasi Staf</h2>
            <p className="text-slate-400 text-xs mb-8 font-semibold tracking-wide uppercase">Area Terbatas Admin</p>
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <input 
                type="password" 
                placeholder="Sandi Admin" 
                className="w-full px-6 py-5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-center font-bold text-lg" 
                value={adminPasswordInput} 
                onChange={(e) => setAdminPasswordInput(e.target.value)} 
                autoFocus
              />
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-black transition-all uppercase tracking-widest text-xs">MASUK SISTEM</button>
              <button type="button" onClick={() => setView('student')} className="w-full text-slate-400 text-[10px] font-bold uppercase py-2">Batal & Kembali</button>
            </form>
          </div>
        )}

        {/* STUDENT VIEW */}
        {view === 'student' && (
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 bg-white p-8 md:p-14 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
              <div className="flex items-center gap-5 mb-12 text-left border-b border-slate-50 pb-8">
                <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl">
                  <FileUp className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Pengumpulan Dokumen</h2>
                  <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest mt-2">Mesin Otomasi EduFlow Dasis</p>
                </div>
              </div>
              
              <form onSubmit={runAutomation} className="space-y-12 text-left">
                <div className="space-y-4 text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block leading-none">Identitas Lengkap Siswa</label>
                  <input 
                    type="text" 
                    className="w-full px-8 py-6 rounded-3xl border border-slate-100 outline-none text-2xl font-bold focus:ring-8 focus:ring-blue-50 transition-all bg-slate-50 shadow-inner" 
                    placeholder="Nama Sesuai Akte..." 
                    value={studentData.nama} 
                    onChange={(e) => setStudentData({...studentData, nama: e.target.value})} 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FileUploadCard label="Foto Kartu Keluarga" icon={<User className="text-blue-500 w-6 h-6" />} file={studentData.kk} onChange={(e) => setStudentData({...studentData, kk: e.target.files[0]})} />
                  <FileUploadCard label="Akte Kelahiran" icon={<Award className="text-emerald-500 w-6 h-6" />} file={studentData.akte} onChange={(e) => setStudentData({...studentData, akte: e.target.files[0]})} />
                  <FileUploadCard label="Buku Tabungan PIP" icon={<Landmark className="text-amber-500 w-6 h-6" />} file={studentData.pip} onChange={(e) => setStudentData({...studentData, pip: e.target.files[0]})} />
                </div>

                <div className="pt-6">
                  <button 
                    disabled={isProcessing} 
                    className={`w-full py-7 rounded-[2.5rem] font-black text-white shadow-2xl transition-all flex justify-center items-center gap-5 text-2xl tracking-tight ${isProcessing ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                  >
                    {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : <Zap className="w-8 h-8" />}
                    {isProcessing ? 'MEMINDAI DATA...' : 'KIRIM BERKAS SEKARANG'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden h-full">
              <h3 className="font-black text-xl mb-12 border-b border-white/10 pb-6 text-left tracking-tight flex items-center gap-3">
                <Cpu className="text-blue-400 w-6 h-6" /> Status Operasi
              </h3>
              <div className="space-y-10 relative z-10 text-left">
                <StatusStep active={step >= 1} current={step === 1} label="Cloud Upload" desc="Drive Storage" />
                <StatusStep active={step >= 2} current={step === 2} label="OCR Scanning" desc="Vision AI Processing" />
                <StatusStep active={step >= 3} current={step === 3} label="Database Sync" desc="Reporting result" />
              </div>
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {view === 'admin' && isAuthenticated && (
          <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl text-left">
            <div className="p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-left">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Rekapitulasi Mesin</h2>
                <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.2em] mt-3">Hasil Pemindaian Berkas Siswa</p>
              </div>
              <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-emerald-700 flex items-center gap-3 transition-all">
                <ExternalLink className="w-4 h-4" /> BUKA DATABASE UTAMA
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
                  <tr><th className="px-12 py-7">Siswa</th><th className="px-12 py-7">Status</th><th className="px-12 py-7">Waktu</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.length > 0 ? logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-12 py-7 font-extrabold text-slate-700 text-lg">{log.nama}</td>
                      <td className="px-12 py-7">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">
                          <CheckCircle className="w-3.5 h-3.5" /> Selesai
                        </div>
                      </td>
                      <td className="px-12 py-7 text-slate-400 font-bold text-xs">{log.waktu}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="px-12 py-20 text-center text-slate-300 font-bold italic">Belum ada data hari ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {view === 'settings' && isAuthenticated && (
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">
              <Settings className="w-8 h-8" /> Konfigurasi Inti
            </h2>
            <div className="space-y-8">
              <ConfigInput label="Google Cloud API Key" value={config.apiKey} onChange={(val) => setConfig({...config, apiKey: val})} />
              <ConfigInput label="Google Drive Folder ID" value={config.folderId} onChange={(val) => setConfig({...config, folderId: val})} />
              <ConfigInput label="Spreadsheet ID" value={config.spreadsheetId} onChange={(val) => setConfig({...config, spreadsheetId: val})} />
              
              <div className="pt-8 border-t border-slate-100 space-y-4">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest block">🔒 Password Admin Baru</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-5 rounded-2xl border border-blue-100 outline-none text-lg font-bold bg-blue-50 focus:ring-8 focus:ring-blue-100 transition-all" 
                  value={config.masterPassword} 
                  onChange={(e) => setConfig({...config, masterPassword: e.target.value})} 
                />
              </div>
              
              <button 
                onClick={saveConfiguration}
                className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3"
              >
                <Save className="w-5 h-5" /> Simpan Permanen ke Browser
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-100 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <p className="text-black text-[10px] font-black uppercase tracking-[0.4em]">
            &copy; 2025 EDUFLOW by INISIAL TH
          </p>
          
          <button 
            onClick={() => !isAuthenticated && setView('login')} 
            className="opacity-10 hover:opacity-100 transition-opacity text-black text-[10px] font-bold uppercase tracking-widest"
          >
            {isAuthenticated ? 'SISTEM AKTIF' : 'STAF SAJA'}
          </button>
        </div>
      </footer>
    </div>
  );
};

// Sub-komponen
const FileUploadCard = ({ label, icon, file, onChange }) => (
  <div className="relative group h-40">
    <div className={`p-4 rounded-3xl border-2 border-dashed transition-all h-full flex flex-col items-center justify-center text-center ${file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white group-hover:bg-blue-50/50'}`}>
      <div className="mb-3 p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
      <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter mb-1 leading-tight">{label}</p>
      <p className="text-[9px] text-slate-400 truncate w-full px-4 italic">{file ? file.name : 'Pilih Foto'}</p>
      <input type="file" accept="image/*" onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
    </div>
  </div>
);

const StatusStep = ({ active, current, label, desc }) => (
  <div className={`flex items-start gap-6 transition-all duration-700 ${active ? 'opacity-100' : 'opacity-20'}`}>
    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 transition-all ${current ? 'bg-yellow-400 animate-pulse ring-8 ring-yellow-400/20' : active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
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
    <input 
      type="text" 
      className="w-full px-6 py-5 rounded-2xl border border-slate-100 outline-none text-sm font-mono bg-white focus:ring-4 focus:ring-slate-50 transition-all shadow-sm" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default App;
