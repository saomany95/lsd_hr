'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '../../firebase/context';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { user, login, loginWithPhoneAndPassword } = useFirebase();
  const router = useRouter();

  // Email/Password State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone Number State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phonePassword, setPhonePassword] = useState('');

  // General State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('email'); // 'email' or 'phone'

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard'); // Redirect to dashboard when logged in
    }
  }, [user, router]);

  // Setup reCAPTCHA for phone auth
  // useEffect(() => {
  //   if (activeTab === 'phone' && !recaptchaVerifier && phoneStep === 1) {
  //     try {
  //       const verifier = setupRecaptcha('recaptcha-container');
  //       setRecaptchaVerifier(verifier);
  //     } catch (err) {
  //       console.error("Recaptcha setup error: ", err);
  //       setError('เกิดข้อผิดพลาดในการตั้งค่า reCAPTCHA');
  //     }
  //   }
  // }, [activeTab, recaptchaVerifier, setupRecaptcha, phoneStep]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // แสดง toast กำลังล็อกอิน
    const toastId = toast.loading('ກຳລັງເຂົ້າສູ່ລະບົບ...');
    
    try {
      await login(email, password);
      toast.success('ເຂົ້າສູ່ລະບົບສຳເລັດ', { id: toastId });
      router.push('/dashboard'); // Redirect to dashboard on successful login
    } catch (err) {
      const errorMsg = err.message || 'ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ';
      setError(errorMsg);
      toast.error(errorMsg, { id: toastId });
      console.error("Email login error: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting phone login with:', { phoneNumber, phonePassword });
      
      // ตรวจสอบว่ามีการกรอกเบอร์โทรและรหัสผ่านหรือไม่
      if (!phoneNumber || !phonePassword) {
        const errorMsg = 'ກະລຸນາກວດສອບເບີໂທລະສັບ ແລະ ລະຫັດຜ່ານ';
        setError(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // แสดง toast กำลังล็อกอิน
      const toastId = toast.loading('ກຳລັງເຂົ້າສູ່ລະບົບ...');
      
      // จัดรูปแบบเบอร์โทรศัพท์ให้ถูกต้อง (เพิ่มรหัสประเทศลาว +856)
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : 
                                  phoneNumber.startsWith('0') ? `+856${phoneNumber.substring(1)}` : 
                                  `+856${phoneNumber}`;
      
      console.log('Formatted phone number:', formattedPhoneNumber);
      
      // โหมดทดสอบพิเศษ: หากใช้รหัสผ่าน "testmode" จะเข้าสู่ระบบโดยไม่ตรวจสอบรหัสผ่าน
      if (phonePassword === 'testmode') {
        console.log('Test mode activated - bypassing normal authentication');
        try {
          // ดึงข้อมูลผู้ใช้ทั้งหมดจาก collection "user"
          const { getAllUsers } = useFirebase();
          const users = await getAllUsers();
          
          if (users && users.length > 0) {
            // ใช้ผู้ใช้แรกที่พบในโหมดทดสอบ
            console.log('Using first user for test mode:', users[0]);
            toast.success('ເຂົ້າສູ່ລະບົບສຳເລັດ (ໂຫມດທົດສອບ)', { id: toastId });
            router.push('/dashboard');
            return;
          } else {
            const errMsg = 'ບໍ່ພົບຜູ້ໃຊ້ໃນລະບົບສຳລັບການທົດສອບ';
            toast.error(errMsg, { id: toastId });
            throw new Error(errMsg);
          }
        } catch (testModeError) {
          console.error('Test mode error:', testModeError);
          const errMsg = 'ເກີດຂໍ້ຜິດພາດໃນໂຫມດທົດສອບ: ' + testModeError.message;
          toast.error(errMsg, { id: toastId });
          throw new Error(errMsg);
        }
      }
      
      // เรียกใช้ฟังก์ชัน loginWithPhoneAndPassword จาก Firebase context
      await loginWithPhoneAndPassword(formattedPhoneNumber, phonePassword);
      
      // เมื่อเข้าสู่ระบบสำเร็จ
      toast.success('ເຂົ້າສູ່ລະບົບສຳເລັດ', { id: toastId });
      
      // นำทางไปยังหน้า Dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error("Phone login error:", err);
      setError(err.message || 'ເບີໂທລະສັບ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
      toast.error(err.message || 'ເບີໂທລະສັບ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ເຂົ້າສູ່ລະບົບ</CardTitle>
          <CardDescription>Lao standard HR Management</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>ເກີດຂໍ້ຜິດພາດ</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">ອີເມວ</TabsTrigger>
              <TabsTrigger value="phone">ເບີໂທລະສັບ</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">ອີເມວ</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="m@example.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">ລະຫັດຜ່ານ</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'ກຳລັງໂຫຼດ...' : 'ເຂົ້າສູ່ລະບົບ'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="phone">
              <form onSubmit={handlePhoneLogin}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">ເບີໂທລະສັບ</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      required 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">ຕົວຢ່າງ: 02052144798</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phonePassword">ລະຫັດຜ່ານ</Label>
                    <Input 
                      id="phonePassword" 
                      type="password" 
                      required 
                      value={phonePassword}
                      onChange={(e) => setPhonePassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>ຖ້າພົບປັນຫາ, ກາລຸນາແຈ້ງຜູ້ດູແລລະບົບ</p>
        </CardFooter>
      </Card>
    </div>
  );
}
