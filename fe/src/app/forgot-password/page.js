'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Sigma } from 'lucide-react';

import api from '../../lib/api'; // <--- IMPORT API (AXIOS WRAPPER)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Use the api wrapper for the POST request
      await api.post('/auth/forgotpassword', { email });
      setMessage('Một email đã được gửi đến bạn với hướng dẫn đặt lại mật khẩu.');

    } catch (err) {
      console.error('An error occurred:', err);
      // Adapt error handling for Axios
      setError(err.response?.data?.error || 'Yêu cầu thất bại. Vui lòng thử lại.');
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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGIQTcprY83xAjv0z4XyZWm9LJsRcfLVtoF31sieWB0_ENDZiYijROoNPnpz5vGkSwGaxxSASyktNOQ9uWHx6AuAatltAM5ElgGJ7-0LktQACInwqZXqIsL6UA0kmhl6dVMBbG3-j13Bm1DpE1DhLV32lX7bJ_SC3bmQ6l48iR3K1otYEDIGIJ9Uz2dCd2_-esIfj4RdzQ1Yq77y0XojJl-V_eGQPk05tHFZrT5wdn2QkFqcfIFxH358OxYKw4KdzOFB9530JdQCLh"
              alt="Math Education Illustration"
              width={550}
              height={367}
              className="h-auto w-80 rounded-3xl shadow-2xl"
              priority
            />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">Khôi phục tài khoản của bạn</h1>
          <p className="max-w-md text-lg text-white/80">
            Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập ngay lập tức.
          </p>
        </div>
      </div>

      {/* Right Side: Forgot Password Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-md">
           <div className="mb-12 flex flex-col items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2463eb] shadow-lg shadow-[#2463eb]/20">
              <Sigma className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">MathGenius</span>
          </div>

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Quên mật khẩu?</h2>
            <p className="mt-3 text-slate-500">Nhập email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.</p>
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
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">
                Email
              </label>
               <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#2463eb]"
                  />
              </div>
            </div>

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2463eb] py-4 text-lg font-bold text-white shadow-lg shadow-[#2463eb]/25 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
            </button>
          </form>

           <p className="mt-10 text-center text-slate-500">
            Nhớ ra mật khẩu của bạn? 
            <Link href="/login" className="ml-1 font-bold text-[#2463eb] hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
