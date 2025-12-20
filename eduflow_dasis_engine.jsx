import React, { useState, useEffect } from 'react';
import { 
  Zap, FileUp, Users, FileBadge, Landmark, Send, Loader2, 
  CheckCircle, ChevronDown, CloudUpload, ScanEye, Database, 
  Check, Activity, AlertCircle
} from 'lucide-react';

/**
 * EduFlow Dasis - Smart Engine (Simplified Shared Edition)
 * Versi: 2025.7.1 (Optional PIP & New Branding)
 * Dibuat oleh: INISIAL TH
 */

const App = () => {
  // --- TEMPELKAN URL WEB APP GOOGLE APPS SCRIPT (GAS) ANDA DI SINI ---
  const MASTER_GAS_URL = "https://script.google.com/macros/s/AKfycbwHbEQxX850y8HT8GmN65XGy-Q331RYh_-SSvUCGvvCDVGjEpLjlMfxYhgMCVZheXL_cQ/exec";

  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0); 
  const [notification, setNotification] = useState(null);
  const [studentData, setStudentData] = useState({ nama: '', kelas: '', kk: null, akte: null, pip: null });

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
    
    if (MASTER_GAS_URL.includes("MASUKKAN_URL_ANDA")) {
      return showNotify('error', 'Sistem belum dikonfigurasi (URL GAS Kosong).');
    }

    if (!studentData.nama || !studentData.kelas) return showNotify('error', 'Nama Lengkap dan Kelas wajib diisi.');
    
    // Validasi: PIP sekarang OPSIONAL. KK dan Akte tetap WAJIB.
    if (!studentData.kk || !studentData.akte) {
      return showNotify('error', 'Mohon lengkapi minimal foto KK dan Akte Kelahiran.');
    }

    setIsProcessing(true);
    setStep(1); 
    
    try {
      // Konversi dokumen ke Base64 secara berurutan (PIP bisa null)
      const b64KK = await convertToBase64(studentData.kk);
      const b64Akte = await convertToBase64(studentData.akte);
      const b64PIP = await convertToBase64(studentData.pip);

      setStep(2); 
      
      const payload = {
        nama_siswa: studentData.nama,
        kelas: studentData.kelas,
        foto_kk: b64KK,
        foto_akte: b64Akte,
        foto_pip: b64PIP // Akan dikirim sebagai null jika tidak ada
      };

      const response = await fetch(MASTER_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Gagal terhubung ke server Google.");

      setStep(3); 
      
      setTimeout(() => {
        setStep(4);
        showNotify('success', `Data ${studentData.nama} berhasil diarsipkan.`);
        setStudentData({ nama: '', kelas: '', kk: null, akte: null, pip: null });
        setTimeout(() => { setStep(0); setIsProcessing(false); }, 4000);
      }, 1000);
      
    } catch (err) {
      showNotify('error', 'Terjadi kesalahan sistem: ' + err.message);
      setStep(0);
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }} className="min-h-screen bg-[#f8fafc] text-[#334155] flex flex-col antialiased text-left selection:bg-indigo-100">
      
      {notification && (
        <div className={`fixed top-8 right-8 z-[100] p-4 rounded-lg shadow-2xl flex items-center gap-3 border backdrop-blur-md animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold tracking-tight">{notification.message}</p>
        </div>
      )}

      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg">
            <Zap size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-none">EDUFLOW DASIS</h1>
            <p className="text-[10px] font-normal text-indigo-600 mt-1 tracking-widest uppercase leading-none">Smart Engine by INISIAL TH</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          Server Aktif
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12 flex-grow w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
              <div className="p-3 bg-slate-50 rounded-lg text-slate-700">
                <FileUp size={24} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-none">Unggah Berkas Digital</h2>
                <p className="text-sm text-slate-400 mt-1.5 font-normal italic">Isi data dan lampirkan foto dokumen asli</p>
              </div>
            </div>

            <form onSubmit={runAutomation} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Nama Lengkap Siswa</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:border-indigo-600 focus:bg-white transition-all outline-none text-base font-normal" 
                    value={studentData.nama} 
                    onChange={(e) => setStudentData({...studentData, nama: e.target.value})} 
                    placeholder="Masukkan nama lengkap..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kelas</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:border-indigo-600 appearance-none cursor-pointer text-base font-normal"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UploadCard 
                  label="Foto KK" 
                  theme="blue" 
                  icon={<Users size={24} />} 
                  file={studentData.kk} 
                  required={true}
                  onChange={(e) => setStudentData({...studentData, kk: e.target.files[0]})} 
                />
                <UploadCard 
                  label="Foto Akte" 
                  theme="emerald" 
                  icon={<FileBadge size={24} />} 
                  file={studentData.akte} 
                  required={true}
                  onChange={(e) => setStudentData({...studentData, akte: e.target.files[0]})} 
                />
                <UploadCard 
                  label="Rekening PIP" 
                  theme="amber" 
                  icon={<Landmark size={24} />} 
                  file={studentData.pip} 
                  required={false}
                  onChange={(e) => setStudentData({...studentData, pip: e.target.files[0]})} 
                />
              </div>

              <button 
                disabled={isProcessing} 
                className={`w-full py-4 rounded-lg font-bold text-white shadow-xl transition-all flex justify-center items-center gap-3 text-lg ${isProcessing ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'}`}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {isProcessing ? 'SEDANG MEMPROSES...' : 'KIRIM BERKAS SEKARANG'}
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-5 bg-[#0f172a] rounded-xl p-8 md:p-10 text-white shadow-xl">
             <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-5">
                <div className="p-2.5 bg-white/10 rounded-lg text-indigo-400">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none uppercase tracking-tight">Status Transmisi</h3>
                  <p className="text-[10px] uppercase font-normal text-white/50 mt-1.5 tracking-widest leading-none">Monitor Real-time</p>
                </div>
             </div>
             
             <div className="space-y-10 relative">
                <StatusStep label="Cloud Upload" desc="Drive Storage Sync" icon={<CloudUpload size={24} />} stepNum={1} currentStep={step} completed={step > 1} />
                <StatusStep label="AI Vision" desc="OCR Text Extraction" icon={<ScanEye size={24} />} stepNum={2} currentStep={step} completed={step > 2} />
                <StatusStep label="G-Sync" desc="Sheet Entry Logging" icon={<Database size={24} />} stepNum={3} currentStep={step} completed={step >= 4} />
             </div>

             <div className="mt-12 p-4 bg-white/5 border border-white/10 rounded-lg text-left">
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1">Status Server</p>
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-2 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> 
                  SISTEM SIAP MENERIMA DATA
                </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="py-10 px-12 border-t border-slate-200 bg-white flex justify-center items-center mt-auto">
        <p className="text-black text-[10px] uppercase tracking-[0.5em] leading-none font-bold">
          EDUFLOW DASIS-BY INISIAL TH
        </p>
      </footer>
    </div>
  );
};

const UploadCard = ({ label, theme, icon, file, onChange, required }) => {
  const iconColors = { blue: 'text-indigo-600', emerald: 'text-emerald-600', amber: 'text-amber-600', default: 'text-slate-400' };
  const border = file ? 'border-indigo-600 bg-indigo-50/50 shadow-inner' : 'border-slate-200 bg-slate-50 hover:border-indigo-300';
  return (
    <div className={`p-4 rounded-lg border-2 transition-all h-full flex flex-col items-center justify-center text-center relative group ${border}`}>
      <div className={`p-2.5 rounded-full mb-3 transition-all ${file ? 'bg-white shadow-sm scale-110' : 'bg-white'}`}>
        <div className={file ? iconColors[theme] : iconColors.default}>{icon}</div>
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 leading-none ${file ? 'text-slate-900' : 'text-slate-500'}`}>
        {label} {!required && <span className="text-[8px] normal-case font-normal">(Opsional)</span>}
      </p>
      <p className="text-[10px] text-slate-400 truncate w-full px-2 italic font-normal leading-tight">{file ? file.name : "Pilih Foto"}</p>
      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onChange} />
    </div>
  );
};

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
      <div className="flex flex-col justify-center h-14 text-left">
        <span className={`text-lg font-bold tracking-tight leading-none transition-colors duration-500 ${completed ? 'text-emerald-400' : 'text-white'}`}>{label}</span>
        <span className={`text-[11px] font-normal uppercase tracking-widest mt-2 leading-none transition-colors duration-500 ${completed ? 'text-emerald-400/80' : 'text-white'}`}>{desc}</span>
      </div>
    </div>
  );
};

export default App;
