'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '../firebase/context'; // Ensure this path is correct
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Camera, MapPin, LogIn, CheckCircle, XCircle, ArrowRight, LogOut as LogOutIcon, Clock, User, Calendar } from 'lucide-react';

export default function HomePage() {
  const { user, loginWithPhone, logout, loginWithPhoneAndPassword, getUserByPhone, resetPasswordByPhone } = useFirebase();
  const router = useRouter();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loginStep, setLoginStep] = useState(1); // 1: normal login, 2: OTP verification for password reset
  const [loading, setLoading] = useState(false); // General loading for login/confirm
  const [error, setError] = useState(''); // For login modal errors

  // Check-in process state
  const [checkInState, setCheckInState] = useState('idle'); // idle, locating, capturing_photo, confirming, success, error
  const [gpsLocation, setGpsLocation] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [checkInError, setCheckInError] = useState(''); // For check-in process errors
  
  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Real-time clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  const handleMainActionButtonClick = () => {
    if (!user) {
      setError(''); 
      setPhoneNumber('');
      setPassword('');
      setOtp('');
      setForgotPassword(false);
      setLoginStep(1);
      setShowLoginModal(true);
    } else {
      startClockInProcess();
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // เชื่อมต่อกับ Firebase Authentication ผ่านฟังก์ชันใหม่
      await loginWithPhoneAndPassword(`+856${phoneNumber}`, password);
      setShowLoginModal(false);
      setCheckInState('logged_in');
      
      // นำผู้ใช้ไปยังหน้าลงเวลา (clock) เมื่อ login สำเร็จ
      router.push('/clock');
      
      // สำหรับตัวอย่างนี้ เราจะจำลองการเข้าสู่ระบบสำเร็จ
      // if (phoneNumber.includes('123') && password === '1234') {
      //   setShowLoginModal(false);
      //   setCheckInState('logged_in');
      // } else {
      //   setError('ເບີໂທລະສັບຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
      // }
    } catch (err) {
      setError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ');
      console.error("Login error: ", err);
    }
    
    setLoading(false);
  };

  const handleForgotPassword = () => {
    setForgotPassword(true);
    setError('');
  };
  
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Format phone number with Laos country code
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }
      if (formattedPhone.startsWith('20')) {
        formattedPhone = '+856' + formattedPhone;
      } else {
        formattedPhone = '+856' + formattedPhone;
      }
    }

    try {
      // ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
      const user = await getUserByPhone(formattedPhone.replace('+856', ''));
      if (!user) {
        setError('ບໍ່ພົບບັນຊີທີ່ລົງທະບຽນດ້ວຍເບີໂທລະສັບນີ້');
        setLoading(false);
        return;
      }
      
      // สำหรับตัวอย่างนี้ เราจะจำลองการตรวจสอบผู้ใช้
      // if (!phoneNumber.includes('123')) {
      //   setError('ບໍ່ພົບບັນຊີທີ່ລົງທະບຽນດ້ວຍເບີໂທລະສັບນີ້');
      //   setLoading(false);
      //   return;
      // }
      
      // ส่ง OTP สำหรับการรีเซ็ตรหัสผ่าน
      const result = await loginWithPhone(formattedPhone);
      setConfirmationResult(result);
      setLoginStep(2);
    } catch (err) {
      setError(err.message || 'ບໍ່ສາມາດສົ່ງ OTP ໄດ້. ກະລຸນາລອງໃຫມ່ອີກຄັ້ງ.');
      console.error("Send OTP error: ", err);
    }
    setLoading(false);
  };

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetPasswordStep, setResetPasswordStep] = useState(1); // 1: verify OTP, 2: set new password
  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!confirmationResult) {
      setError('ກະລຸນາຮ້ອງຂໍ OTP ກ່ອນ.');
      setLoading(false);
      return;
    }
    try {
      await confirmationResult.confirm(otp);
      
      // หลังจากยืนยัน OTP สำเร็จ
      if (forgotPassword) {
        // เปลี่ยนไปยังขั้นตอนการตั้งรหัสผ่านใหม่
        setResetPasswordStep(2);
      } else {
        // เข้าสู่ระบบสำเร็จ
        setShowLoginModal(false);
        setCheckInState('logged_in');
      }
    } catch (err) {
      setError(err.message || 'OTP ບໍ່ຖືກຕ້ອງ.');
      console.error("Verify OTP error: ", err);
    }
    setLoading(false);
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // ตรวจสอบว่ารหัสผ่านใหม่ตรงกัน
    if (newPassword !== confirmNewPassword) {
      setError('ລະຫັດຜ່ານໃຫມ່ບໍ່ຕຣງກັນ ກະລຸນາລອງໃຫມ່');
      setLoading(false);
      return;
    }
    
    try {
      // ใช้ฟังก์ชัน resetPasswordByPhone จาก Firebase context
      await resetPasswordByPhone(`+856${phoneNumber}`, newPassword);
      
      // สำหรับตัวอย่างนี้ เราจะจำลองการรีเซ็ตรหัสผ่านสำเร็จ
      // alert('รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
      
      // กลับไปที่หน้าเข้าสู่ระบบปกติ
      setForgotPassword(false);
      setResetPasswordStep(1);
      setLoginStep(1);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກລະຫັດຜ່ານໃຫມ່');
      console.error("Reset password error: ", err);
    }
    
    setLoading(false);
  };

  const startClockInProcess = () => {
    setCheckInState('locating');
    setCheckInError('');
    setGpsLocation(null);
    setPhotoDataUrl(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setCheckInState('capturing_photo'); 
          startCameraStream();
        },
        (geoErr) => {
          console.error("GPS Error: ", geoErr);
          setCheckInError(`GPS Error: ${geoErr.message}. ກະລຸນາກວດສອບການອະນຸຍາດ.`);
          setCheckInState('error');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setCheckInError('GPS ບໍ່ຮອງຮັບໃນເບົາເຊີນີ້.');
      setCheckInState('error');
    }
  };

  const startCameraStream = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (camErr) {
        console.error("Camera access error:", camErr);
        setCheckInError('ບໍ່ສາມາດເປີດກ້ອງໄດ້: ' + camErr.message + '. ກະລຸນາກວດສອບການອະນຸຍາດ.');
        setCheckInState('error'); 
      }
    } else {
      setCheckInError('ຄຸນສົມບັດກ້ອງບໍ່ຮອງຮັບໃນເບົາເຊີນີ້.');
      setCheckInState('error');
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhotoDataUrl(dataUrl);
      setCheckInState('confirming'); 

      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
    } else {
      setCheckInError('ບໍ່ສາມາດຖ່າຍຮູບໄດ້. ລອງໃຫມ່ອີກຄັ້ງ.');
      setCheckInState('error');
    }
  };

  const handleConfirmClockIn = async () => {
    if (!gpsLocation || !photoDataUrl) {
      setCheckInError("ຂໍ້ມູນ GPS ຫຼື ຮູບພາບບໍ່ຄົບຖ້ວນ.");
      setCheckInState('error');
      return;
    }
    setLoading(true); 
    setCheckInError('');
    console.log("Clock-in data:", {
      userId: user?.uid,
      gps: gpsLocation,
      photoHash: "placeholder_for_photo_hash_or_url", 
      timestamp: new Date().toISOString()
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setCheckInState('success');
    } catch (err) {
      console.error("Error saving clock-in:", err);
      setCheckInError("ບັນທຶກຂໍ້ມູນລົງເວລາບໍ່ສຳເລັດ: " + err.message);
      setCheckInState('error');
    }
    setLoading(false);
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard'); 
  };

  const resetClockInProcess = () => {
    setCheckInState('idle');
    setGpsLocation(null);
    setPhotoDataUrl(null);
    setCheckInError('');
    if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
  };
  
  const handleLogout = async () => {
    await logout();
    resetClockInProcess(); 
  };

  const renderLoginModal = () => (
    <Dialog open={showLoginModal} onOpenChange={(isOpen) => {
      setShowLoginModal(isOpen);
      if (!isOpen) {
        setError(''); 
      }
    }}>
      <DialogContent className="sm:max-w-md bg-white text-slate-800 border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">ເຂົ້າສູ່ລະບົບເພື່ອລົງເວລາ</DialogTitle>
          <DialogDescription className="text-center text-slate-600">
            ກະລຸນາໃຊ້ເບີໂທລະສັບແລະລະຫັດຜ່ານທີ່ລົງທະບຽນເພື່ອດຳເນີນການ.
          </DialogDescription>
        </DialogHeader>
        {loginStep === 1 && !forgotPassword && (
          <form onSubmit={handleLogin} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone-modal" className="text-slate-700">ເບີໂທລະສັບ</Label>
              <Input
                id="phone-modal"
                type="tel"
                placeholder="ຕົວຢ່າງ: 2051234567"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                className="bg-slate-100 border-slate-200 focus:ring-blue-400"
              />
              <p className="text-xs text-slate-500">ລະຫັດປະເທດ (+856) ຈະຖືກນຳໃຊ້. ໃສ່ເບີ 8 ໂຕເລກຫຼັງຈາກ 20.</p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password-modal" className="text-slate-700">ລະຫັດຜ່ານ</Label>
              <Input
                id="password-modal"
                type="password"
                placeholder="ລະຫັດຜ່ານ"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-slate-100 border-slate-200 focus:ring-blue-400"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-100 border-red-200 text-red-700 text-xs">
                <XCircle className="h-4 w-4 mr-1" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ'}
            </Button>
            <Button type="button" variant="link" onClick={handleForgotPassword} className="mt-2 w-full text-slate-600 hover:text-slate-800" disabled={loading}>
              ລືມລະຫັດຜ່ານ?
            </Button>
          </form>
        )}
        {loginStep === 1 && forgotPassword && (
          <form onSubmit={handleSendOtp} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone-modal" className="text-slate-700">ເບີໂທລະສັບ</Label>
              <Input
                id="phone-modal"
                type="tel"
                placeholder="ຕົວຢ່າງ: 2051234567"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                className="bg-slate-100 border-slate-200 focus:ring-blue-400"
              />
              <p className="text-xs text-slate-500">ລະຫັດປະເທດ (+856) ຈະຖືກນຳໃຊ້. ໃສ່ເບີ 8 ໂຕເລກຫຼັງຈາກ 20.</p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-100 border-red-200 text-red-700 text-xs">
                <XCircle className="h-4 w-4 mr-1" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" id="sign-in-button" className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'ກຳລັງສົ່ງ OTP...' : 'ສົ່ງ OTP ເພື່ອຣີເຊັດລະຫັດຜ່ານ'}
            </Button>
            <Button type="button" variant="link" onClick={() => setForgotPassword(false)} className="mt-2 w-full text-slate-600 hover:text-slate-800" disabled={loading}>
              ກັບໄປຫນ້າເຂົ້າສູ່ລະບົບ
            </Button>
          </form>
        )}
        
        {loginStep === 2 && resetPasswordStep === 1 && (
          <form onSubmit={handleVerifyOtp} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="otp-modal" className="text-slate-700">ລະຫັດ OTP</Label>
              <Input
                id="otp-modal"
                type="text"
                placeholder="123456"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                className="bg-slate-100 border-slate-200 focus:ring-blue-400"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="bg-red-100 border-red-200 text-red-700 text-xs">
                 <XCircle className="h-4 w-4 mr-1" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'ກຳລັງກວດສອບ...' : 'ຢືນຢັນ OTP'}
            </Button>
            <Button variant="link" onClick={() => { setLoginStep(1); setError(''); setOtp(''); }} className="mt-2 w-full text-slate-600 hover:text-slate-800" disabled={loading}>
              ກັບໄປແກ້ໄຂເບີໂທລະສັບ
            </Button>
          </form>
        )}
        
        {loginStep === 2 && resetPasswordStep === 2 && (
          <form onSubmit={handleResetPassword} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password" className="text-slate-700">ລະຫັດຜ່ານໃຫມ່</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="ລະຫັດຜ່ານໃຫມ່"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="bg-slate-100 border-slate-200 focus:ring-blue-400"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="text-slate-700">ຢືນຢັນລະຫັດຜ່ານໃຫມ່</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="ຢືນຢັນລະຫັດຜ່ານໃຫມ່"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={loading}
                className="bg-slate-100 border-slate-200 focus:ring-blue-400"
              />
            </div>
            
            {error && (
              <Alert variant="destructive" className="bg-red-100 border-red-200 text-red-700 text-xs">
                <XCircle className="h-4 w-4 mr-1" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກລະຫັດຜ່ານໃຫມ່'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );

  const renderClockInProcess = () => {
    switch (checkInState) {
      case 'logged_in':
        return (
          <Card className="w-full max-w-md bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-center text-slate-800">เข้าสู่ระบบสำเร็จ</CardTitle>
              <CardDescription className="text-center">กรุณาเลือกดำเนินการต่อ</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button 
                onClick={startClockInProcess}
                className="w-full h-16 text-xl bg-blue-500 hover:bg-blue-600 text-white"
              >
                <LogIn className="mr-3 h-6 w-6" /> 
                เริ่มลงเวลาเข้างาน
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full h-16 text-xl border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <ArrowRight className="mr-3 h-6 w-6 text-green-600" /> 
                ไปที่หน้า Dashboard
              </Button>
            </CardContent>
          </Card>
        );
      case 'locating':
        return (
          <Card className="w-full max-w-md mx-auto bg-white border-slate-200 text-slate-800 shadow-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <MapPin className="h-6 w-6 text-blue-600" />
                ກຳລັງກວດສອບຕຳແຫນ່ງ GPS
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-slate-600 text-center">ກະລຸນາລໍຖ້າ... ລະບົບກຳລັງກວດສອບຕຳແຫນ່ງຂອງທ່ານ</p>
            </CardContent>
          </Card>
        );

      case 'capturing_photo':
        return (
          <Card className="w-full max-w-md mx-auto bg-white border-slate-200 text-slate-800 shadow-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <Camera className="h-6 w-6 text-green-600" />
                ຖ່າຍຮູບເພື່ອຢືນຢັນຕົວຕົນ
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative w-64 h-48 bg-slate-700 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <Button 
                onClick={handleCapturePhoto}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <Camera className="mr-2 h-4 w-4" />
                ຖ່າຍຮູບ
              </Button>
              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>
        );

      case 'confirming':
        return (
          <Card className="w-full max-w-md mx-auto bg-white border-slate-200 text-slate-800 shadow-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">ຢືນຢັນການລົງເວລາ</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {photoDataUrl && (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500">
                  <img 
                    src={photoDataUrl} 
                    alt="Captured photo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-center space-y-2">
                <p className="text-green-600 font-semibold">✓ GPS: ຢືນຢັນຕຳແຫນ່ງແລ້ວ</p>
                <p className="text-green-600 font-semibold">✓ ຮູບພາບ: ຖ່າຍຮູບແລ້ວ</p>
                <p className="text-slate-600 text-sm">
                  ເວລາ: {new Date().toLocaleString('lo-LA')}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={resetClockInProcess}
                  className="flex-1 border-slate-600 text-slate-700 hover:bg-slate-700"
                >
                  ຖ່າຍໃຫມ່
                </Button>
                <Button 
                  onClick={handleConfirmClockIn}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'ກຳລັງບັນທຶກ...' : 'ຢືນຢັນລົງເວລາ'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'success':
        return (
          <Card className="w-full max-w-md mx-auto bg-white border-slate-200 text-slate-800 shadow-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-green-600 flex items-center justify-center gap-2">
                <CheckCircle className="h-8 w-8" />
                ລົງເວລາສຳເລັດ!
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">ຍິນດີຕ້ອນຮັບເຂົ້າສູ່ວຽກ!</p>
                <p className="text-slate-600">
                  ເວລາລົງເວລາ: {new Date().toLocaleString('lo-LA')}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={resetClockInProcess}
                  className="flex-1 border-slate-600 text-slate-700 hover:bg-slate-700"
                >
                  ລົງເວລາໃຫມ່
                </Button>
                <Button 
                  onClick={handleGoToDashboard}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  ເຂົ້າສູ່ Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card className="w-full max-w-md mx-auto bg-white border-slate-200 text-slate-800 shadow-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-red-600 flex items-center justify-center gap-2">
                <XCircle className="h-8 w-8" />
                ເກີດຂໍ້ຜິດພາດ
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Alert variant="destructive" className="bg-red-100 border-red-200 text-red-700">
                <AlertDescription>{checkInError}</AlertDescription>
              </Alert>
              <Button 
                onClick={resetClockInProcess}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                ລອງໃຫມ່ອີກຄັ້ງ
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Button
            onClick={handleMainActionButtonClick}
            className="w-full h-24 text-2xl bg-blue-500 hover:bg-blue-600 text-white shadow-xl transform hover:scale-105 transition-transform duration-150 ease-in-out rounded-lg"
          >
            <LogIn className="mr-3 h-8 w-8" /> 
            {user ? 'ກົດເພື່ອເລີ່ມລົງເວລາ' : 'ເຂົ້າສູ່ລະບົບ'}
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-800">
                <User className="h-5 w-5 text-green-600" />
                <span className="text-sm">{user.phoneNumber}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                <LogOutIcon className="h-4 w-4 mr-1" />
                ອອກຈາກລະບົບ
              </Button>
            </div>
          )}
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Lao Standard Management System
          </h2>
          <p className="text-xl text-slate-600">
            ກະລຸນາລົງເວລາເຂົ້າວຽກກ່ອນເລີ່ມການເຮັດວຽກ
          </p>
        </div>

        {/* Current Time Display */}
        <Card className="w-full max-w-md mx-auto mb-8 bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardContent className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-slate-600">ວັນທີ່ປັດຈຸບັນ</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {currentTime.toLocaleDateString('lo-LA')}
              </p>
              <p className="text-xl text-blue-600 font-mono">
                {currentTime.toLocaleTimeString('lo-LA')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Clock In Process Area */}
        <div className="flex flex-col items-center justify-center gap-4">
          {renderClockInProcess()}
          
          {/* เพิ่มปุ่มเข้าสู่ระบบโดยไม่ลงเวลา */}
          {checkInState === 'idle' && (
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full max-w-md h-12 text-lg border-slate-300 text-slate-700 hover:bg-slate-100 mt-4"
            >
              <User className="mr-3 h-5 w-5 text-blue-600" /> 
              ເຂົ້າສູ່ລະບົບໂດຍບໍ່ລົງເວລາ
            </Button>
          )}
        </div>

        {/* Features Info */}
        {checkInState === 'idle' && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  ຕຳແຫນ່ງ GPS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  ລະບົບຈະກວດສອບຕຳແຫນ່ງຂອງທ່ານເພື່ອຢືນຢັນວ່າທ່ານຢູ່ໃນສະຖານທີ່ເຮັດວຽກ
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Camera className="h-5 w-5 text-green-600" />
                  ຖ່າຍຮູບຢືນຢັນ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  ຖ່າຍຮູບເພື່ອຢືນຢັນຕົວຕົນແລະບັນທຶກການລົງເວລາຂອງທ່ານ
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  ບັນທຶກອັດຕະໂນມັດ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  ຂໍ້ມູນການລົງເວລາຈະຖືກບັນທຶກອັດຕະໂນມັດໃນລະບົບ
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {renderLoginModal()}

      {/* Footer */}
      <footer className="mt-16 bg-white/90 border-t border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-slate-600">
            © 2025 - {new Date().getFullYear()} | ພັດທະນາໂດຍ The Pixel Dev
          </p>
        </div>
      </footer>
    </div>
  );
}