'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader, ShieldAlert } from 'lucide-react';

import api from '../../lib/api';

function VerifyEmailComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Use the manualLogin function from the updated AuthContext
  const { manualLogin } = useAuth(); 

  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Đang xác thực email của bạn...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Không tìm thấy token xác thực. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
      return;
    }

    const verifyToken = async () => {
      try {
        // The backend verifies the token and returns accessToken + user
        const { data } = await api.get(`/auth/verifyemail?token=${token}`);
        
        setStatus('success');
        setMessage('Xác thực thành công! Bạn đã đăng nhập và sẽ được chuyển hướng ngay...');
        
        // Use the manualLogin function to set the auth state
        manualLogin(data);

        setTimeout(() => {
          // Redirect to the main admin page
          router.push('/admin/questions');
        }, 3000);

      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage(err.response?.data?.error || 'Xác thực thất bại. Token có thể không hợp lệ hoặc đã hết hạn.');
      }
    };

    verifyToken();
  }, [searchParams, router, manualLogin]);

  const StatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="h-16 w-16 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <ShieldAlert className="h-16 w-16 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <StatusIcon />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          {status === 'loading' && 'Đang xác thực'}
          {status === 'success' && 'Thành công!'}
          {status === 'error' && 'Xác thực thất bại'}
        </h1>
        <p className="text-slate-600">
          {message}
        </p>
        {status === 'error' && (
          <Link href="/register" className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Thử đăng ký lại
          </Link>
        )}
      </div>
    </div>
  );
}

// We wrap the component in Suspense because useSearchParams() requires it.
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader className="h-16 w-16 animate-spin text-blue-500" /></div>}>
            <VerifyEmailComponent />
        </Suspense>
    );
}
