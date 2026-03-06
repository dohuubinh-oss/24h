'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sigma, MailCheck } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/ui/FormInput';
import PasswordInput from '../../components/ui/PasswordInput';
import SubmitButton from '../../components/ui/SubmitButton';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use the manualLogin function from the updated AuthContext
  const { manualLogin } = useAuth(); 
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Standard registration just creates an account, it doesn't log in.
      await api.post('/auth/register', { name, email, password });
      setSuccess(true);

    } catch (err) {
      console.error('An error occurred:', err);
      setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (codeResponse) => {
    setLoading(true);
    setError('');
    try {
      // The backend will verify the code and return an accessToken and user object
      const { data } = await api.post('/auth/google', { code: codeResponse.code });

      // Use the manualLogin function to set the auth state
      manualLogin(data);
      
      // Redirect to the main admin page
      router.push('/admin/questions');

    } catch (err) {
      console.error('Google login error:', err);
      setError(err.response?.data?.error || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: handleGoogleLoginSuccess,
    onError: (errorResponse) => {
      console.error('Google login hook error:', errorResponse);
      setError('Không thể khởi tạo đăng nhập Google.');
    },
  });

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      {/* Left Side */}
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
          <h1 className="mb-4 text-4xl font-bold text-white">Bắt đầu hành trình của bạn</h1>
          <p className="max-w-md text-lg text-white/80">
            Tham gia cộng đồng, học hỏi mỗi ngày và trở thành một thiên tài toán học.
          </p>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-md">
           <div className="mb-12 flex flex-col items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2463eb] shadow-lg shadow-[#2463eb]/20">
              <Sigma className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">MathGenius</span>
          </div>

          {success ? (
            <div className="text-center">
                <MailCheck className="mx-auto h-16 w-16 text-green-500 mb-4"/>
              <h2 className="text-3xl font-bold text-slate-900">Kiểm tra email của bạn</h2>
              <p className="mt-3 text-slate-500">
                Chúng tôi đã gửi một liên kết xác thực đến <span className="font-semibold text-slate-700">{email}</span>. Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để hoàn tất đăng ký.
              </p>
                <p className="mt-8 text-center text-slate-500">
                    <Link href="/login" className="font-bold text-[#2463eb] hover:underline">
                    Quay lại trang Đăng nhập
                    </Link>
                </p>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-slate-900">Tạo tài khoản mới</h2>
                <p className="mt-3 text-slate-500">Điền thông tin của bạn để bắt đầu học ngay hôm nay.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                    {error}
                  </div>
                )}
                <FormInput 
                  id="name"
                  label="Họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
                <FormInput 
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                />
                <PasswordInput 
                  id="password"
                  label="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <PasswordInput 
                  id="password2"
                  label="Xác nhận mật khẩu"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <SubmitButton 
                  loading={loading}
                  text="Đăng ký"
                  loadingText="Đang tạo tài khoản..."
                />
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-slate-500">Hoặc</span></div>
              </div>

              <div className="flex justify-center">
                 <button 
                  onClick={() => googleLogin()}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-3.5 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100"
                 >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">Tiếp tục với Google</span>
                </button>
              </div>

              <p className="mt-10 text-center text-slate-500">
                Bạn đã có tài khoản? 
                <Link href="/login" className="ml-1 font-bold text-[#2463eb] hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
