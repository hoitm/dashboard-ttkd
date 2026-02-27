import React, { useState, useRef, useContext,useEffect  } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LogIn, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, verifyOtp } from '../services/authApi';

const LoginWithOTP = () => {
  const [isOnebss, setIsOnebss] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('login');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
   //const { login } = useContext(AuthContext);
   const { token, login } = useContext(AuthContext);
   const navigate = useNavigate();
   const [isLoadingLogin, setIsLoadingLogin] = useState(false);

   const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);



   useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token]);

  if (token) return null; // chờ useEffect điều hướng
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }
    setIsLoadingLogin(true); // 🔄 bắt đầu loading
    try {
      const data = await apiLogin(username, password, !isOnebss);

      if (data?.secretCode) {
        localStorage.setItem('secretCode', data.secretCode);
        setStep('otp');
      } else {
        toast.error('Đăng nhập thất bại');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi gọi API đăng nhập');
    } finally {
      setIsLoadingLogin(false); // ✅ tắt loading sau khi xong
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    const secretCode = localStorage.getItem('secretCode');

    if (otpCode.length !== 6 || !secretCode) {
      toast.error('Vui lòng nhập đúng mã OTP');
      return;
    }
    setIsVerifyingOtp(true); // Bắt đầu loading

    try {
      const data = await verifyOtp(username, otpCode, secretCode);

      const { token, accessTokenOne, expires } = data;

      if (token) {
        login({ token, accessTokenOne, expires });
        toast.success('Đăng nhập thành công!');
      } else {
        toast.error('Xác thực OTP thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xác minh OTP');
    }finally {
      setIsVerifyingOtp(false); // Dừng loading
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    } else {
      toast.error('Vui lòng dán đúng 6 số OTP');
    }
  };
  const handleOtpChange_old = (index, value) => {
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const digits = value.split('');
      setOtp(digits);
      inputRefs.current[5]?.blur(); // thoát focus input
      setTimeout(() => handleOtpSubmit(new Event('submit')), 200); // auto submit
      return;
    }
  
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
  
      // Auto focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
  
      // ✅ Nếu vừa nhập xong input cuối cùng
      if (index === 5 && value && newOtp.every(d => d.length === 1)) {
        inputRefs.current[5]?.blur();
        setTimeout(() => handleOtpSubmit(new Event('submit')), 200);
      }
    }
  };
  
  const handleOtpChange = (index, value) => {
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const digits = value.split('');
      setOtp(digits);
      inputRefs.current[5]?.blur();
      const otpString = digits.join('');
      setTimeout(() => handleOtpSubmitFromOutside(otpString), 200);
      return;
    }
  
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
  
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
  
      // ✅ Tự động submit nếu nhập đến input cuối và đủ 6 số
      if (index === 5 && value && newOtp.every(d => d.length === 1)) {
        inputRefs.current[5]?.blur();
        const otpString = newOtp.join('');
        setTimeout(() => handleOtpSubmitFromOutside(otpString), 200);
      }
    }
  };
  
  const handleOtpSubmitFromOutside = async (otpCode) => {
    const secretCode = localStorage.getItem('secretCode');
  
    if (otpCode.length !== 6 || !secretCode) {
      toast.error('Vui lòng nhập đúng mã OTP');
      return;
    }
  
    setIsVerifyingOtp(true);
  
    try {
      const response = await axios.post('https://ttkd.vnptphuyen.vn:4488/api/Authentication/verify-otp', {
        username,
        otp: otpCode,
        secretCode
      });
  
      const { token, accessTokenOne, expires } = response.data;
  
      if (token && expires) {
        login({ token, accessTokenOne, expires });
        toast.success('Đăng nhập thành công!');
      } else {
        toast.error('Xác thực OTP thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xác minh OTP');
    } finally {
      setIsVerifyingOtp(false);
    }
  };
  


  const handleOtpChangeolf = (index, value) => {
    // Nếu người dùng dán cả chuỗi 6 số vào một input
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const digits = value.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      return;
    }
    // Nếu chỉ nhập 1 số như bình thường
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
        {step === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="text-center mb-4">
              <img src="/Logo.png" alt="Logo" className="h-12 mx-auto mb-4" />
            </div>
            <div className="flex items-center justify-center mb-6 bg-gray-50 rounded-xl p-2">
              <span className={`px-4 py-2 rounded-lg ${!isOnebss ? 'bg-white font-semibold shadow text-blue-600' : 'text-gray-600'}`}>Tập đoàn</span>
              <label className="mx-4 cursor-pointer">
                <input type="checkbox" className="sr-only" checked={isOnebss} onChange={() => setIsOnebss(!isOnebss)} />
                <div className="w-14 h-7 bg-gray-300 rounded-full shadow-inner relative">
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-1 left-1 transition-transform ${isOnebss ? 'translate-x-7 bg-blue-600' : ''}`}></div>
                </div>
              </label>
              <span className={`px-4 py-2 rounded-lg ${isOnebss ? 'bg-white font-semibold shadow text-blue-600' : 'text-gray-600'}`}>OneBSS</span>
            </div>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Tên đăng nhập" className="w-full px-4 py-3 rounded-xl border border-gray-300" />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu" className="w-full px-4 py-3 rounded-xl border border-gray-300" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <button
                  type="submit"
                  disabled={isLoadingLogin}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold hover:opacity-90 bg-gradient-to-r from-blue-500 to-indigo-500 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoadingLogin ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  ) : (
                    <LogIn size={20} />
                  )}
                  {isLoadingLogin ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Xác nhận OTP</h1>
              <p className="text-gray-600">Vui lòng nhập 6 số</p>
            </div>
            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                 key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                autoComplete="one-time-code"
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-10 h-12 text-center text-xl border-2 border-gray-300 rounded-lg"
                maxLength={6} // cho phép dán vào input đầu tiên
                />
              ))}
            </div>
            <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold hover:opacity-90 bg-gradient-to-r from-green-500 to-emerald-500 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isVerifyingOtp ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : (
                  <ShieldCheck size={20} />
                )}
                {isVerifyingOtp ? 'Đang xác minh...' : 'Xác minh'}
              </button>

            <div className="text-center">
              <button type="button" onClick={() => setOtp(['', '', '', '', '', ''])} className="text-blue-600 hover:underline">Xoá các trường</button>
            </div>
          </form>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default LoginWithOTP;
