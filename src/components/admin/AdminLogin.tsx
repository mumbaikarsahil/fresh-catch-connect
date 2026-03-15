// src/components/admin/AdminLogin.tsx
import React from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  loginError: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  email, setEmail, password, setPassword, handleLogin, loginError
}) => {
  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full h-11 pl-4 bg-gray-50 border-none rounded-xl text-sm mt-1" 
              placeholder="admin@fishymart.com" 
              required 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full h-11 pl-4 bg-gray-50 border-none rounded-xl text-sm mt-1" 
              placeholder="••••••••" 
              required 
            />
          </div>
          {loginError && <p className="text-red-500 text-xs font-medium text-center">{loginError}</p>}
          <button type="submit" className="w-full bg-[#1c1c1c] text-white font-bold h-11 rounded-xl shadow-lg mt-6 hover:bg-black transition-colors">
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};