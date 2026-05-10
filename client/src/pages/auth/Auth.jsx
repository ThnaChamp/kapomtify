import React, { useState } from 'react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                // พยายามอ่าน Error Message จาก Backend
                const errorData = await response.json();
                alert(errorData.message || "Login Failed");
                return;
            }

            const data = await response.json();
            
            // ✅ 1. เก็บ Token
            localStorage.setItem('token', data.token);

            // ✅ 2. เก็บ Role (สำหรับเช็คสิทธิ์ซ่อน/แสดงปุ่มที่หน้าบ้าน)
            if (data.user && data.user.role) {
                localStorage.setItem('userRole', data.user.role);
            }

            // ✅ 3. บังคับ Refresh ไปที่หน้าแรกเพื่อให้ App.jsx โหลดค่าใหม่
            window.location.href = "/"; 
            
        } catch (error) {
            console.error("Login Error:", error);
            alert("Cannot connect to server");
        }
    }; // ปิด handleLogin ตรงนี้ (เดิมคุณมีปีกกาเกิน)

    return (
        <div className="flex h-screen bg-[#121212] text-white font-sans">
            <div className="m-auto w-full max-w-md p-8">
                <h2 className="text-3xl font-bold mb-10 text-left">Login</h2>
                
                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm font-black uppercase tracking-widest">Username</label>
                        <input 
                            type="text"
                            placeholder="USERNAME"
                            className="w-full bg-[#1e1e1e] border-none rounded-3xl py-4 px-6 focus:ring-2 focus:ring-[#1DB954] outline-none transition-all"
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                            required
                        />
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-gray-400 text-sm font-black uppercase tracking-widest">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="PASSWORD"
                                className="w-full bg-[#1e1e1e] border-none rounded-3xl py-4 px-6 focus:ring-2 focus:ring-[#1DB954] outline-none transition-all"
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-center">
                        <button 
                            type="submit"
                            className="bg-[#d9d9d9] text-black font-black text-xl px-16 py-3 rounded-full hover:scale-105 transition-all active:scale-95"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;