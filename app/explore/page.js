'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [category, setCategory] = useState('all');
  const [userLocation, setUserLocation] = useState(null); // เก็บพิกัด GPS ปัจจุบันของผู้ใช้
  const [tripInfo, setTripInfo] = useState({ distance: null, fuelCost: null });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      window.L = L;
      const container = L.DomUtil.get('map');
      if (container != null && container._leaflet_id != null) {
        container._leaflet_id = null;
      }

      const mapInstance = L.map('map').setView([13.7563, 100.5018], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);
      
      window.myMap = mapInstance;
      window.markerInstance = null;
      window.userMarkerInstance = null;

      mapInstance.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (confirm(`ใช้พิกัดนี้ (${lat.toFixed(4)}, ${lng.toFixed(4)}) เพื่อเพิ่มสถานที่ท่องเที่ยวใหม่?`)) {
          window.location.href = `/add-destination?lat=${lat}&lng=${lng}`;
        }
      });
    });

    async function fetchDestinations() {
      const { data } = await supabase.from('destinations').select('*');
      if (data) setDestinations(data);
    }
    fetchDestinations();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // คำนวณระยะทางระหว่างจุด 2 จุด (Haversine Formula) เป็นกิโลเมตร
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // รัศมีโลกหน่วยเป็นกิโลเมตร
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 📍 ฟังก์ชันดึงตำแหน่งปัจจุบันแยกออกมาให้กดได้อิสระ
  const fetchUserLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });

        if (window.myMap && window.L) {
          window.myMap.setView([lat, lng], 13);
          if (window.userMarkerInstance) window.myMap.removeLayer(window.userMarkerInstance);
          window.userMarkerInstance = window.L.marker([lat, lng])
            .addTo(window.myMap)
            .bindPopup("<b>📍 ตำแหน่งปัจจุบันของคุณอยู่ที่นี่</b>")
            .openPopup();
        }
        alert("📍 ดึงพิกัดตำแหน่งปัจจุบันของคุณสำเร็จแล้ว!");
      },
      () => {
        alert("ไม่สามารถดึงพิกัดได้: กรุณาอนุญาตการเข้าถึงตำแหน่งในเบราว์เซอร์");
      },
      { timeout: 5000 }
    );
  };

  // 🎲 ฟังก์ชันสุ่มทริป (ถ้ามี userLocation อยู่แล้ว จะเอามาคำนวณระยะทางและค่าน้ำมันให้อัตโนมัติทันที)
  const executeRandom = () => {
    let filtered = destinations;
    if (category !== 'all') {
      filtered = destinations.filter(item => item.category === category);
    }

    if (filtered.length === 0) {
      alert("ยังไม่มีสถานที่ในหมวดหมู่นี้");
      return;
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    const destination = filtered[randomIndex];
    setSelectedDest(destination);

    // ถ้าผู้ใช้เคยกดแชร์พิกัด GPS ไว้แล้ว นำมาคำนวณระยะทางและค่าน้ำมัน
    if (userLocation) {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, Number(destination.lat), Number(destination.lng));
      const totalDist = dist * 2; // ไป-กลับ
      const fuelNeeded = totalDist / 14; // อัตราสิ้นเปลือง 14 กม./ลิตร
      const estimatedCost = fuelNeeded * 38; // ราคาน้ำมัน 38 บาท/ลิตร
      setTripInfo({
        distance: dist.toFixed(1),
        fuelCost: estimatedCost.toFixed(0)
      });
    } else {
      setTripInfo({ distance: null, fuelCost: null });
    }

    if (window.myMap && window.L) {
      window.myMap.setView([Number(destination.lat), Number(destination.lng)], 12);
      if (window.markerInstance) window.myMap.removeLayer(window.markerInstance);
      window.markerInstance = window.L.marker([Number(destination.lat), Number(destination.lng)])
        .addTo(window.myMap)
        .bindPopup(`<b>${destination.name}</b><br>${destination.desc || destination.description || ''}`)
        .openPopup();
    }
  };

  const saveTripToProfile = async () => {
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนบันทึกทริป!");
      return;
    }

    const { error } = await supabase.from('saved_trips').insert([
      { user_email: currentUser.email, destination_id: selectedDest.id }
    ]);

    if (error) {
      alert('บันทึกไม่สำเร็จ (อาจเคยบันทึกไปแล้ว): ' + error.message);
    } else {
      alert(`⭐ บันทึกทริป "${selectedDest.name}" ลงในโปรไฟล์เรียบร้อยแล้ว!`);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          🧭 Roamify : Weekend Getaway
        </h1>
        
        <div className="text-sm flex items-center gap-2 flex-wrap">
          <span className={currentUser ? "text-emerald-400 font-semibold" : "text-yellow-400"}>
            {currentUser ? `👋 ${currentUser.email.split('@')[0]}` : "👤 Guest"}
          </span>

          {currentUser && (
            <>
              <Link href="/add-destination" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                ➕ เพิ่มสถานที่
              </Link>
              <Link href="/manage" className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                ⚙️ จัดการ
              </Link>
              <Link href="/profile" className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                👤 โปรไฟล์
              </Link>
            </>
          )}

          {!currentUser ? (
            <Link href="/login" className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-white">
              เข้าสู่ระบบ
            </Link>
          ) : (
            <button onClick={handleLogout} className="bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-white">
              ออกจากระบบ
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 max-w-7xl mx-auto w-full">
        <section className="w-full md:w-1/3 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-cyan-300">🎯 ตั้งค่าการสุ่มทริป</h2>
            
            {/* 📍 ปุ่มดึงพิกัดตำแหน่งเรียลไทม์แยกต่างหาก */}
            <button 
              onClick={fetchUserLocation}
              className={`w-full mb-4 py-2.5 px-3 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-2 ${userLocation ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700'}`}
            >
              {userLocation ? '✅ บันทึกตำแหน่ง GPS ของคุณแล้ว' : '📍 เปิดใช้งานตำแหน่งปัจจุบัน (Real-time GPS)'}
            </button>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">สไตล์ที่ชอบ:</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
              >
                <option value="all">🌐 ทั้งหมด ({destinations.length} แห่งในระบบ)</option>
                <option value="nature">🌲 ธรรมชาติ / ภูเขา / น้ำตก</option>
                <option value="cafe">☕ คาเฟ่ชิลๆ / ถ่ายรูป</option>
                <option value="temple">🏛️ สายบุญ / ไหว้พระ</option>
              </select>
            </div>

            {selectedDest && (
              <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl mt-4 space-y-3">
                <h3 className="font-bold text-cyan-400 text-base">{selectedDest.name}</h3>
                <p className="text-xs text-slate-300">{selectedDest.desc || selectedDest.description}</p>
                
                {/* 🗺️ กรอบแผนที่ Google Maps แบบฝัง */}
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-700 mt-2">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedDest.name)}&output=embed`}
                  ></iframe>
                </div>

                {tripInfo.distance ? (
                  <div className="bg-slate-900/80 border border-slate-700/60 p-2.5 rounded-lg text-xs space-y-1 mt-2">
                    <div className="flex justify-between text-slate-300">
                      <span>📏 ระยะทางเที่ยวเดียว (จาก GPS):</span>
                      <span className="font-bold text-cyan-400">{tripInfo.distance} กม.</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>⛽ ประเมินค่าน้ำมัน (ไป-กลับ):</span>
                      <span className="font-bold text-emerald-400">~{tripInfo.fuelCost} บาท</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                    💡 คำแนะนำ: กดปุ่ม "เปิดใช้งานตำแหน่งปัจจุบัน" ด้านบนก่อนสุ่ม เพื่อคำนวณระยะทางและค่าน้ำมันจากตำแหน่งของคุณจริง
                  </p>
                )}

                {/* ปุ่มเปิด Google Maps นำทางภายนอก */}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedDest.name)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 py-2 rounded-xl text-xs font-semibold transition"
                >
                  🗺️ เปิดแผนที่นำทาง (Google Maps)
                </a>

                {currentUser && (
                  <button onClick={saveTripToProfile} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20">
                    ⭐ บันทึกทริปนี้ลงโปรไฟล์
                  </button>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={executeRandom} 
            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition transform active:scale-95 text-sm"
          >
            🎲 สุ่มทริปวันหยุดนี้!
          </button>
        </section>

        <section className="w-full md:w-2/3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl h-[450px] md:h-auto relative flex flex-col">
          <div className="absolute top-6 left-6 z-[400] bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 pointer-events-none shadow-lg">
            💡 ทริป: คลิกที่ตำแหน่งใดก็ได้บนแผนที่เพื่อเพิ่มพิกัดสถานที่ใหม่
          </div>
          <div id="map" className="h-full w-full rounded-2xl"></div>
        </section>
      </main>
    </div>
  );
}