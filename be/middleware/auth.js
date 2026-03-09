import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/User.js';
import ExamSubmission from '../models/ExamSubmission.js';
import ErrorResponse from '../utils/errorResponse.js';

// Middleware: Xác thực người dùng bằng JWT Token
// Middleware này phải được chạy trước bất kỳ middleware nào cần thông tin người dùng (req.user)
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Không có quyền truy cập, yêu cầu token.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new ErrorResponse('Không tìm thấy người dùng.', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Token không hợp lệ hoặc đã hết hạn.', 401));
  }
});


// Middleware: Phân quyền dựa trên vai trò (role)
// Ví dụ sử dụng: authorize('admin', 'teacher')
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Middleware này phải chạy SAU middleware `protect`, vì nó cần `req.user`
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorResponse(
        `Vai trò người dùng (${req.user.role}) không được phép truy cập tài nguyên này.`,
        403 // 403 Forbidden - Bị cấm (đã xác thực nhưng không có quyền)
      ));
    }
    next();
  };
};


// Middleware: Kiểm tra quyền sở hữu "chính chủ" trên một bài nộp (Submission)
// Cho phép chủ sở hữu hoặc admin được truy cập.
export const checkSubmissionOwnership = asyncHandler(async (req, res, next) => {
    const submission = await ExamSubmission.findById(req.params.id);

    if (!submission) {
        return next(new ErrorResponse(`Không tìm thấy bài làm với ID ${req.params.id}`, 404));
    }

    // Kiểm tra: Người dùng có phải là admin KHÔNG? Hoặc người dùng có phải là chủ bài nộp KHÔNG?
    if (req.user.role === 'admin' || submission.user.toString() === req.user.id) {
        // Nếu 1 trong 2 điều kiện đúng, cho phép đi tiếp
        next();
    } else {
        // Nếu không, từ chối truy cập
        return next(new ErrorResponse('Bạn không có quyền truy cập vào tài nguyên này', 403));
    }
});
