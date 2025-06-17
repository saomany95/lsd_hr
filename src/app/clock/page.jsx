"use client";

import { useState, useEffect, useRef } from "react";
import { useFirebase } from "@/firebase/context";
import { useRouter } from "next/navigation";
import { collection, getDocs } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  Wifi,
  Smartphone,
  Calendar,
  Timer,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  QrCode
} from "lucide-react";
import {
  isWithinGeofence,
  getCurrentPosition,
  getAddressFromPosition,
  checkLocationCompliance,
} from "@/utils/geofencing";
import { QRCodeSVG as QRCode } from 'qrcode.react';

// ฟังก์ชันสำหรับดึง Device ID
const getDeviceId = () => {
  // ในระบบจริงควรใช้ library เช่น fingerprintjs2 หรือวิธีอื่นที่เหมาะสม
  // ตัวอย่างนี้ใช้วิธีอย่างง่ายเพื่อสาธิต
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const colorDepth = window.screen.colorDepth;

  // สร้าง fingerprint อย่างง่าย
  const fingerprint = `${userAgent}-${platform}-${screenWidth}x${screenHeight}-${colorDepth}`;
  return fingerprint;
};

// เครือข่าย WiFi ที่อนุญาตให้ลงเวลาได้ (ตัวอย่าง)
const ALLOWED_NETWORKS = [
  {
    name: "สำนักงานใหญ่",
    ssid: "OFFICE_WIFI",
    bssid: null // ไม่ระบุ BSSID เพื่อให้ตรวจสอบเฉพาะ SSID
  },
  {
    name: "สาขา 1",
    ssid: "BRANCH1_WIFI",
    bssid: null // ไม่ระบุ BSSID เพื่อให้ตรวจสอบเฉพาะ SSID
  },
  {
    name: "สาขา 2",
    ssid: "STAFF_WIFI",
    bssid: null // ไม่ระบุ BSSID เพื่อให้ตรวจสอบเฉพาะ SSID
  },
  {
    name: "เครือข่ายทั่วไป",
    ssid: "GUEST_WIFI",
    bssid: null // ไม่ระบุ BSSID เพื่อให้ตรวจสอบเฉพาะ SSID
  }
  // สามารถเพิ่มเครือข่ายอื่นๆ ได้ตามต้องการ
];

// ตัวเลือกสำหรับการตรวจสอบตำแหน่ง
const LOCATION_CHECK_OPTIONS = {
  useIP: true,      // ใช้ IP Address เพื่อระบุตำแหน่ง
  useWiFi: true,    // ใช้ข้อมูล WiFi เพื่อระบุตำแหน่ง
  allowedNetworks: ALLOWED_NETWORKS
};

