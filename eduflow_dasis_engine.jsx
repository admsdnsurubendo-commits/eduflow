import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';

/**
 * EduFlow Dasis - Engine
 * Created by: INISIAL TH
 */

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [view, setView] = useState('student'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0); 
  const [notification, setNotification] = useState(null);
  
  const [config, setConfig] = useState({
    apiKey: '',
    clientId: '',
    folderId: '',
    spreadsheetId: '',
    masterPassword: 'admin123'
  });
  
  const [studentData, setStudentData] = useState({
    nama: '',
    kk: null,
    akte: null,
    pip: null
  });

  const [logs, setLogs] = useState([
    { id: 1, nama: 'Budi Santoso', status: 'Selesai', waktu: '20/12/2023 10:00', tipe: 'KK' },
    { id: 2, nama: 'Siti Aminah', status: 'Selesai', waktu: '20/12/2023 10:15', tipe: 'Akte' },
  ]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPassword === config.masterPassword) {
      setIsAuthenticated(true);
      setLoginError('');
      setView('admin');
      showNotification('success', 'Berhasil login sebagai Admin.');
    } else {
      setLoginError('Password salah.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword('');
    setView('student');
    showNotification('info', 'Logout berhasil.');
  };

  const navigateTo = (targetView) => {
    if ((targetView === 'admin' || targetView === 'settings') && !isAuthenticated) {
      setView('login');
    } else {
      setView(targetView);
    }
  };

  const runAutomation = async (e) => {
    e.preventDefault();
    if (!studentData.nama || !studentData.kk) {
      showNotification('error', 'Nama dan KK wajib diisi.');
      return;
    }

    setIsProcessing(true);
    setStep(1); 
    await new Promise(r => setTimeout(r, 1500)); 
    setStep(2); 
    await new Promise(r => setTimeout(r, 2000));
    setStep(3); 
    await new Promise(r => setTimeout(r, 1200));

    setIsProcessing(false);
    setStep(0);
    
    const newLog = {
      id: Date.now(),
      nama: studentData.nama,
      status: 'Selesai',
      waktu: new Date().toLocaleString('id-ID'),
      tipe: 'Set Lengkap'
    };
    
    setLogs([newLog, ...logs]);
    showNotification('success', 'Data berhasil diproses!');
    setStudentData({ nama: '', kk: null, akte: null, pip: null });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) setStudentData({ ...studentData, [field]: file });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 text-left">
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
           notification.type === 'error' ? <XCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-semibold">{notification.message}</p>
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
            <Zap className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800 leading-none uppercase">EduFlow Dasis</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1 italic">Engine by INISIAL TH</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl items-center overflow-x-auto max-w-full">
          <button onClick={() => navigateTo('student')} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${view === 'student' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Portal Siswa</button>
          <button onClick={() => navigateTo('admin')} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${view === 'admin' || view === 'login' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Admin</button>
          <button onClick={() => navigateTo('settings')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'settings' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><Settings className="w-4 h-4" /></button>
          {isAuthenticated && (
            <button onClick={handleLogout} className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><LogOut className="w-4 h-4" /></button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {view === 'login' && (
          <div className="max-w-md mx-auto mt-12 md:mt-24 bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8"><Lock className="text-blue-600 w-10 h-10" /></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="password" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none" placeholder="Password Admin" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"><LogIn className="w-5 h-5" /> MASUK</button>
            </form>
          </div>
        )}

        {view === 'student' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3"><Upload className="text-blue-600" /> Unggah Berkas</h2>
              <form onSubmit={runAutomation} className="space-y-8 text-left">
                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase">Nama Siswa</label>
                <input type="text" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium" placeholder="Nama lengkap..." value={studentData.nama} onChange={(e) => setStudentData({...studentData, nama: e.target.value})} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <FileUploadCard label="Foto KK" icon={<ImageIcon className="text-blue-500" />} onChange={(e) => handleFileChange(e, 'kk')} file={studentData.kk} />
                  <FileUploadCard label="Foto Akte" icon={<FileText className="text-emerald-500" />} onChange={(e) => handleFileChange(e, 'akte')} file={studentData.akte} />
                  <FileUploadCard label="Buku PIP" icon={<Database className="text-amber-500" />} onChange={(e) => handleFileChange(e, 'pip')} file={studentData.pip} />
                </div>
                <button disabled={isProcessing} className={`w-full py-5 rounded-3xl font-bold text-white shadow-xl flex justify-center items-center gap-3 text-lg transition-all ${isProcessing ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : <Zap className="w-6 h-6" />} {isProcessing ? 'MEMPROSES...' : 'KIRIM DATA'}
                </button>
              </form>
            </div>
            <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="font-bold text-xl mb-8 flex items-center gap-3 border-b border-white/10 pb-4"><Zap className="text-yellow-400 w-6 h-6" /> Logika Mesin</h3>
              <div className="space-y-6">
                <StatusStep active={step >= 1} current={step === 1} label="Cloud Upload" desc="Drive Storage" />
                <StatusStep active={step >= 2} current={step === 2} label="OCR Scanning" desc="Vision AI" />
                <StatusStep active={step >= 3} current={step === 3} label="Database Sync" desc="Google Sheets" />
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && isAuthenticated && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-left">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Database Verifikasi</h2>
              <button className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-100 flex items-center gap-2 transition-all"><Database className="w-5 h-5" /> BUKA SHEETS</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
                  <tr><th className="px-10 py-6 text-left">Nama Siswa</th><th className="px-10 py-6 text-left">Tipe</th><th className="px-10 py-6 text-left">Status</th><th className="px-10 py-6 text-center">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-10 py-6 font-bold">{log.nama}</td>
                      <td className="px-10 py-6 uppercase text-[10px] font-bold text-slate-500">{log.tipe}</td>
                      <td className="px-10 py-6 text-emerald-600 font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> TERPROSES</td>
                      <td className="px-10 py-6 text-center"><button className="text-blue-600 font-bold text-xs uppercase hover:underline">Detail</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'settings' && isAuthenticated && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-left">
            <h2 className="text-2xl font-bold mb-10 flex items-center gap-4 text-left"><ShieldCheck className="text-blue-600" /> Konfigurasi Cloud</h2>
            <div className="space-y-6">
              <InputField label="API Key" />
              <InputField label="Client ID" />
              <InputField label="Folder ID" />
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Password Admin</label>
                <input type="text" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-mono" value={config.masterPassword} onChange={(e) => setConfig({...config, masterPassword: e.target.value})} />
              </div>
              <button className="w-full bg-slate-900 text-white py-5 rounded-3xl font-bold hover:bg-black transition-all shadow-xl">SIMPAN KONFIGURASI</button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-12 text-slate-300 text-[10px] uppercase tracking-[0.3em] font-medium">
        <p>&copy; 2024 EduFlow Dasis &bull; INISIAL TH</p>
      </footer>
    </div>
  );
};

const FileUploadCard = ({ label, icon, onChange, file }) => (
  <div className="relative group h-40">
    <div className={`p-4 rounded-3xl border-2 border-dashed transition-all h-full flex flex-col items-center justify-center text-center ${file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-white group-hover:bg-blue-50/50'}`}>
      <div className="mb-3 p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
      <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter mb-1 leading-tight">{label}</p>
      <p className="text-[9px] text-slate-400 truncate w-full px-4">{file ? file.name : 'Pilih Foto'}</p>
      <input type="file" accept="image/*" onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
    </div>
  </div>
);

const StatusStep = ({ active, current, label, desc }) => (
  <div className={`flex items-start gap-4 transition-all duration-700 text-left ${active ? 'opacity-100' : 'opacity-20'}`}>
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${current ? 'bg-yellow-400 animate-pulse ring-8 ring-yellow-400/20 shadow-lg' : active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
      {active && !current ? <CheckCircle className="w-5 h-5 text-white" /> : <div className="w-2 h-2 rounded-full bg-white/40"></div>}
    </div>
    <div className="flex flex-col text-left">
      <span className={`text-sm font-bold ${current ? 'text-yellow-400' : 'text-white'}`}>{label}</span>
      <span className="text-[10px] text-white/40 font-medium">{desc}</span>
    </div>
  </div>
);

const InputField = ({ label }) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase text-left">{label}</label>
    <input type="password" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-mono text-left" placeholder="Sandi..." />
  </div>
);

export default App;