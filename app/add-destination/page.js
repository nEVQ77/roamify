'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AddDestinationPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // ฟอร์มสเตท
  const [form, setForm] = useState({
    name: '',
    category: 'nature',
    lat: '13.7563',
    lng: '100.5018',
    desc: ''
  });

  // 🌟 State สำหรับ Custom Popup Modal
  const [modal, setModal] = useState({ 
    show: false, 
    title: '', 
    message: '', 
    isSuccess: true, 
    redirectToExplore: false 
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setModal({
          show: true,
          title: 'กรุณาเข้าสู่ระบบ',
          message: 'คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถเพิ่มสถานที่ท่องเที่ยวได้',
          isSuccess: false,
          redirectToExplore: false
        });
      } else {
        setUser(session.user);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('destinations').insert([
      {
        name: form.name,
        category: form.category,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        description: form.desc, 
        created_by: user ? user.email : 'system'
      }
    ]);

    setLoading(false);

    if (error) {
      setModal({
        show: true,
        title: 'บันทึกไม่สำเร็จ',
        message: 'เกิดข้อผิดพลาด: ' + error.message,
        isSuccess: false,
        redirectToExplore: false
      });
    } else {
      setModal({
        show: true,
        title: 'เพิ่มสถานที่สำเร็จ! 🎉',
        message: 'ระบบได้บันทึกสถานที่ท่องเที่ยวใหม่ของคุณลงฐานข้อมูลเรียบร้อยแล้ว',
        isSuccess: true,
        redirectToExplore: true // กดตกลงแล้วจะพาไปหน้า /explore ทันที
      });
    }
  };

  const handleModalClose = () => {
    setModal({ ...modal, show: false });
    if (modal.redirectToExplore) {
      window.location.href = '/explore';
    } else if (!user) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col relative">
      
      {/* 🌟 Custom Popup Modal ดีไซน์พรีเมียม */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[9999] p-4 transition-all animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 w-full max-w-sm p-6 rounded-3xl shadow-2xl text-center relative transform transition-all scale-100">
            <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${modal.isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'}`}>
              {modal.isSuccess ? '✓' : '✕'}
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">{modal.title}</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">{modal.message}</p>
            <button 
              onClick={handleModalClose}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-cyan-600/25"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          🧭 Roamify : Add Destination
        </h1>
        <Link href="/explore" className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition">
          🏠 กลับหน้าหลัก
        </Link>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <span className="text-[10px] uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full">
            New Location
          </span>
          <h2 className="text-xl font-bold mt-2 text-cyan-300">📍 เพิ่มสถานที่ท่องเที่ยวใหม่</h2>
          <p className="text-xs text-slate-400 mb-6 mt-0.5">แชร์พิกัดสถานที่ท่องเที่ยวเด็ดๆ ให้ระบบสุ่มทริปของคุณและเพื่อนๆ</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">ชื่อสถานที่ท่องเที่ยว</label>
              <input 
                type="text" 
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="เช่น อุทยานแห่งชาติเขาใหญ่"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">หมวดหมู่</label>
                <select 
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                >
                  <option value="nature">🌲 ธรรมชาติ / ภูเขา / น้ำตก</option>
                  <option value="cafe">☕ คาเฟ่ชิลๆ / ถ่ายรูป</option>
                  <option value="temple">🏛️ สายบุญ / ไหว้พระ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">ละติจูด (Lat)</label>
                  <input 
                    type="number" step="any" required
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">ลองจิจูด (Lng)</label>
                  <input 
                    type="number" step="any" required
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">รายละเอียดสถานที่</label>
              <textarea 
                rows="3" required
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="อธิบายสั้นๆ ว่าสถานที่นี้มีอะไรน่าสนใจ..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 resize-none transition shadow-inner"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-cyan-600/25 mt-2"
            >
              {loading ? 'กำลังบันทึกข้อมูล...' : '💾 บันทึกสถานที่ลงฐานข้อมูล'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}