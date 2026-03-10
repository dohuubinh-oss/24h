import axios from 'axios';

// --- BẮT ĐẦU THAY ĐỔI ---

// Giải thích:
// Vấn đề "Invalid URL" xảy ra vì code chạy trên Server (Server Component) không biết
// địa chỉ đầy đủ của API backend khi chỉ dùng đường dẫn tương đối (ví dụ: /exams/123).
// Để giải quyết, chúng ta cần cung cấp một URL khác nhau tùy thuộc vào môi trường:
// 1. Phía Server: Dùng URL tuyệt đối, trỏ thẳng đến backend Express (http://127.0.0.1:5000/api/v1).
// 2. Phía Client (Trình duyệt): Dùng URL tương đối (/api/v1) để Next.js bắt và chuyển tiếp (proxy)
//    yêu cầu đến backend, tránh lỗi CORS và ẩn địa chỉ backend khỏi người dùng.

// Xác định xem code có đang chạy trên môi trường server hay không.
const isServer = typeof window === 'undefined';

// Thiết lập baseURL động dựa trên môi trường.
// Dựa trên mô tả của bạn, API backend có dạng: http://127.0.0.1:5000/api/v1
const baseURL = isServer
  ? 'http://127.0.0.1:5000/api/v1' // Dùng cho Server Components (gọi trực tiếp)
  : '/api/v1';                     // Dùng cho Client Components (thông qua proxy)

const api = axios.create({
  // Thay thế việc dùng biến môi trường bằng logic xác định động ở trên.
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// --- KẾT THÚC THAY ĐỔI ---


let requestInterceptorId = null;
let responseInterceptorId = null;

export const setupInterceptors = (auth) => {
  // Clear existing interceptors to avoid duplicates
  if (requestInterceptorId !== null) {
    api.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== null) {
    api.interceptors.response.eject(responseInterceptorId);
  }

  // Request interceptor to add the token to headers
  requestInterceptorId = api.interceptors.request.use(
    (config) => {
      const token = auth.getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token refresh
  responseInterceptorId = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 && 
        !originalRequest._retry &&
        !originalRequest.headers['X-Skip-Interceptor-Refresh']
      ) {
        originalRequest._retry = true; 

        try {
          console.log('Access token expired. Interceptor attempting to refresh...');
          // Lưu ý: Lệnh gọi refresh-token cũng sẽ tự động dùng baseURL đã cấu hình
          const { data } = await api.post('/auth/refresh-token');
          
          const newAccessToken = data.accessToken;
          const user = data.user;

          console.log('Interceptor: Token refreshed successfully.');
          auth.setAuthState({ accessToken: newAccessToken, user });

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);

        } catch (refreshError) {
          console.error('Interceptor: Unable to refresh token. Logging out.', refreshError);
          await auth.logout(); 
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// --- Lesson API Calls ---
// GIẢI THÍCH SỬA LỖI:
// Tất cả các hàm bên dưới đã được cập nhật để trả về `response.data.data`
// thay vì `response.data`. Điều này là do API backend trả về dữ liệu được gói trong
// một thuộc tính "data". Việc thay đổi này đảm bảo các component của chúng ta
// nhận được đúng dữ liệu (mảng hoặc đối tượng) mà chúng cần để hoạt động.

export const getAllLessons = async () => {
  const response = await api.get('/lessons');
  return response.data.data; // Sửa lỗi: Trích xuất mảng từ thuộc tính data
};

export const getLessonById = async (id) => {
  const response = await api.get(`/lessons/${id}`);
  return response.data.data; // Sửa lỗi: Trích xuất đối tượng từ thuộc tính data
};

export const createLesson = async (lessonData) => {
  const response = await api.post('/lessons', lessonData);
  return response.data.data; // Sửa lỗi: Nhất quán trong việc trả về dữ liệu
};

export const updateLesson = async (id, lessonData) => {
  const response = await api.put(`/lessons/${id}`, lessonData);
  return response.data.data; // Sửa lỗi: Nhất quán trong việc trả về dữ liệu
};

export const deleteLesson = async (id) => {
  const response = await api.delete(`/lessons/${id}`);
  return response.data.data; // Sửa lỗi: Nhất quán trong việc trả về dữ liệu
};


export default api;
