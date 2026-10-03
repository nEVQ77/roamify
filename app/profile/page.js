'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        alert('กรุณาเข้าสู่ระบบก่อนเข้าหน้าโปรไฟล์');
        window.location.href = '/login';
      } else {
        setUser(session.user);
        fetchSavedTrips(session.user.email);
      }
    });
  }, []);

  const fetchSavedTrips = async (email) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_trips')
      .select('id, destinations(*)')
      .eq('user_email', email);

    if (!error && data) {
      setSavedTrips(data);
    }
    setLoading(false);
  };

  const removeSavedTrip = async (savedId) => {
    const { error } = await supabase.from('saved_trips').delete().eq('id', savedId);
    if (!error) {
      alert('🗑️ ลบทริปออกจากรายการโปรดแล้ว');
      setSavedTrips(savedTrips.filter(item => item.id !== savedId));
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          🧭 Roamify : User Profile
        </h1>
        <Link href="/explore" className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition">
          🏠 กลับหน้าแรก
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        {user && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl mb-8 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-cyan-500/20">
              👤
            </div>
            <div>
              <h2 className="text-lg font-bold text-cyan-300">บัญชีผู้ใช้งาน</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
              <span className="inline-block mt-2 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full">
                ● Active Member
              </span>
            </div>
          </div>
        )}

        <h3 className="text-md font-semibold text-slate-300 mb-4">⭐ ทริปท่องเที่ยวที่คุณบันทึกไว้ ({savedTrips.length})</h3>

        {loading ? (
          <p className="text-slate-500 text-center py-10">กำลังโหลดข้อมูลทริป...</p>
        ) : savedTrips.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500">
            <p className="text-sm">ยังไม่มีทริปที่บันทึกไว้ ลองไปกดสุ่มทริปแล้วกดบันทึกดูสิครับ!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedTrips.map((item) => {
              const dest = item.destinations;
              if (!dest) return null;
              return (
                <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-cyan-400 text-base">{dest.name}</h4>
                      <span className="text-[10px] bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full text-cyan-300 uppercase">
                        {dest.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">{dest.desc || dest.description}</p>
                    <span className="text-[11px] text-slate-500">พิกัด: {dest.lat}, {dest.lng}</span>
                  </div>
                  <button 
                    onClick={() => removeSavedTrip(item.id)}
                    className="mt-4 w-full bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    🗑️ ลบออกจากรายการโปรด
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}