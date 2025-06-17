'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAllLeaves, updateLeaveStatus, getUserLeaves } from './firestore';
import { getAllUsers, deleteUser, createUser } from './users';

// สร้าง Firebase Context
const FirebaseContext = createContext();

// สร้าง Provider สำหรับ Firebase Context
export function FirebaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบสถานะการเข้าสู่ระบบเมื่อโหลดแอพ
  useEffect(() => {
    // Check for stored user in localStorage
    const checkStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('hr_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('hr_user');
      }
      setLoading(false);
    };

    checkStoredUser();

    // Also listen to Firebase Auth changes (for future email/password auth)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Store in localStorage for persistence
        localStorage.setItem('hr_user', JSON.stringify(currentUser));
      } else if (!localStorage.getItem('hr_user')) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ฟังก์ชันสำหรับลงทะเบียนด้วยอีเมลและรหัสผ่าน
  const register = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // อัปเดตชื่อผู้ใช้
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // ฟังก์ชันสำหรับเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // ฟังก์ชันสำหรับเข้าสู่ระบบด้วยเบอร์โทรศัพท์
  const setupRecaptcha = (elementId) => {
    return new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
      callback: () => {}
    });
  };

  // ใช้ Firebase Phone Authentication กับ reCAPTCHA แบบ invisible
  const loginWithPhone = async (phoneNumber) => {
    try {
      // สร้าง reCAPTCHA verifier แบบ invisible
      // โดยกำหนดให้สร้างในองค์ประกอบที่มี ID 'sign-in-button' หรือใช้ 'invisible-recaptcha'
      try {
        // ลบอันเก่าหากมี
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
        }
      } catch (e) {
        console.log('No existing recaptcha to clear');
      }
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
        'size': 'invisible',
        'callback': (response) => {
          console.log('reCAPTCHA solved, allow signInWithPhoneNumber.');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
      
      console.log('Sending OTP to:', phoneNumber);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      return confirmationResult;
    } catch (error) {
      console.error('Error in loginWithPhone:', error);
      throw error;
    }
  };

  // ฟังก์ชันสำหรับออกจากระบบ
  const logout = async () => {
    try {
      // Clear user state and localStorage
      setUser(null);
      localStorage.removeItem('hr_user');
      
      // Also sign out from Firebase Auth if applicable
      await signOut(auth);
    } catch (error) {
      // Even if Firebase signOut fails, clear local state
      setUser(null);
      localStorage.removeItem('hr_user');
      throw error;
    }
  };

  // ฟังก์ชันสำหรับรีเซ็ตรหัสผ่านด้วยอีเมล
  const resetPasswordByEmail = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };
  
  // ฟังก์ชันสำหรับตรวจสอบผู้ใช้จากเบอร์โทรศัพท์
  const getUserByPhone = async (phoneNumber) => {
    try {   
      console.log('Searching for user with phone:', phoneNumber);
      
      // ค้นหาในคอลเลกชันใหม่ (users)
      const userRef = collection(db, 'users');
      const q = query(userRef, where('phoneNumber', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      
      console.log('Query snapshot empty:', querySnapshot.empty);
      
      if (querySnapshot.empty) {
        // ถ้าไม่พบในคอลเลกชันใหม่ ลองค้นหาในคอลเลกชันเก่า (user)
        console.log('Not found in new collection, trying old collection:');
        const oldUserRef = collection(db, 'user');
        const oldQuery = query(oldUserRef, where('phoneNumber', '==', phoneNumber));
        const oldQuerySnapshot = await getDocs(oldQuery);
        
        if (oldQuerySnapshot.empty) {
          console.log('User not found in either collection');
          return null;
        }
        
        const oldUserDoc = oldQuerySnapshot.docs[0];
        console.log('Found user in old collection, ID:', oldUserDoc.id);
        return { 
          id: oldUserDoc.id, 
          ...oldUserDoc.data(),
          fromOldCollection: true // เพิ่มฟิลด์เพื่อระบุว่ามาจากคอลเลกชันเก่า
        };
      }
      
      const userDoc = querySnapshot.docs[0];
      console.log('Found user in new collection, ID:', userDoc.id);
      
      return { 
        id: userDoc.id, 
        ...userDoc.data(),
        fromOldCollection: false // เพิ่มฟิลด์เพื่อระบุว่ามาจากคอลเลกชันใหม่
      };
    } catch (error) {
      console.error('Error getting user by phone:', error);
      throw error;
    }
  };
  
  // ฟังก์ชันสำหรับเข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่าน
  const loginWithPhoneAndPassword = async (phoneNumber, password) => {
    try {
      console.log('Attempting to login with:', { phoneNumber, password });
      
      // จัดการรูปแบบเบอร์โทรศัพท์ให้ตรงกับที่เก็บในฐานข้อมูล
      let formattedPhone = phoneNumber;
      if (!phoneNumber.startsWith('+856')) {
        formattedPhone = '+856' + phoneNumber.replace(/^0+/, '');
      }
      
      console.log('Formatted phone number:', formattedPhone);
      
      // ค้นหาผู้ใช้จากเบอร์โทรศัพท์ (ใช้ฟังก์ชัน getUserByPhone ที่ค้นหาทั้งในคอลเลกชันเก่าและใหม่)
      try {
        const user = await getUserByPhone(formattedPhone);        
        if (!user) {
          throw new Error('ບໍ່ພົບຜູ້ໃຊ້ທີ່ມີເບີໂທນີ້');
        }
        
        // ตรวจสอบรหัสผ่าน
        if (user.password !== password) {
          throw new Error('ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
        }
        
        // ตั้งค่าผู้ใช้ปัจจุบันและเก็บใน localStorage
        setUser(user);
        localStorage.setItem('hr_user', JSON.stringify(user));
        return user;
        
      } catch (innerError) {
        console.error('Error during user lookup:', innerError);
        throw new Error('ບໍ່ສາມາດເຂົ້າສູ່ລະບົບໄດ້, ກາລຸນາກວດສອບເບີໂທລະສັບແລະລະຫັດຜ່ານຂອງທ່ານ');
      }
    } catch (error) {
      console.error('Login with phone and password error:', error);
      throw error;
    }
  };
  
  // ฟังก์ชันสำหรับรีเซ็ตรหัสผ่านด้วย OTP
  const resetPasswordByPhone = async (phoneNumber, newPassword) => {
    try {
      // ค้นหาผู้ใช้จากเบอร์โทรศัพท์
      const user = await getUserByPhone(phoneNumber);
      
      if (!user) {
        throw new Error('ບໍ່ພົບບັນຊີຜູ້ໃຊ້ທີ່ກົງກັບເບີນີ້');
      }
      
      // ตรวจสอบว่าผู้ใช้อยู่ในคอลเลกชันใด
      const collectionName = user.fromOldCollection ? 'user' : 'users';
      
      // อัปเดตรหัสผ่านในฐานข้อมูล
      const userRef = doc(db, collectionName, user.id);
      await updateDoc(userRef, {
        password: newPassword, // ในระบบจริงควรเข้ารหัสรหัสผ่านก่อนบันทึก
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Reset password by phone error:', error);
      throw error;
    }
  };

  // ฟังก์ชันสำหรับลงเวลาเข้างาน
  const clockIn = async (attendanceData) => {
    try {
      // บันทึกข้อมูลการลงเวลาเข้างานใน Firestore
      const attendanceRef = collection(db, 'attendance');
      
      // อัปโหลดรูปภาพไปยัง Firebase Storage (ถ้ามี)
      let selfieImageUrl = null;
      if (attendanceData.selfieImage) {
        // ในระบบจริงควรอัปโหลดรูปภาพไปยัง Firebase Storage
        // และเก็บ URL ที่ได้ใน selfieImageUrl
        // สำหรับตัวอย่างนี้เราจะเก็บข้อมูลรูปภาพแบบ Base64 ไว้ใน Firestore โดยตรง
        // (ในระบบจริงไม่ควรทำแบบนี้เพราะจะใช้พื้นที่มาก)
        selfieImageUrl = attendanceData.selfieImage;
      }
      
      // สร้างข้อมูลที่จะบันทึก
      const attendanceRecord = {
        ...attendanceData,
        selfieImage: selfieImageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // บันทึกลงใน Firestore
      const docRef = await setDoc(doc(attendanceRef), attendanceRecord);
      
      console.log('Clock in recorded:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Clock in error:', error);
      throw error;
    }
  };

  // ฟังก์ชันสำหรับลงเวลาออกงาน
  const clockOut = async (attendanceId, clockOutData) => {
    try {
      // อัปโหลดรูปภาพไปยัง Firebase Storage (ถ้ามี)
      let selfieImageUrl = null;
      if (clockOutData.selfieImage) {
        // ในระบบจริงควรอัปโหลดรูปภาพไปยัง Firebase Storage
        // และเก็บ URL ที่ได้ใน selfieImageUrl
        // สำหรับตัวอย่างนี้เราจะเก็บข้อมูลรูปภาพแบบ Base64 ไว้ใน Firestore โดยตรง
        selfieImageUrl = clockOutData.selfieImage;
      }
      
      // อัปเดตข้อมูลในเอกสารที่มีอยู่แล้ว
      const attendanceRef = doc(db, 'attendance', attendanceId);
      
      // อัปเดตข้อมูล
      await updateDoc(attendanceRef, {
        ...clockOutData,
        selfieImage: selfieImageUrl,
        updatedAt: new Date()
      });
      
      console.log('Clock out recorded for attendance:', attendanceId);
      return true;
    } catch (error) {
      console.error('Clock out error:', error);
      throw error;
    }
  };

  // ฟังก์ชันสำหรับดึงข้อมูลการลงเวลาวันนี้
  const getTodayAttendance = async (userId) => {
    try {
      // สร้างวันที่เริ่มต้นและสิ้นสุดของวันนี้
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      // ค้นหาข้อมูลการลงเวลาของวันนี้
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('userId', '==', userId),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No attendance record found for today');
        return null;
      }
      
      // ควรจะมีเพียงรายการเดียวสำหรับวันนี้
      const attendanceDoc = querySnapshot.docs[0];
      
      return {
        id: attendanceDoc.id,
        ...attendanceDoc.data(),
        // แปลงวันที่จาก Firestore Timestamp เป็น JavaScript Date
        date: attendanceDoc.data().date.toDate(),
        clockInTime: attendanceDoc.data().clockInTime.toDate(),
        clockOutTime: attendanceDoc.data().clockOutTime ? attendanceDoc.data().clockOutTime.toDate() : null,
        createdAt: attendanceDoc.data().createdAt.toDate(),
        updatedAt: attendanceDoc.data().updatedAt.toDate()
      };
    } catch (error) {
      console.error('Get today attendance error:', error);
      throw error;
    }
  };

  // ฟังก์ชันสำหรับดึงประวัติการลงเวลา
  const getUserAttendanceHistory = async (userId, days = 30) => {
    try {
      // คำนวณวันที่เริ่มต้น (วันนี้ - จำนวนวันที่ต้องการ)
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - days);
      
      // ค้นหาข้อมูลการลงเวลาในช่วงเวลาที่กำหนด
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', today),
        // เรียงตามวันที่จากใหม่ไปเก่า
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      // แปลงข้อมูลและส่งกลับ
      const attendanceHistory = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // แปลงวันที่จาก Firestore Timestamp เป็น JavaScript Date
          date: data.date.toDate(),
          clockInTime: data.clockInTime.toDate(),
          clockOutTime: data.clockOutTime ? data.clockOutTime.toDate() : null,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        };
      });
      
      return attendanceHistory;
    } catch (error) {
      console.error('Get attendance history error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    db,
    register,
    login,
    logout,
    resetPasswordByEmail,
    resetPasswordByPhone,
    setupRecaptcha,
    loginWithPhone,
    loginWithPhoneAndPassword,
    getUserByPhone,
    clockIn,
    clockOut,
    getTodayAttendance,
    getUserAttendanceHistory,
    getAllLeaves,
    updateLeaveStatus,
    getUserLeaves,
    getAllUsers,
    deleteUser,
    createUser
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
}

// สร้าง Hook สำหรับใช้งาน Firebase Context
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
