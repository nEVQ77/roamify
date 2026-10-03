'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ManageDestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDest, setEditingDest] = useState(null);
  
  // 🗑️ State สำหรับควบคุม Custom Delete Modal
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  
  // 🌟 State สำหรับ Popup แจ้งเตือนทั่วไป (สำเร็จ/ผิดพลาด)
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', isSuccess: true });

  const fetchDestinations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('destinations').select('*');
    if (error) {
      setAlertModal({ show: true, title: 'เกิดข้อผิดพลาด', message: error.message, isSuccess: false });
    } else {
      setDestinations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // เมื่อกดปุ่มลบ ให้เปิด Custom Delete Modal แทน confirm() ปกติ
  const confirmDelete = (id, name) => {
    setDeleteModal({ show: true, id, name });
  };

  // ดำเนินการลบจริง (ล้างข้อมูลที่เชื่อมโยงใน saved_trips ก่อน แล้วค่อยลบ destination)
  const handleDeleteExecute = async () => {
    const { id, name } = deleteModal;
    
    // 1. ลบข้อมูลที่ผูกไว้ใน saved_trips ก่อน (ป้องกันติด Foreign Key constraint)
    await supabase.from('saved_trips').delete().eq('destination_id', id);

    // 2. ลบตัวสถานที่ท่องเที่ยว
    const { error } = await supabase.from('destinations').delete().eq('id', id);
    
    setDeleteModal({ show: false, id: null, name: '' });

    if (error) {
      setAlertModal({ show: true, title: 'ลบไม่สำเร็จ', message: error.message, isSuccess: false });
    } else {
      setAlertModal({ show: true, title: 'ลบสำเร็จ', message: `🗑️ ลบสถานที่ "${name}" เรียบร้อยแล้ว`, isSuccess: true });
      fetchDestinations(); // โหลดข้อมูลหน้าจอใหม่ทันที
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('destinations')
      .update({
        name: editingDest.name,
        category: editingDest.category,
        lat: parseFloat(editingDest.lat),
        lng: parseFloat(editingDest.lng),
        description: editingDest.desc || editingDest.description
      })
      .eq('id', editingDest.id);

    if (error) {
      setAlertModal({ show: true, title: 'แก้ไขไม่สำเร็จ', message: error.message, isSuccess: false });
    } else {
      setAlertModal({ show: true, title: 'สำเร็จ', message: '✨ อัปเดตข้อมูลสถานที่เรียบร้อยแล้ว!', isSuccess: true });
      setEditingDest(null);
      fetchDestinations();
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col relative">
      
      {/* 🌟 Custom Alert Modal (แจ้งเตือนทั่วไป) */}
      {alertModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 w-full max-w-sm p-6 rounded-3xl shadow-2xl text-center">
            <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${alertModal.isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
              {alertModal.isSuccess ? '✓' : '✕'}
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">{alertModal.title}</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">{alertModal.message}</p>
            <button 
              onClick={() => setAlertModal({ ...alertModal, show: false })}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-cyan-600/25"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* 🗑️ Custom Delete Confirmation Modal (ยืนยันการลบสุดพรีเมียม) */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 w-full max-w-sm p-6 rounded-3xl shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">ยืนยันการลบสถานที่?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              คุณต้องการลบสถานที่ <span className="text-rose-400 font-semibold">"{deleteModal.name}"</span> ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-semibold transition border border-slate-700"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleDeleteExecute}
                className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/25"
              >
                🗑️ ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          🧭 Roamify : Manage Destinations
        </h1>
        <Link href="/explore" className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition">
          🏠 กลับหน้าหลัก
        </Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-cyan-300">⚙️ จัดการสถานที่ท่องเที่ยวทั้งหมด</h2>
            <p className="text-xs text-slate-400">คุณสามารถตรวจสอบ แก้ไข หรือลบสถานที่ท่องเที่ยวในระบบได้จากที่นี่</p>
          </div>
          <Link href="/add-destination" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-lg shadow-cyan-600/20">
            ➕ เพิ่มสถานที่ใหม่
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-slate-400 py-10">กำลังโหลดข้อมูล...</p>
        ) : destinations.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm">ยังไม่มีสถานที่ท่องเที่ยวในระบบ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {destinations.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-cyan-400 text-base">{item.name}</h3>
                    <span className="text-[10px] bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full text-cyan-300 uppercase">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3 line-clamp-2">{item.desc || item.description || 'ไม่มีคำอธิบาย'}</p>
                  <div className="text-[11px] text-slate-500 flex gap-4">
                    <span>Lat: {item.lat}</span>
                    <span>Lng: {item.lng}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                  <button 
                    onClick={() => setEditingDest(item)}
                    className="flex-1 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/30 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    ✏️ แก้ไข
                  </button>
                  <button 
                    onClick={() => confirmDelete(item.id, item.name)}
                    className="flex-1 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    🗑️ ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🌟 Edit Modal */}
      {editingDest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg p-6 rounded-3xl shadow-2xl relative">
            <button 
              onClick={() => setEditingDest(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition"
            >
              ✕
            </button>

            <div className="mb-5">
              <span className="text-[10px] uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full">
                Edit Mode
              </span>
              <h3 className="text-xl font-bold text-cyan-300 mt-2">✏️ แก้ไขข้อมูลสถานที่</h3>
              <p className="text-xs text-slate-400 mt-0.5">ปรับแต่งรายละเอียดพิกัดหรือชื่อสถานที่ของคุณได้ที่นี่</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ชื่อสถานที่ท่องเที่ยว</label>
                <input 
                  type="text" required
                  value={editingDest.name}
                  onChange={(e) => setEditingDest({ ...editingDest, name: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">หมวดหมู่</label>
                  <select 
                    value={editingDest.category}
                    onChange={(e) => setEditingDest({ ...editingDest, category: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                  >
                    <option value="nature">🌲 ธรรมชาติ</option>
                    <option value="cafe">☕ คาเฟ่</option>
                    <option value="temple">🏛️ สายบุญ</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Lat</label>
                    <input 
                      type="number" step="any" required
                      value={editingDest.lat}
                      onChange={(e) => setEditingDest({ ...editingDest, lat: e.target.value })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Lng</label>
                    <input 
                      type="number" step="any" required
                      value={editingDest.lng}
                      onChange={(e) => setEditingDest({ ...editingDest, lng: e.target.value })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">รายละเอียดสถานที่</label>
                <textarea 
                  rows="3" required
                  value={editingDest.desc || editingDest.description || ''}
                  onChange={(e) => setEditingDest({ ...editingDest, desc: e.target.value, description: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 resize-none transition shadow-inner"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setEditingDest(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-semibold transition border border-slate-700"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/25"
                >
                  💾 บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}