export default function ClockPage() {
  const {
    user,
    clockIn,
    clockOut,
    getTodayAttendance,
    loading: authLoading,
    db
  } = useFirebase();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [formattedDate, setFormattedDate] = useState("");
  const [formattedTime, setFormattedTime] = useState("");
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [clockInProgress, setClockInProgress] = useState(false);
  const [clockOutProgress, setClockOutProgress] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [selfieImage, setSelfieImage] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [allowedLocations, setAllowedLocations] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ตรวจสอบการเข้าสู่ระบบ
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;

    if (!user) {
      router.push("/login");
    }
  }, [user, router, authLoading]);

  // โหลดข้อมูลตำแหน่งที่อนุญาตจาก Firestore
  useEffect(() => {
    const loadLocations = async () => {
      try {
        if (db) {
          const locationsRef = collection(db, "locations");
          const locationsSnapshot = await getDocs(locationsRef);
          const locationsList = locationsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            latitude: parseFloat(doc.data().latitude),
            longitude: parseFloat(doc.data().longitude),
            radius: parseInt(doc.data().radius),
            isDefault: doc.data().isDefault
          }));
          
          setAllowedLocations(locationsList);
          console.log("Loaded locations from Firestore:", locationsList);
        }
      } catch (err) {
        console.error("Error loading locations:", err);
        // ถ้าไม่สามารถโหลดข้อมูลได้ ให้ใช้ข้อมูลจำลองไปก่อน
        setAllowedLocations([
          {
            name: "สำนักงานใหญ่",
            latitude: 17.966667, // ละติจูดของเวียงจันทน์ (ตัวอย่าง)
            longitude: 102.6, // ลองจิจูดของเวียงจันทน์ (ตัวอย่าง)
            radius: 500, // รัศมีในหน่วยเมตร
          }
        ]);
      }
    };
    
    if (!authLoading && user) {
      loadLocations();
    }
  }, [db, authLoading, user]);

  // อัปเดตเวลาปัจจุบันทุกวินาที และจัดรูปแบบวันที่/เวลา
  useEffect(() => {
    // ตั้งค่าเวลาเริ่มต้น
    setCurrentTime(new Date());

    // อัปเดตทุกวินาที
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // จัดรูปแบบวันที่และเวลาเฉพาะฝั่ง client
      try {
        setFormattedDate(
          now.toLocaleDateString("th-TH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        );
        setFormattedTime(now.toLocaleTimeString("th-TH"));
      } catch (e) {
        // Fallback ถ้าไม่รองรับ locale th-TH
        setFormattedDate(
          now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        );
        setFormattedTime(now.toLocaleTimeString("en-US"));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ตรวจสอบสถานะการอนุญาตตำแหน่ง
  const checkLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationPermissionDenied(true);
      return;
    }

    // ทดสอบขอตำแหน่งเพื่อตรวจสอบการอนุญาต
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'denied') {
        setLocationPermissionDenied(true);
      } else if (result.state === 'granted') {
        setLocationPermissionDenied(false);
      }
      
      // ติดตามการเปลี่ยนแปลงสถานะการอนุญาต
      result.addEventListener('change', () => {
        if (result.state === 'denied') {
          setLocationPermissionDenied(true);
        } else if (result.state === 'granted') {
          setLocationPermissionDenied(false);
          checkLocation(); // ลองตรวจสอบตำแหน่งอีกครั้งเมื่อได้รับอนุญาต
        }
      });
    }).catch(() => {
      // ในกรณีที่ไม่สามารถตรวจสอบการอนุญาตได้ ให้ลองขอตำแหน่งโดยตรง
      checkLocation();
    });
  };

  // เรียกใช้ตรวจสอบสถานะการอนุญาตตำแหน่งเมื่อโหลดหน้า
  useEffect(() => {
    if (typeof window !== 'undefined' && !authLoading && user) {
      checkLocationPermission();
    }
  }, [authLoading, user]);

  // ดึงข้อมูลการลงเวลาวันนี้และตั้งค่า Device ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const attendance = await getTodayAttendance(user.id);
          setTodayAttendance(attendance);

          // ตั้งค่า Device ID
          const id = getDeviceId();
          setDeviceId(id);

          // ตรวจสอบตำแหน่ง (ย้ายไปอยู่ใน checkLocationPermission แล้ว)
          // await checkLocation();
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, getTodayAttendance]);

  // ฟังก์ชันตรวจสอบตำแหน่ง
  const checkLocation = async () => {
    try {
      setIsCheckingLocation(true);
      setLocationPermissionDenied(false); // รีเซ็ตสถานะการปฏิเสธ
      
      // ตรวจสอบว่ามีการกำหนด allowedLocations หรือไม่
      if (!allowedLocations || allowedLocations.length === 0) {
        setLocationStatus({
          isCompliant: false,
          error: 'ไม่มีการกำหนดพื้นที่ที่อนุญาต',
          address: 'ไม่สามารถตรวจสอบตำแหน่งได้',
          currentPosition: null
        });
        return;
      }
      
      // ใช้ตัวเลือกใหม่ในการตรวจสอบตำแหน่ง
      const result = await checkLocationCompliance(allowedLocations, LOCATION_CHECK_OPTIONS);
      
      // เพิ่มข้อมูลเกี่ยวกับวิธีการระบุตำแหน่ง
      let locationMethod = 'GPS';
      if (result.networkInfo && result.isCompliantByNetwork) {
        locationMethod = `WiFi (${result.networkInfo.ssid})`;
      } else if (result.currentPosition && result.currentPosition.source === 'ip') {
        locationMethod = 'IP Address';
      }
      
      // ถ้าตำแหน่งอยู่ในพื้นที่ที่อนุญาต
      if (result.isCompliant) {
        // ค้นหาชื่อสถานที่ที่ตรงกับตำแหน่งปัจจุบัน
        const matchedLocation = allowedLocations.find(loc => 
          isWithinGeofence(
            result.currentPosition.coords.latitude,
            result.currentPosition.coords.longitude,
            loc.latitude,
            loc.longitude,
            loc.radius
          )
        );
        
        const locationName = matchedLocation ? matchedLocation.name : 'ພື້ນທີ່ອະນຸຍາດ';
        
        setLocationStatus({
          isCompliant: true,
          address: result.address || 'ບໍ່ສາມາດລະບຸຕຳແຫນ່ງໄດ້',
          currentPosition: result.currentPosition,
          locationName,
          locationMethod
        });
      } else {
        // ถ้าตำแหน่งไม่อยู่ในพื้นที่ที่อนุญาต
        setLocationStatus({
          isCompliant: false,
          error: result.error || 'ທ່ານບໍ່ໄດ້ຢູ່ໃນພື້ນທີ່ທີ່ອະນຸຍາດ',
          address: result.address || 'ບໍ່ສາມາດລະບຸຕຳແຫນ່ງໄດ້',
          currentPosition: result.currentPosition,
          locationMethod
        });
      }
    } catch (error) {
      console.error("Error checking location:", error);
      
      // ตรวจสอบว่าเป็นข้อผิดพลาดเกี่ยวกับการปฏิเสธการอนุญาตหรือไม่
      if (error.code === 1 || error.message.includes('permission')) {
        setLocationPermissionDenied(true);
        setLocationStatus({
          isCompliant: false,
          error: 'ກາລຸນາອານຸຍາດການເຂົ້າເຖິງຕຳແຫນ່ງຂອງທ່ານ',
          address: 'ບໍ່ສາມາດລະບຸຕຳແຫນ່ງໄດ້',
          currentPosition: null
        });
      } else {
        setLocationStatus({
          isCompliant: false,
          error: error.message || 'ເກີດຂໍ້ຜິດພາດໃນການກວດສອບຕຳແຫນ່ງ',
          address: 'ບໍ່ສາມາດລະບຸຕຳແຫນ່ງໄດ້',
          currentPosition: null
        });
      }
    } finally {
      setIsCheckingLocation(false);
    }
  };

  // ฟังก์ชันลงเวลาเข้างาน
  const handleClockIn = async () => {
    try {
      setClockInProgress(true);
      setError(null);
      setSuccess(null);
      
      // ตรวจสอบตำแหน่งอีกครั้ง
      setIsCheckingLocation(true);
      await checkLocation();
      setIsCheckingLocation(false);
      
      if (!locationStatus || !locationStatus.isCompliant) {
        setError('ທ່ານບໍ່ໄດ້ຢູ່ໃນພື້ນທີ່ທີ່ອະນຸຍາດໃຫ້ລົງເວລາ');
        setClockInProgress(false);
        return;
      }
      
      // ตรวจสอบว่ามีรูปภาพหรือไม่
      if (!selfieImage && process.env.NEXT_PUBLIC_REQUIRE_SELFIE === 'true') {
        setError('ກາລຸນາຖ່າຍຮູບເພື່ອຢືນຢັນ');
        setClockInProgress(false);
        return;
      }
      
      const attendanceData = {
        userId: user.id,
        date: new Date(),
        clockInTime: new Date(),
        clockInLocation: {
          latitude: locationStatus.currentPosition.latitude,
          longitude: locationStatus.currentPosition.longitude,
          address: locationStatus.address
        },
        deviceId: deviceId,
        qrCodeValue: qrCodeValue,
        selfieImage: selfieImage,
        status: 'present' // สามารถปรับเป็น 'late' ตามเงื่อนไขเวลาได้
      };
      
      const attendanceId = await clockIn(attendanceData);
      setTodayAttendance({ id: attendanceId, ...attendanceData });
      setSuccess('ລົງເວລາເຂົ້າງານສຳເລັດ! 🎉');
      
      // รีเซ็ตรูปภาพ
      setSelfieImage(null);
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error clocking in:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການລົງເວລາເຂົ້າງານ');
    } finally {
      setClockInProgress(false);
    }
  };
  
  // ฟังก์ชันลงเวลาออกงาน
  const handleClockOut = async () => {
    try {
      setClockOutProgress(true);
      setError(null);
      setSuccess(null);
      
      // ตรวจสอบตำแหน่งอีกครั้ง
      setIsCheckingLocation(true);
      await checkLocation();
      setIsCheckingLocation(false);
      
      if (!locationStatus || !locationStatus.isCompliant) {
        setError('ທ່ານບໍ່ໄດ້ຢູ່ໃນພື້ນທີ່ທີ່ອະນຸຍາດໃຫ້ລົງເວລາ');
        setClockOutProgress(false);
        return;
      }
      
      if (!todayAttendance || !todayAttendance.id) {
        setError('ບໍ່ພົບຂໍ້ມູນການລົງເວລາເຂົ້າງານວັນນີ້');
        setClockOutProgress(false);
        return;
      }
      
      // ตรวจสอบว่ามีรูปภาพหรือไม่
      if (!selfieImage && process.env.NEXT_PUBLIC_REQUIRE_SELFIE === 'true') {
        setError('กรุณาถ่ายรูปเพื่อยืนยันตัวตน');
        setClockOutProgress(false);
        return;
      }
      
      const clockOutData = {
        clockOutTime: new Date(),
        clockOutLocation: {
          latitude: locationStatus.currentPosition.latitude,
          longitude: locationStatus.currentPosition.longitude,
          address: locationStatus.address
        },
        qrCodeValue: qrCodeValue,
        selfieImage: selfieImage,
        deviceId: deviceId
      };
      
      await clockOut(todayAttendance.id, clockOutData);
      setTodayAttendance({ ...todayAttendance, ...clockOutData });
      setSuccess('ລົງເວລາອອກງານສຳເລັດ! 👋');
      
      // รีเซ็ตรูปภาพ
      setSelfieImage(null);
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error clocking out:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການລົງເວລາອອກງານ');
    } finally {
      setClockOutProgress(false);
    }
  };

  // สร้าง QR Code ที่เปลี่ยนทุก 30 วินาที
  useEffect(() => {
    const generateQrCode = () => {
      const timestamp = Math.floor(Date.now() / 30000); // เปลี่ยนทุก 30 วินาที
      const randomValue = Math.random().toString(36).substring(2, 8);
      const userId = user?.id || 'unknown';
      const qrValue = `${userId}-${timestamp}-${randomValue}`;
      setQrCodeValue(qrValue);
    };
    
    generateQrCode(); // สร้างครั้งแรก
    const interval = setInterval(generateQrCode, 30000); // อัปเดตทุก 30 วินาที
    
    return () => clearInterval(interval);
  }, [user]);
  
  // เปิดกล้องและถ่ายรูป
  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('ไม่สามารถเข้าถึงกล้องได้');
      setShowCamera(false);
    }
  };
  
  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setSelfieImage(imageDataUrl);
      
      // ปิดกล้อง
      const stream = video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
      setShowCamera(false);
    }
  };
  
  const cancelSelfie = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
    setShowCamera(false);
  };

  // แสดงหน้าโหลดขณะกำลังดึงข้อมูลหรือตรวจสอบ auth
  if (authLoading || (loading && !todayAttendance)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // If no user after auth loading is complete, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ກັບໄປ</span>
          </Button>
          <h1 className="text-lg font-semibold text-gray-800">ລົງເວລາງານ</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Clock Card */}
        <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl text-gray-800">
                ລົງເວລາງານ
              </CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              {formattedDate || "..."}
            </CardDescription>
            {/* Large Time Display */}
            <div className="relative">
              <div className="text-4xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {formattedTime || "..."}
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-20 animate-pulse"></div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Location Permission Warning */}
            {locationPermissionDenied && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>ຕ້ອງການເຂົ້າເຖິງຕຳແຫນ່ງ</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>ທ່ານຕ້ອງອານຸຍາດໃຫ້ເຂົ້າເຖິງຕຳແໜ່ງຂອງທ່ານເພື່ອໃຊງານລະບົບລົງເວລາ</p>
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        // แนะนำวิธีเปิดการอนุญาตในเบราว์เซอร์
                        window.alert('วิธีเปิดการอนุญาตตำแหน่ง:\n1. คลิกไอคอนล็อคหรือข้อมูลไซต์ที่แถบที่อยู่\n2. คลิกการตั้งค่าไซต์\n3. เปลี่ยนการตั้งค่าตำแหน่งเป็น "อนุญาต"\n4. รีเฟรชหน้าเว็บ');
                      }}
                    >
                      ວິທີເປີດການອານຸຍາດ
                    </Button>
                    <Button 
                      className="ml-2" 
                      size="sm"
                      onClick={checkLocation}
                    >
                      ລອງໃຫມ່
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <QRCode value={qrCodeValue || 'placeholder'} width={180} height={180} level="H" />
              </div>
              <p className="text-xs text-gray-500 mt-2">QR Code ຈະປ່ຽນທຸກ 30 ວິນາທີ</p>
            </div>

            {/* Camera and Selfie */}
            {showCamera ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full rounded-t-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center p-2 bg-black/50">
                      <Button 
                        onClick={takeSelfie} 
                        className="bg-white text-black hover:bg-gray-200 mx-2"
                        size="sm"
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        ຖ່າຍຮູບ
                      </Button>
                      <Button 
                        onClick={cancelSelfie} 
                        variant="destructive" 
                        size="sm"
                        className="mx-2"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        ຍົກເລີກ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : selfieImage ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={selfieImage} 
                      alt="Selfie" 
                      className="w-full rounded-t-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center p-2 bg-black/50">
                      <Button 
                        onClick={() => setSelfieImage(null)} 
                        variant="destructive" 
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        ລົບຮູບ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button 
                onClick={startCamera} 
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                <Camera className="h-5 w-5 mr-2" />
                ຖ່າຍຮູບຢືນຢັນຕົວຕນ
              </Button>
            )}
            
            {/* Hidden canvas for capturing images */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Alerts */}
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>ຜິດພາດ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800 animate-in slide-in-from-top-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">ສຳເລັດ</AlertTitle>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}
            
            {/* Location Status */}
            {locationStatus && (
              <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-800">ຕຳແໜ່ງປັດຈຸບັນ</span>
                    </div>
                    <Badge 
                      variant={locationStatus.isCompliant ? "default" : "destructive"}
                      className={locationStatus.isCompliant ? "bg-green-100 text-green-800 border-green-200" : ""}
                    >
                      {locationStatus.isCompliant ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{locationStatus.locationName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          <span>{locationStatus.error}</span>
                        </div>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{locationStatus.address}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Wifi className="h-3 w-3" />
                    <span>ລະບຸຕຳແຫນ່ງໂດຍ: {locationStatus.locationMethod || 'GPS'}</span>
                  </div>
                  {locationStatus.nearestLocation && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Wifi className="h-3 w-3" />
                      <span>ໄກຈາກ {locationStatus.nearestLocation.name}: {Math.round(locationStatus.distanceToNearest)}ມ</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Today's Attendance Status */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-800">ສະຖານະການລົງເວລາວັນນີ້</span>
                </div>
                {todayAttendance && todayAttendance.clockInTime ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ເວລາເຂົ້າງານ:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                        {new Date(todayAttendance.clockInTime).toLocaleTimeString('th-TH')}
                      </Badge>
                    </div>
                    {todayAttendance.clockOutTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ເວລາອອກງານ:</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                          {new Date(todayAttendance.clockOutTime).toLocaleTimeString('th-TH')}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>ຍັງບໍ່ໄດ້ລົງເວລາໃນວັນນີ້</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device Info */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Smartphone className="h-3 w-3" />
              <span>Device: {deviceId ? 'ລົງທະບຽນແລ້ວ' : 'ກຳລັງກວດສອບ...'}</span>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-6">
            {/* Clock In Button */}
            <Button 
              className={`w-full h-14 text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                todayAttendance && todayAttendance.clockInTime 
                  ? 'bg-gray-400 hover:bg-gray-400' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
              }`}
              onClick={handleClockIn} 
              disabled={clockInProgress || (todayAttendance && todayAttendance.clockInTime) || !locationStatus || !locationStatus.isCompliant}
            >
              {clockInProgress ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>ກຳລັງລົງເວລາ...</span>
                </div>
              ) : todayAttendance && todayAttendance.clockInTime ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>ລົງເວລາເຂົ້າແລ້ວ</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>ລົງເວລາເຂົ້າງານ</span>
                </div>
              )}
            </Button>
            
            {/* Clock Out Button */}
            <Button 
              className={`w-full h-14 text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                !todayAttendance || !todayAttendance.clockInTime || todayAttendance.clockOutTime
                  ? 'bg-gray-400 hover:bg-gray-400' 
                  : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl'
              }`}
              onClick={handleClockOut} 
              disabled={clockOutProgress || !todayAttendance || !todayAttendance.clockInTime || todayAttendance.clockOutTime || !locationStatus || !locationStatus.isCompliant}
            >
              {clockOutProgress ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>ກຳລັງລົງເວລາ...</span>
                </div>
              ) : todayAttendance?.clockOutTime ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>ລົງເວລາອອກແລ້ວ</span>
                </div>
              ) : !todayAttendance?.clockInTime ? (
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  <span>ລົງເວລາເຂົ້າກ່ອນ</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  <span>ລົງເວລາອອກງານ</span>
                </div>
              )}
            </Button>

            {/* Quick Action Buttons */}
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => router.push('/attendance')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                ປະຫວັດ
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={checkLocation}
                disabled={isCheckingLocation}
              >
                {isCheckingLocation ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                ກວດສອບ GPS
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
