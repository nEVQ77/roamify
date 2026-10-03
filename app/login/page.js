'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // States สำหรับเปิด-ปิดการแสดงรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // State สำหรับควบคุม Popup แจ้งเตือนสวยๆ
  const [modal, setModal] = useState({ show: false, title: '', message: '', isSuccess: true });

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    // เช็ครหัสผ่านตรงกันไหมตอนสมัครสมาชิก
    if (isSignUp && password !== confirmPassword) {
      setModal({
        show: true,
        title: 'รหัสผ่านไม่ตรงกัน',
        message: 'กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน',
        isSuccess: false
      });
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setModal({ show: true, title: 'สมัครสมาชิกไม่สำเร็จ', message: error.message, isSuccess: false });
      } else {
        setModal({ 
          show: true, 
          title: 'สมัครสมาชิกสำเร็จ!', 
          message: 'ระบบได้ส่งอีเมลยืนยันตัวตนไปให้คุณแล้ว หรือสามารถลองเข้าสู่ระบบได้เลยครับ', 
          isSuccess: true 
        });
      }
   } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setModal({ show: true, title: 'เข้าสู่ระบบไม่สำเร็จ', message: error.message, isSuccess: false });
      } else {
        setModal({ show: true, title: 'เข้าสู่ระบบสำเร็จ!', message: 'กำลังพากลับสู่หน้าหลัก...', isSuccess: true });
        setTimeout(() => {
          window.location.href = '/explore'; // 👈 เปลี่ยนจาก '/' เป็น '/explore' ตรงนี้ครับ!
        }, 1200);
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      setModal({ show: true, title: 'Google Login Error', message: error.message, isSuccess: false });
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col justify-center items-center p-4 relative">
      
      {/* 🌟 Custom Popup Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-xl font-bold ${modal.isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
              {modal.isSuccess ? '✓' : '✕'}
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">{modal.title}</h3>
            <p className="text-xs text-slate-400 mb-6">{modal.message}</p>
            <button 
              onClick={() => setModal({ ...modal, show: false })}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            🧭 Roamify
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isSignUp ? 'สร้างบัญชีผู้ใช้ใหม่เพื่อเริ่มต้นใช้งาน' : 'เข้าสู่ระบบเพื่อจัดการทริปของคุณ'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">อีเมลของคุณ</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* ช่องรหัสผ่าน พร้อมปุ่มดูรหัสผ่าน */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">รหัสผ่าน</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 pr-10 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-xs text-slate-400 hover:text-cyan-400 transition"
              >
                {showPassword ? 'ซ่อน' : 'แสดง'}
              </button>
            </div>
          </div>

          {/* ช่องยืนยันรหัสผ่าน (แสดงเฉพาะตอนสมัครสมาชิก) */}
          {isSignUp && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 pr-10 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-xs text-slate-400 hover:text-cyan-400 transition"
                >
                  {showConfirmPassword ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-cyan-600/25 mt-2"
          >
            {loading ? 'กำลังประมวลผล...' : (isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ')}
          </button>
        </form>

        

        <div className="text-center mt-6 text-xs text-slate-400">
          {isSignUp ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชีใช่ไหม?'} {' '}
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-400 font-semibold hover:underline"
          >
            {isSignUp ? 'เข้าสู่ระบบที่นี่' : 'สมัครสมาชิก'}
          </button>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition">
            ← กลับสู่หน้าแรก
          </Link>
        </div>

      </div>
    </div>
  );
}