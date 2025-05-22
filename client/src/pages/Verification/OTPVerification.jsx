import { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [timer, setTimer] = useState(120); // 2-minute countdown
  const [timerActive, setTimerActive] = useState(false);
  
  // Use a ref instead of state to track if we've sent the initial OTP
  // This prevents duplicate sends due to re-renders
  const initialOtpRequestedRef = useRef(false);
  const emailSendingInProgressRef = useRef(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP, requestOTP, currentUser } = useContext(AuthContext);

  useEffect(() => {
    // Only run this effect once
    if (initialOtpRequestedRef.current) return;
    
    // Get email from location state (passed when redirecting)
    let email = '';
    let shouldSendInitialOtp = false;
    
    if (location.state?.email) {
      email = location.state.email;
      // If we're coming from signup, we've already requested an OTP
      shouldSendInitialOtp = !location.state.fromSignup;
    } else if (currentUser?.email) {
      email = currentUser.email;
      shouldSendInitialOtp = true;
    } else {
      // If no email is found, redirect to login
      toast.error('Không có thông tin email để xác thực');
      navigate('/login');
      return;
    }
    
    setUserEmail(email);
    
    // Start the timer
    setTimerActive(true);
    
    // Send initial OTP request if needed and not already sent
    // And not currently sending
    if (shouldSendInitialOtp && !initialOtpRequestedRef.current && !emailSendingInProgressRef.current) {
      console.log('Sending initial OTP to:', email);
      sendInitialOtp(email);
      initialOtpRequestedRef.current = true;
    }
  }, []);  // Empty dependency array to run only once

  // Function to send the initial OTP
  const sendInitialOtp = async (email) => {
    if (emailSendingInProgressRef.current) {
      console.log('Email sending already in progress, skipping duplicate request');
      return;
    }
    
    try {
      emailSendingInProgressRef.current = true;
      setLoading(true);
      
      console.log('Requesting initial OTP for:', email);
      const result = await requestOTP(email);
      
      if (result.success) {
        toast.info('Mã xác thực đã được gửi đến email của bạn');
      } else {
        toast.error(result.message || 'Không thể gửi mã xác thực');
        // Reset the flag so we can try again
        initialOtpRequestedRef.current = false;
      }
    } catch (error) {
      console.error('Initial OTP request error:', error);
      toast.error('Đã xảy ra lỗi khi gửi mã xác thực');
      // Reset the flag so we can try again
      initialOtpRequestedRef.current = false;
    } finally {
      setLoading(false);
      emailSendingInProgressRef.current = false;
    }
  };

  // Timer countdown logic
  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle input change for OTP fields with auto-advance
  const handleInputChange = (index, value) => {
    if (value.length > 1) {
      // If pasting multiple digits, take only the first one
      value = value.slice(0, 1);
    }
    
    if (!/^\d*$/.test(value)) {
      // Only allow digits
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input field
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  // Handle key down for backspace navigation
  const handleKeyDown = (index, e) => {
    // If backspace and current field is empty, focus previous field
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  // Handle OTP verification
  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ mã xác thực 6 chữ số');
      return;
    }

    try {
      setLoading(true);
      const result = await verifyOTP(userEmail, otpCode);
      
      if (result.success) {
        toast.success('Xác thực email thành công!');
        // If we were redirected from somewhere else, go back there
        if (location.state?.from) {
          navigate(location.state.from);
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.message || 'Mã xác thực không đúng hoặc đã hết hạn');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Đã xảy ra lỗi khi xác thực');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (emailSendingInProgressRef.current) {
      toast.info('Đang gửi mã xác thực, vui lòng đợi...');
      return;
    }
    
    try {
      emailSendingInProgressRef.current = true;
      setLoading(true);
      
      console.log('Resending OTP to:', userEmail);
      const result = await resendOTP(userEmail);
      
      if (result.success) {
        toast.success('Đã gửi lại mã xác thực mới đến email của bạn');
        setTimer(120); // Reset timer to 2 minutes
        setTimerActive(true);
      } else {
        toast.error(result.message || 'Không thể gửi lại mã xác thực');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.message || 'Đã xảy ra lỗi khi gửi lại mã xác thực');
    } finally {
      setLoading(false);
      emailSendingInProgressRef.current = false;
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Xác thực tài khoản</h2>
              
              <div className="text-center mb-4">
                <p>Chúng tôi đã gửi mã xác thực đến email:</p>
                <p className="fw-bold">{userEmail}</p>
                <p className="small text-muted">
                  Vui lòng kiểm tra hộp thư đến (và thư mục spam) để lấy mã xác thực
                </p>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Nhập mã xác thực 6 chữ số</label>
                <div className="d-flex justify-content-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      className="form-control text-center fw-bold"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      style={{ fontSize: '1.2rem' }}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>
              
              <button
                className="btn btn-primary w-100 py-2 mb-3"
                onClick={handleVerify}
                disabled={loading || otp.join('').length !== 6}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang xác thực...
                  </>
                ) : (
                  'Xác thực'
                )}
              </button>
              
              <div className="text-center mt-4">
                <p className="mb-2">
                  Không nhận được mã?{' '}
                  {timerActive ? (
                    <span>Gửi lại sau {formatTime(timer)}</span>
                  ) : (
                    <button 
                      className="btn btn-link p-0 text-decoration-none" 
                      onClick={handleResendOTP}
                      disabled={loading || timerActive}
                    >
                      Gửi lại mã
                    </button>
                  )}
                </p>
                <p className="small text-muted">
                  Mã xác thực có hiệu lực trong 10 phút
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
