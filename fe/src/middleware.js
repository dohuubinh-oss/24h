import { NextResponse } from 'next/server';

// Định nghĩa các route cần bảo vệ (chỉ user đã đăng nhập mới vào được)
const protectedRoutes = [
  '/admin',
  '/create-exam',
  '/create-questions',
];

// Định nghĩa các route xác thực (user đã đăng nhập thì không nên vào)
// Cập nhật để bao gồm cả các trang quên/đặt lại mật khẩu
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request) {
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;

  // --- LOGIC 1: Bảo vệ các trang yêu cầu đăng nhập ---
  const isAccessingProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isAccessingProtectedRoute && !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set("from", pathname); // Lưu lại trang họ muốn vào để redirect lại sau khi login
    return NextResponse.redirect(loginUrl);
  }

  // --- LOGIC 2: Xử lý các trang xác thực cho người dùng đã đăng nhập ---
  // Cập nhật để kiểm tra bằng startsWith, xử lý được /reset-password/[token]
  const isAccessingAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isAccessingAuthRoute && refreshToken) {
    return NextResponse.redirect(new URL('/admin/questions', request.url));
  }

  return NextResponse.next();
}

// Cấu hình matcher để middleware chỉ chạy trên các route cần thiết
// Cập nhật để bao gồm cả các trang quên/đặt lại mật khẩu
export const config = {
  matcher: [
    /*
     * Áp dụng middleware cho các đường dẫn sau:
     */
    '/admin/:path*',
    '/create-exam',
    '/create-questions',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password/:path*', // Thêm dòng này
  ],
};
