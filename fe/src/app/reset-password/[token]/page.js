'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Sigma } from 'lucide-react';

import api from '../../../lib/api'; // <--- IMPORT API (AXIOS WRAPPER)

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Use the api wrapper for the PUT request
      await api.put(`/auth/resetpassword/${token}`, { password });

      setMessage('Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập ngay bây giờ.');
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      console.error('An error occurred:', err);
      // Adapt error handling for Axios
      setError(err.response?.data?.error || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      {/* Left Side: Branding & Illustration */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-[#2463eb] p-12 lg:flex xl:p-24">
         <div className="absolute top-[-10%] left-[-10%] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-5%] h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-20 left-20 text-6xl font-bold text-white/20 select-none">∑</div>
        <div className="absolute bottom-20 right-40 text-6xl font-bold text-white/20 select-none">π</div>
        <div className="absolute top-1/2 right-10 text-5xl font-bold text-white/20 select-none">√</div>

        <div className="relative z-10 flex flex-col items-center text-center">
           <div className="mb-12">
            <Image
              src="/layout/auth-illustration.png"
              alt="Math Education Illustration"
              width={550}
              height={367}
              className="h-auto w-80 rounded-3xl shadow-2xl"
              priority
            />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">Tạo mật khẩu mới</h1>
          <p className="max-w-md text-lg text-white/80">
           Chọn một mật khẩu mạnh và an toàn để bảo vệ tài khoản của bạn.
          </p>
        </div>
      </div>

      {/* Right Side: Reset Password Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-md">
           <div className="mb-12 flex flex-col items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2463eb] shadow-lg shadow-[#2463eb]/20">
              <Sigma className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">MathGenius</span>
          </div>

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Đặt lại mật khẩu</h2>
            <p className="mt-3 text-slate-500">Nhập mật khẩu mới của bạn vào bên dưới.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
                {message}
              </div>
            )}
             <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#2463eb]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
             <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password2">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword2 ? 'text' : 'password'}
                  id="password2"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#2463eb]"
                />
                <button type="button" onClick={() => setShowPassword2(!showPassword2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || message} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2463eb] py-4 text-lg font-bold text-white shadow-lg shadow-[#2463eb]/25 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
