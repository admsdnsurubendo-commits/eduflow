import React, { useState, useEffect } from 'react';
import { 
  Zap, FileUp, Users, FileBadge, Landmark, Send, Loader2, 
  Lock, Settings, Power, CheckCircle, XCircle, ChevronDown,
  CloudUpload, ScanEye, Database, Check, Activity, LogOut,
  AlertCircle, ShieldCheck
} from 'lucide-react';

/**
 * EduFlow Dasis - Smart Engine (Universal Shared Edition)
 * Versi: 2025.6.1 (Perbaikan DOM Nesting & Stabilitas)
 * Dibuat oleh: INISIAL TH
 */

const App = () => {
  // --- MASUKKAN URL HASIL DEPLOY GOOGLE APPS SCRIPT ANDA DI SINI ---
  const MASTER_GAS_URL = "https://script.google.com/macros/s/AKfycb...MASUKKAN_URL_ANDA_DI_SINI.../exec";
  const DEFAULT_MASTER_PASSWORD = 'admin123';

  const [view, setView] = useState('student');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0); 
  const [notification, setNotification] = useState(null);
  
  const [adminLoginPass, setAdminLoginPass] = useState('');
  const [passChange, setPassChange] = useState({ old: '', new: '', confirm: '' });
  const [studentData, setStudentData] = useState({ nama: '', kelas: '', kk: null, akte: null, pip: null });
  
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('eduflow_config_v2025_final');
    const parsed = saved ? JSON.parse(saved) : {};
    
    // Jika di localStorage kosong (laptop baru), pakai MASTER_GAS_URL
    return {
      gasUrl: parsed.gasUrl || MASTER_GAS_URL,
      masterPassword: parsed.masterPassword || DEFAULT_MASTER_PASSWORD
    };
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
    // Validasi URL
    if (!config.gasUrl || config.gasUrl.includes("MASUKKAN_URL_ANDA")) {
      return showNotify('error', 'Konfigurasi belum diaktifkan oleh Admin Pusat.');
    }
    if (!studentData.nama || !studentData.kelas) return showNotify('error', 'Nama & Kelas wajib diisi.');
    if (!studentData.kk || !studentData.akte || !studentData.pip) return showNotify('error', 'Lengkapi 3 Foto dokumen.');

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

      await fetch(config.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      setStep(3); 
      setTimeout(() => {
        setStep(4);
        showNotify('success', `Berhasil! Data ${studentData.nama} telah masuk ke sistem.`);
        setStudentData({ nama: '', kelas: '', kk: null, akte: null, pip: null });
        setTimeout(() => { setStep(0); setIsProcessing(false); }, 4000);
      }, 1000);
    } catch (err) {
      showNotify('error', 'Koneksi Gagal: ' + err.message);
      setStep(0);
      setIsProcessing(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminLoginPass === config.masterPassword) {
      setIsAuthenticated(true);
      setView('admin');
      setAdminLoginPass('');
    } else {
      showNotify('error', 'Sandi salah.');
    }
  };

  const updatePassword = (e) => {
    e.preventDefault();
    if (passChange.old !== config.masterPassword) return showNotify('error', 'Sandi lama salah.');
    if (passChange.new !== passChange.confirm) return showNotify('error', 'Konfirmasi tidak cocok.');
    
    const updated = { ...config, masterPassword: passChange.new };
    setConfig(updated);
    localStorage.setItem('eduflow_config_v2025_final', JSON.stringify(updated));
    setPassChange({ old: '', new: '', confirm: '' });
    showNotify('success', 'Password Admin berhasil diubah.');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }} className="min-h-screen bg-[#f8fafc] text-[#334155] flex flex-col antialiased text-left">
      {notification && (
        <div className={`fixed top-8 right-8 z-[100] p-4 rounded-lg shadow-2xl flex items-center gap-3 border backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold">{notification.message}</p>
        </div>
      )}

      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg"><Zap size={22} strokeWidth={2.5} /></div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-none">EDUFLOW DASIS</h1>
            <p className="text-[10px] font-normal text-indigo-600 mt-1 tracking-widest uppercase leading-none">Smart Engine v2.5</p>
          </div>
        </div>
        {isAuthenticated && (
          <button onClick={() => { setIsAuthenticated(false); setView('student'); }} className="text-slate-400 hover:text-red-600 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all">
            <LogOut size={16} /> Keluar
          </button>
        )}
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12 flex-grow w-full">
        {view === 'student' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700"><FileUp size={24} strokeWidth={2} /></div>
                <div><h2 className="text-xl font-bold text-slate-900 leading-none">Pendaftaran Berkas</h2><p className="text-sm text-slate-400 mt-1.5 italic">Gunakan foto dokumen asli yang jelas</p></div>
              </div>
              <form onSubmit={runAutomation} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Nama Lengkap Siswa</label>
                    <input type="text" required className="w-full px-4 py-3 rounded border border-slate-200 bg-slate-50 focus:border-indigo-600 focus:bg-white transition-all text-base" value={studentData.nama} onChange={(e) => setStudentData({...studentData, nama: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kelas</label>
                    <div className="relative">
                      <select required className="w-full px-4 py-3 rounded border border-slate-200 bg-slate-50 focus:border-indigo-600 appearance-none cursor-pointer" value={studentData.kelas} onChange={(e) => setStudentData({...studentData, kelas: e.target.value})}>
                        <option value="" disabled>-</option>
                        {[1, 2, 3, 4, 5, 6].map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <UploadCard label="Foto KK" theme="blue" icon={<Users size={24} />} file={studentData.kk} onChange={(e) => setStudentData({...studentData, kk: e.target.files[0]})} />
                  <UploadCard label="Foto Akte" theme="emerald" icon={<FileBadge size={24} />} file={studentData.akte} onChange={(e) => setStudentData({...studentData, akte: e.target.files[0]})} />
                  <UploadCard label="Rekening PIP" theme="amber" icon={<Landmark size={24} />} file={studentData.pip} onChange={(e) => setStudentData({...studentData, pip: e.target.files[0]})} />
                </div>
                <button disabled={isProcessing} className={`w-full py-4 rounded font-bold text-white shadow-xl transition-all flex justify-center items-center gap-3 text-lg ${isProcessing ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'}`}>
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  {isProcessing ? 'MENYIMPAN KE CLOUD...' : 'KIRIM BERKAS SEKARANG'}
                </button>
              </form>
            </div>
            <div className="lg:col-span-5 bg-[#0f172a] rounded-xl p-8 md:p-10 text-white shadow-xl">
               <h3 className="font-bold text-lg mb-10 border-b border-white/10 pb-5 tracking-tight uppercase">Monitor Transmisi</h3>
               <div className="space-y-10 relative">
                  <StatusStep label="Cloud Upload" desc="Drive Storage Sync" icon={<CloudUpload size={24} />} stepNum={1} currentStep={step} completed={step > 1} />
                  <StatusStep label="AI Vision" desc="OCR Text Extraction" icon={<ScanEye size={24} />} stepNum={2} currentStep={step} completed={step > 2} />
                  <StatusStep label="G-Sync" desc="Sheet Entry Logging" icon={<Database size={24} />} stepNum={3} currentStep={step} completed={step >= 4} />
               </div>
               <div className="mt-12 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1 text-left">Status Server</p>
                  {/* Perbaikan di bawah: Menggunakan div, bukan p, untuk membungkus elemen blok seperti div indikator */}
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-2 animate-pulse text-left">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> 
                    SISTEM SIAP MENERIMA DATA
                  </div>
               </div>
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="max-w-md mx-auto bg-white p-10 rounded-xl shadow-lg border border-slate-200 text-center mt-10 animate-in zoom-in-95 duration-300">
            <Lock size={32} className="mx-auto mb-6 text-indigo-600" />
            <h2 className="text-xl font-bold mb-8 uppercase">Akses Admin</h2>
            <form onSubmit={handleLogin} className="space-y-6 text-left">
              <input type="password" placeholder="Sandi Admin" className="w-full p-4 rounded border border-slate-200 bg-slate-50 text-center font-bold text-xl outline-none focus:border-indigo-600" value={adminLoginPass} onChange={(e) => setAdminLoginPass(e.target.value)} autoFocus />
              <button className="w-full bg-slate-900 text-white py-4 rounded font-bold uppercase text-[11px] tracking-widest hover:bg-black transition-all">Verifikasi</button>
            </form>
          </div>
        )}

        {view === 'admin' && isAuthenticated && (
          <div className="max-w-4xl mx-auto space-y-8 text-left animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-xl shadow-lg border border-slate-200">
              <div className="flex items-center gap-4 mb-8 pb-5 border-b border-slate-100">
                <Settings size={28} />
                <h2 className="text-xl font-bold">Konfigurasi Pusat</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500">URL Backend (Hardcoded)</label>
                  <input type="text" className="w-full p-4 rounded border bg-slate-50 text-sm text-indigo-600 outline-none" value={config.gasUrl} onChange={(e) => setConfig({...config, gasUrl: e.target.value})} placeholder="https://script.google.com/..." />
                  <p className="text-[10px] text-slate-400 italic">* Mengubah ini akan menyimpan URL ke perangkat ini saja. Untuk permanen bagi siswa, ubah konstanta MASTER_GAS_URL di kode sumber.</p>
                </div>
                <button onClick={() => { localStorage.setItem('eduflow_config_v2025_final', JSON.stringify(config)); showNotify('success', 'URL tersimpan di browser ini.'); }} className="bg-slate-900 text-white px-8 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">Simpan di Perangkat Ini</button>
              </div>
            </div>

            <div className="bg-white p-10 rounded-xl shadow-lg border border-slate-200">
              <div className="flex items-center gap-4 mb-8 pb-5 border-b border-slate-100 text-red-600">
                <ShieldCheck size={28} />
                <h2 className="text-xl font-bold">Ganti Password Admin</h2>
              </div>
              <form onSubmit={updatePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sandi Lama</label>
                    <input type="password" required className="w-full p-3 rounded border bg-slate-50" value={passChange.old} onChange={(e)=>setPassChange({...passChange, old: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sandi Baru</label>
                    <input type="password" required className="w-full p-3 rounded border bg-slate-50" value={passChange.new} onChange={(e)=>setPassChange({...passChange, new: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Konfirmasi</label>
                    <input type="password" required className="w-full p-3 rounded border bg-slate-50" value={passChange.confirm} onChange={(e)=>setPassChange({...passChange, confirm: e.target.value})} />
                  </div>
                </div>
                <button className="bg-red-600 text-white px-8 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all">Perbarui Password</button>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 px-12 border-t border-slate-200 bg-white flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
        <p className="text-slate-400 text-[10px] uppercase tracking-[0.5em] leading-none font-normal">EDUFLOW by INISIAL TH</p>
        <button onClick={() => setView(view === 'student' ? 'login' : 'student')} className="bg-red-600 text-white px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] shadow hover:bg-red-700 transition-all active:scale-95 leading-none">ADMIN</button>
      </footer>
    </div>
  );
};

const UploadCard = ({ label, theme, icon, file, onChange }) => {
  const themes = {
    blue: file ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300',
    emerald: file ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:border-emerald-300',
    amber: file ? 'border-amber-600 bg-amber-50/50' : 'border-slate-200 bg-slate-50 hover:border-amber-300'
  };
  const iconColors = { blue: 'text-indigo-600', emerald: 'text-emerald-600', amber: 'text-amber-600', default: 'text-slate-400' };
  return (
    <div className={`p-4 rounded border-2 transition-all h-full flex flex-col items-center justify-center text-center relative group ${themes[theme]}`}>
      <div className={`p-2.5 rounded-full mb-3 transition-all ${file ? 'bg-white shadow-sm scale-110' : 'bg-slate-100'}`}>
        <div className={file ? iconColors[theme] : iconColors.default}>{icon}</div>
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 leading-none ${file ? 'text-slate-900' : 'text-slate-500'}`}>{label}</p>
      <p className="text-[10px] text-slate-400 truncate w-full px-2 italic font-normal leading-tight">{file ? file.name : "Pilih Foto"}</p>
      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onChange} />
    </div>
  );
};

const StatusStep = ({ label, desc, icon, completed, currentStep, stepNum }) => {
  const isCurrent = currentStep === stepNum;
  return (
    <div className="flex items-start gap-6 relative">
      {stepNum < 3 && <div className={`absolute left-[27px] top-[52px] bottom-[-28px] w-px bg-white/10 ${completed ? 'bg-emerald-500' : ''}`}></div>}
      <div className={`w-14 h-14 rounded flex items-center justify-center flex-shrink-0 z-10 shadow-lg transition-all ${completed ? 'bg-emerald-500 scale-105' : isCurrent ? 'bg-indigo-600 ring-[6px] ring-indigo-600/20' : 'bg-slate-800 border border-white/5'}`}>
        {completed ? <Check size={28} strokeWidth={3} className="text-white" /> : <div className="text-white">{icon}</div>}
      </div>
      <div className="flex flex-col justify-center h-14 text-left">
        <span className={`text-lg font-bold tracking-tight leading-none ${completed ? 'text-emerald-400' : 'text-white'}`}>{label}</span>
        <span className={`text-[11px] font-normal uppercase tracking-widest mt-2 leading-none ${completed ? 'text-emerald-400/80' : 'text-white'}`}>{desc}</span>
      </div>
    </div>
  );
};

export default App;
