import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <header className="border-b border-slate-800/80 p-5 flex justify-between items-center bg-slate-900/40 backdrop-blur-md z-10 max-w-7xl mx-auto w-full">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          🧭 Roamify
        </h1>
        <div className="flex gap-3">
          <Link href="/login" className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition border border-slate-700">
            เข้าสู่ระบบ
          </Link>
          <Link href="/explore" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg">
            เริ่มต้นใช้งาน
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 z-10 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full mb-6">
          ✨ Weekend Getaway Planner
        </span>
        
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          สุ่มทริปเที่ยววันหยุด <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            ง่าย สนุก และคำนวณค่าน้ำมันให้พร้อม!
          </span>
        </h2>

        <div className="flex gap-4 justify-center mt-6">
          <Link href="/explore" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition text-sm">
            🎲 เริ่มต้นสุ่มทริปเลย!
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-900 p-6 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} Roamify App. All rights reserved.
      </footer>
    </div>
  );
}