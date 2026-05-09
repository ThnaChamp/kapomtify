import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        // ตรวจสอบว่า Server ตอบกลับมาสำเร็จไหม (ไม่ใช่ 404 หรือ 500)
        if (!response.ok) {
            const errorText = await response.text(); // อ่านเป็น Text ก่อนเผื่อเป็น HTML Error
            console.error("Server Error:", errorText);
            alert("Login Failed: Path not found or Server Error");
            return;
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = "/"; // ใช้ตัวนี้เพื่อบีบให้ App.jsx เช็ค isAuthenticated ใหม่
    } catch (error) {
        console.error("Login Error:", error);
    }
};

    return (
        <div className="flex h-screen bg-[#121212] text-white font-sans">
            {/* กึ่งกลางหน้าจอ */}
            <div className="m-auto w-full max-w-md p-8">
                <h2 className="text-3xl font-bold mb-10 text-left">Login</h2>
                
                <form onSubmit={handleLogin} className="space-y-8">
                    {/* Username Field */}
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm font-black uppercase tracking-widest">Username</label>
                        <input 
                            type="text"
                            placeholder="USERNAME"
                            className="w-full bg-[#1e1e1e] border-none rounded-3xl py-4 px-6 focus:ring-2 focus:ring-[#1DB954] outline-none transition-all"
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2 relative">
                        <label className="text-gray-400 text-sm font-black uppercase tracking-widest">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="PASSWORD"
                                className="w-full bg-[#1e1e1e] border-none rounded-3xl py-4 px-6 focus:ring-2 focus:ring-[#1DB954] outline-none transition-all"
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        <div className="flex justify-between items-center mt-2 px-2">
                            <button type="button" className="text-[10px] text-gray-500 uppercase font-bold hover:text-white transition-colors">Forgot Password</button>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Remember Me</span>
                                <input type="checkbox" className="accent-[#1DB954]" />
                            </div>
                        </div>
                    </div>

                    {/* Sign In Button */}
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