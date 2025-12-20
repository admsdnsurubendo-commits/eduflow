import React, { useState, useEffect } from 'react';
import { 
  Zap, FileUp, Users, FileBadge, Landmark, Send, Loader2, 
  Lock, Settings, Power, CheckCircle, XCircle, ChevronDown,
  CloudUpload, ScanEye, Database, Check, Activity, LogOut,
  AlertCircle
} from 'lucide-react';

/**
 * EduFlow Dasis - Smart Engine (Professional Modular Edition)
 * Versi: 2025.5.1 (Arial UI & Specific Icons)
 * Dibuat oleh: INISIAL TH
 */

const App = () => {
  const [view, setView] = useState('student');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0); 
  const [notification, setNotification] = useState(null);
  const [adminPass, setAdminPass] = useState('');
  
  const [studentData, setStudentData] = useState({ 
    nama: '', 
    kelas: '',
    kk: null, 
    akte: null, 
    pip: null 
  });
  
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('eduflow_gas_config');
    return saved ? JSON.parse(saved) : { gasUrl: '', masterPassword: 'admin123' };
  });

  const showNotify = (type, message) => {
    setNotification({ type, message: String(message) });
    setTimeout(() => setNotification(null), 6000);
  };

  const convertToBase64 = (file) => {
    if (!file) return Promise.resolve(null);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
    });
  };

  const runAutomation = async (e) => {
    e.preventDefault();
    if (!config.gasUrl) return showNotify('error', 'Konfigurasi backend belum diatur.');
    if (!studentData.nama.trim() || !studentData.kelas) return showNotify('error', 'Nama dan Kelas wajib diisi.');
    if (!studentData.kk || !studentData.akte || !studentData.pip) {
      return showNotify('error', 'Mohon lengkapi ketiga foto dokumen asli.');
    }

    setIsProcessing(true);
    setStep(1); 
    
    try {
      const b64KK = await convertToBase64(studentData.kk);
      const b64Akte = await convertToBase64(studentData.akte);
      const b64PIP = await convertToBase64(studentData.pip);

      setStep(2); 
      const payload = {
        nama_siswa: studentData.nama,
        kelas: studentData.kelas,
        foto_kk: b64KK,
        foto_akte: b64Akte,
        foto_pip: b64PIP
      };

      const response = await fetch(config.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Gagal terhubung ke server.");

      setStep(3); 
      
      setTimeout(() => {
        setStep(4);
        showNotify('success', `Data ${studentData.nama} berhasil diarsipkan.`);
        setStudentData({ nama: '', kelas: '', kk: null, akte: null, pip: null });
        setTimeout(() => { setStep(0); setIsProcessing(false); }, 5000);
      }, 1000);
      
    } catch (err) {
      showNotify('error', 'Sistem Error: ' + err.message);
      setStep(0);
      setIsProcessing(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPass === config.masterPassword) {
      setView('admin');
      setAdminPass('');
    } else {
      showNotify('error', 'Kata sandi tidak valid.');
    }
  };

  // Gaya Dasar Arial
  const arialStyle = { fontFamily: 'Arial, Helvetica, sans-serif' };

  return (
    <div style={arialStyle} className="min-h-screen bg-[#f8fafc] text-[#334155] flex flex-col antialiased text-left selection:bg-indigo-100">
      
      {/* Notifikasi */}
      {notification && (
        <div className={`fixed top-8 right-8 z-[100] p-4 rounded-lg shadow-2xl flex items-center gap-3 border backdrop-blur-md animate-bounce-short ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold tracking-tight">{notification.message}</p>
        </div>
      )}

      {/* Navigasi Profesional */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg">
            <Zap size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-none">EDUFLOW DASIS</h1>
            <p className="text-[10px] font-normal text-indigo-600 mt-1 tracking-[0.2em] leading-none uppercase">Smart Engine v2.5</p>
          </div>
        </div>
        {view === 'admin' && (
          <button onClick={() => setView('student')} className="text-slate-400 hover:text-red-600 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors">
            <LogOut size={16} /> Keluar
          </button>
        )}
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12 flex-grow w-full">
        {view === 'student' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Kartu Input Dokumen */}
            <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700">
                  <FileUp size={24} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-none">Portal Dokumen</h2>
                  <p className="text-sm text-slate-400 mt-1.5 font-normal italic">Unggah foto dokumen asli yang terbaca jelas</p>
                </div>
              </div>

              <form onSubmit={runAutomation} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nama Lengkap Siswa</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none text-base font-normal transition-all" 
                      value={studentData.nama} 
                      onChange={(e) => setStudentData({...studentData, nama: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kelas</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none cursor-pointer text-base font-normal"
                        value={studentData.kelas}
                        onChange={(e) => setStudentData({...studentData, kelas: e.target.value})}
                      >
                        <option value="" disabled>-</option>
                        {[1, 2, 3, 4, 5, 6].map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                {/* Grid Menu Ikon Baru */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <UploadCard 
                    label="Foto KK" 
                    theme="blue" 
                    icon={<Users size={24} />} 
                    file={studentData.kk} 
                    onChange={(e) => setStudentData({...studentData, kk: e.target.files[0]})} 
                  />
                  <UploadCard 
                    label="Foto Akte" 
                    theme="emerald" 
                    icon={<FileBadge size={24} />} 
                    file={studentData.akte} 
                    onChange={(e) => setStudentData({...studentData, akte: e.target.files[0]})} 
                  />
                  <UploadCard 
                    label="Rekening PIP" 
                    theme="amber" 
                    icon={<Landmark size={24} />} 
                    file={studentData.pip} 
                    onChange={(e) => setStudentData({...studentData, pip: e.target.files[0]})} 
                  />
                </div>

                <button 
                  disabled={isProcessing} 
                  className={`w-full py-4 rounded-lg font-bold text-white shadow-xl transition-all flex justify-center items-center gap-3 text-lg ${isProcessing ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'}`}
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  {isProcessing ? 'MEMPROSES TRANSMISI...' : 'KIRIM BERKAS SEKARANG'}
                </button>
              </form>
            </div>
            
            {/* Monitor Transmisi - Teks Putih Solid */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl p-8 md:p-10 text-white shadow-xl">
              <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-5">
                <div className="p-2.5 bg-white/10 rounded-lg text-indigo-400">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none uppercase tracking-tight">Status Transmisi</h3>
                  <p className="text-[10px] uppercase font-normal text-white/50 mt-1.5 tracking-widest">Real-time Monitor</p>
                </div>
              </div>
              
              <div className="space-y-10 relative">
                <StatusStep 
                  label="Cloud Upload" 
                  desc="Menyimpan Foto ke Drive" 
                  icon={<CloudUpload size={24} />} 
                  stepNum={1} currentStep={step} completed={step > 1} 
                />
                <StatusStep 
                  label="AI Vision" 
                  desc="Ekstraksi Teks Vision AI" 
                  icon={<ScanEye size={24} />} 
                  stepNum={2} currentStep={step} completed={step > 2} 
                />
                <StatusStep 
                  label="G-Sync" 
                  desc="Pencatatan Google Sheets" 
                  icon={<Database size={24} />} 
                  stepNum={3} currentStep={step} completed={step >= 4} 
                />
              </div>
            </div>

          </div>
        )}

        {/* Login Admin */}
        {view === 'login' && (
          <div className="max-w-md mx-auto bg-white p-10 rounded-xl shadow-lg border border-slate-200 text-center mt-10">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold mb-1 text-slate-900">Akses Admin</h2>
            <p className="text-sm text-slate-400 font-normal mb-8">Otentikasi khusus pengelola mesin</p>
            <form onSubmit={handleLogin} className="space-y-6">
              <input 
                type="password" 
                placeholder="Kata Sandi" 
                className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-center font-bold text-xl outline-none focus:border-indigo-600 transition-all shadow-inner" 
                value={adminPass} 
                onChange={(e) => setAdminPass(e.target.value)} 
                autoFocus 
              />
              <button className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold uppercase text-[11px] tracking-widest hover:bg-black transition-all">Verifikasi</button>
            </form>
          </div>
        )}

        {/* Settings Admin */}
        {view === 'admin' && (
          <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-lg border border-slate-200 text-left">
            <div className="flex items-center gap-5 mb-8 pb-5 border-b border-slate-100">
              <Settings size={32} className="text-slate-900" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Konfigurasi Sistem</h2>
                <p className="text-xs font-normal text-slate-400 uppercase tracking-widest mt-1">Backend Connection</p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">GAS Web App URL (Exec)</label>
                <input 
                  type="text" 
                  className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm font-normal text-indigo-600 outline-none focus:border-indigo-600 transition-all shadow-inner" 
                  value={config.gasUrl} 
                  onChange={(e) => setConfig({...config, gasUrl: e.target.value})} 
                  placeholder="https://script.google.com/macros/s/.../exec" 
                />
              </div>
              <button onClick={() => { localStorage.setItem('eduflow_gas_config', JSON.stringify(config)); showNotify('success', 'Konfigurasi disimpan.'); setView('student'); }} className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold uppercase text-[11px] tracking-widest hover:bg-black transition-all">Simpan Perubahan</button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 px-12 border-t border-slate-200 bg-white flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
        <p className="text-slate-400 text-[10px] uppercase tracking-[0.5em] leading-none font-normal">
          EDUFLOW by INISIAL TH
        </p>
        <button 
          onClick={() => setView(view === 'student' ? 'login' : 'student')} 
          className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] shadow-md hover:bg-red-700 transition-all active:scale-95 leading-none"
        >
          ADMIN
        </button>
      </footer>
    </div>
  );
};

// Sub-Komponen Card Unggah
const UploadCard = ({ label, theme, icon, file, onChange }) => {
  const themes = {
    blue: file ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300',
    emerald: file ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:border-emerald-300',
    amber: file ? 'border-amber-600 bg-amber-50/50' : 'border-slate-200 bg-slate-50 hover:border-amber-300'
  };
  const iconColors = { blue: 'text-indigo-600', emerald: 'text-emerald-600', amber: 'text-amber-600', default: 'text-slate-400' };

  return (
    <div className="relative group h-40 transition-all duration-300">
      <div className={`p-4 rounded-lg border-2 transition-all h-full flex flex-col items-center justify-center text-center ${themes[theme]}`}>
        <div className={`p-2.5 rounded-full mb-3 transition-all ${file ? 'bg-white shadow-sm scale-110' : 'bg-slate-100'}`}>
          <div className={file ? iconColors[theme] : iconColors.default}>{icon}</div>
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 leading-none ${file ? 'text-slate-900' : 'text-slate-500'}`}>{label}</p>
        <p className="text-[10px] text-slate-400 truncate w-full px-2 italic font-normal leading-tight">
          {file ? file.name : "Lampirkan Foto"}
        </p>
        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onChange} />
      </div>
    </div>
  );
};

// Sub-Komponen Status Step
const StatusStep = ({ label, desc, icon, completed, currentStep, stepNum }) => {
  const isCurrent = currentStep === stepNum;
  return (
    <div className="flex items-start gap-6 relative">
      {stepNum < 3 && <div className={`absolute left-[27px] top-[52px] bottom-[-40px] w-[2px] z-0 transition-colors duration-1000 ${completed ? 'bg-emerald-500' : 'bg-white/10'}`}></div>}
      
      <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 z-10 shadow-lg transition-all duration-500 ${
        completed ? 'bg-emerald-500 scale-105 shadow-emerald-500/20' : isCurrent ? 'bg-indigo-600 ring-[6px] ring-indigo-600/20' : 'bg-slate-800 border border-white/5'
      }`}>
        {completed ? <Check size={28} strokeWidth={3} className="text-white" /> : <div className="text-white">{icon}</div>}
      </div>
      
      <div className="flex flex-col justify-center h-14">
        <span className={`text-lg font-bold tracking-tight leading-none transition-colors duration-500 ${completed ? 'text-emerald-400' : 'text-white'}`}>
          {label}
        </span>
        <span className={`text-[10px] font-normal uppercase tracking-widest mt-2 leading-none transition-colors duration-500 ${completed ? 'text-emerald-400/80' : 'text-white'}`}>
          {desc}
        </span>
      </div>
    </div>
  );
};

export default App;
