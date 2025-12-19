import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  UploadCloud, 
  FileUp, 
  Users, 
  Award, 
  Landmark, 
  Send, 
  Loader2, 
  Lock, 
  Settings, 
  Save, 
  Power, 
  CheckCircle, 
  XCircle,
  Cpu
} from 'lucide-react';

/**
 * EduFlow Dasis - GAS Bridge Engine (3 Documents Edition)
 * Dibuat oleh: INISIAL TH
 * Versi: 2025.3.0
 */

const App = () => {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('student'); // student, login, admin
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [adminPass, setAdminPass] = useState('');
  const [studentData, setStudentData] = useState({ 
    nama: '', 
    kk: null, 
    akte: null, 
    pip: null 
  });
  
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('eduflow_gas_config');
    return saved ? JSON.parse(saved) : { 
      gasUrl: '', 
      masterPassword: 'admin123' 
    };
  });

  // --- HELPER FUNCTIONS ---
  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const convertToBase64 = (file) => {
    if (!file) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  // --- MAIN LOGIC ---
  const runAutomation = async (e) => {
    e.preventDefault();
    if (!config.gasUrl) return showNotify('error', 'Konfigurasi belum diatur Admin.');
    if (!studentData.nama || !studentData.kk || !studentData.akte || !studentData.pip) {
      return showNotify('error', 'Wajib melengkapi Nama dan mengunggah 3 foto dokumen.');
    }

    setIsProcessing(true);
    try {
      // Konversi semua file ke Base64 secara paralel
      const [b64KK, b64Akte, b64PIP] = await Promise.all([
        convertToBase64(studentData.kk),
        convertToBase64(studentData.akte),
        convertToBase64(studentData.pip)
      ]);

      const payload = {
        nama_siswa: studentData.nama,
        foto_kk: b64KK,
        foto_akte: b64Akte,
        foto_pip: b64PIP
      };

      // Kirim ke Google Apps Script (mode no-cors untuk redirect Apps Script)
      await fetch(config.gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      showNotify('success', 'Semua berkas berhasil dikirim ke infrastruktur Cloud!');
      setStudentData({ nama: '', kk: null, akte: null, pip: null });
    } catch (err) {
      showNotify('error', 'Gagal mengirim: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPass === config.masterPassword) {
      setView('admin');
      setAdminPass('');
    } else {
      showNotify('error', 'Sandi Salah!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased text-left">
      {/* Notifikasi */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all animate-in fade-in slide-in-from-right-4 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
        </div>
      )}

      {/* Navigasi */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100"><Zap className="w-5 h-5" /></div>
          <div className="text-left leading-none">
            <h1 className="font-extrabold text-xl tracking-tight leading-none">EduFlow Dasis</h1>
            <p className="text-[9px] uppercase font-bold text-slate-400 mt-1 italic tracking-widest leading-none">Digital Archive 2025</p>
          </div>
        </div>
        {view === 'admin' && (
          <button onClick={() => {setView('student');}} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <Power className="w-5 h-5" />
          </button>
        )}
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-10 flex-grow w-full">
        {/* Tampilan Siswa */}
        {view === 'student' && (
          <div className="bg-white p-8 md:p-14 rounded-[3rem] border border-slate-100 shadow-2xl text-left animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
              <div className="bg-blue-50 p-4 rounded-3xl text-blue-600"><FileUp className="w-8 h-8" /></div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-none">Portal Berkas</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 leading-none">Unggah identitas dan 3 berkas asli</p>
              </div>
            </div>

            <form onSubmit={runAutomation} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-2 leading-none">Nama Lengkap Siswa</label>
                <input 
                  type="text" 
                  className="w-full px-8 py-6 rounded-3xl border border-slate-100 outline-none text-2xl font-bold bg-slate-50 focus:ring-8 focus:ring-blue-50 transition-all shadow-inner" 
                  placeholder="Contoh: Andi Pratama" 
                  value={studentData.nama} 
                  onChange={(e) => setStudentData({...studentData, nama: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <FileUploadCard 
                  label="Kartu Keluarga" 
                  icon={<Users className={`w-8 h-8 ${studentData.kk ? 'text-emerald-500' : 'text-slate-300'}`} />} 
                  file={studentData.kk} 
                  onChange={(e) => setStudentData({...studentData, kk: e.target.files[0]})} 
                />
                <FileUploadCard 
                  label="Akte Kelahiran" 
                  icon={<Award className={`w-8 h-8 ${studentData.akte ? 'text-emerald-500' : 'text-slate-300'}`} />} 
                  file={studentData.akte} 
                  onChange={(e) => setStudentData({...studentData, akte: e.target.files[0]})} 
                />
                <FileUploadCard 
                  label="Rekening PIP" 
                  icon={<Landmark className={`w-8 h-8 ${studentData.pip ? 'text-emerald-500' : 'text-slate-300'}`} />} 
                  file={studentData.pip} 
                  onChange={(e) => setStudentData({...studentData, pip: e.target.files[0]})} 
                />
              </div>

              <button 
                disabled={isProcessing} 
                className={`w-full py-7 rounded-[2.5rem] font-black text-white shadow-2xl transition-all flex justify-center items-center gap-5 text-2xl ${isProcessing ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
              >
                {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : <Send className="w-8 h-8" />}
                {isProcessing ? 'SEDANG MENGIRIM...' : 'KIRIM SEMUA BERKAS'}
              </button>
            </form>
          </div>
        )}

        {/* Tampilan Login */}
        {view === 'login' && (
          <div className="max-w-sm mx-auto bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 text-center animate-in fade-in duration-300">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-black mb-6">Akses Staf</h2>
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <input 
                type="password" 
                placeholder="Sandi Admin" 
                className="w-full p-5 rounded-2xl border bg-slate-50 text-center font-bold text-lg outline-none focus:ring-4 focus:ring-blue-100" 
                value={adminPass} 
                onChange={(e) => setAdminPass(e.target.value)} 
                autoFocus 
              />
              <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl">Login Sistem</button>
              <button type="button" onClick={() => setView('student')} className="w-full text-[10px] text-slate-400 font-bold uppercase py-2">Kembali</button>
            </form>
          </div>
        )}

        {/* Tampilan Admin Settings */}
        {view === 'admin' && (
          <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-left animate-in fade-in duration-500">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4"><Settings className="w-8 h-8" /> Konfigurasi Cloud</h2>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">GAS Web App URL (Production)</label>
                <input 
                  type="text" 
                  className="w-full p-5 rounded-2xl border bg-slate-50 text-xs font-mono text-blue-600 outline-none focus:ring-4 focus:ring-blue-100 shadow-inner" 
                  placeholder="https://script.google.com/macros/s/.../exec" 
                  value={config.gasUrl} 
                  onChange={(e) => setConfig({...config, gasUrl: e.target.value})} 
                />
              </div>
              <div className="pt-6 border-t">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 block mb-3">Ganti Sandi Panel</label>
                <input 
                  type="text" 
                  className="w-full p-5 rounded-2xl border bg-slate-50 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 shadow-inner" 
                  value={config.masterPassword} 
                  onChange={(e) => setConfig({...config, masterPassword: e.target.value})} 
                />
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('eduflow_gas_config', JSON.stringify(config)); 
                  showNotify('success', 'Konfigurasi Mesin Berhasil Diaktifkan!'); 
                  setView('student');
                }} 
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl hover:bg-black transition-all"
              >
                SIMPAN & UPDATE MESIN
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-slate-100 bg-white/50 flex justify-between items-center px-10">
        <p className="text-black text-[10px] font-black uppercase tracking-[0.4em]">&copy; 2025 EDUFLOW by INISIAL TH</p>
        <button 
          onClick={() => setView(view === 'student' ? 'login' : 'student')} 
          className="opacity-10 hover:opacity-100 transition-all text-black text-[10px] font-black uppercase tracking-widest leading-none"
        >
          STAF SAJA
        </button>
      </footer>
    </div>
  );
};

// --- SUB KOMPONEN ---
const FileUploadCard = ({ label, icon, file, onChange }) => (
  <div className="relative group h-36">
    <div className={`p-4 rounded-3xl border-2 border-dashed transition-all h-full flex flex-col items-center justify-center text-center ${
      file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white group-hover:bg-blue-50/50'
    }`}>
      <div className="mb-2">{icon}</div>
      <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter mb-1 leading-tight">{label}</p>
      <p className="text-[9px] text-slate-400 truncate w-full px-4 italic leading-none">{file ? file.name : "Pilih File"}</p>
      <input 
        type="file" 
        accept="image/*" 
        className="absolute inset-0 opacity-0 cursor-pointer" 
        onChange={onChange} 
      />
    </div>
  </div>
);

export default App;
