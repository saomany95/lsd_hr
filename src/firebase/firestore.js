'use client';

import { db } from './config';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

/**
 * โครงสร้างข้อมูลใน Firestore
 * 
 * 1. users - คอลเลกชันข้อมูลผู้ใช้
 *    - id: string (auto-generated)
 *    - displayName: string
 *    - email: string
 *    - phoneNumber: string
 *    - password: string (ควรเข้ารหัสในระบบจริง)
 *    - role: string (admin, manager, employee)
 *    - department: string
 *    - position: string
 *    - employeeId: string
 *    - profileImage: string (URL)
 *    - createdAt: timestamp
 *    - updatedAt: timestamp
 * 
 * 2. attendance - คอลเลกชันข้อมูลการลงเวลา
 *    - id: string (auto-generated)
 *    - userId: string (reference to users)
 *    - date: timestamp
 *    - clockInTime: timestamp
 *    - clockOutTime: timestamp
 *    - clockInLocation: {
 *        latitude: number,
 *        longitude: number,
 *        address: string
 *      }
 *    - clockOutLocation: {
 *        latitude: number,
 *        longitude: number,
 *        address: string
 *      }
 *    - clockInImage: string (URL)
 *    - clockOutImage: string (URL)
 *    - status: string (present, late, absent)
 *    - notes: string
 *    - createdAt: timestamp
 *    - updatedAt: timestamp
 * 
 * 3. leaves - คอลเลกชันข้อมูลการลา
 *    - id: string (auto-generated)
 *    - userId: string (reference to users)
 *    - leaveType: string (sick, vacation, personal)
 *    - startDate: timestamp
 *    - endDate: timestamp
 *    - reason: string
 *    - status: string (pending, approved, rejected)
 *    - approvedBy: string (reference to users)
 *    - attachments: array of strings (URLs)
 *    - createdAt: timestamp
 *    - updatedAt: timestamp
 */

// ====================== User Functions ======================

/**
 * สร้างผู้ใช้ใหม่
 * @param {Object} userData - ข้อมูลผู้ใช้
 * @returns {Promise<string>} - ID ของผู้ใช้ที่สร้าง
 */
export const createUser = async (userData) => {
  try {
    const userRef = collection(db, 'user');
    const docRef = await addDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลผู้ใช้จาก ID
 * @param {string} userId - ID ของผู้ใช้
 * @returns {Promise<Object|null>} - ข้อมูลผู้ใช้หรือ null ถ้าไม่พบ
 */
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'user', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const userData = userSnap.data();
    return { id: userSnap.id, ...userData };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * ค้นหาผู้ใช้จากเบอร์โทรศัพท์
 * @param {string} phoneNumber - เบอร์โทรศัพท์
 * @returns {Promise<Object|null>} - ข้อมูลผู้ใช้หรือ null ถ้าไม่พบ
 */
export const getUserByPhone = async (phoneNumber) => {
  try {
    const usersRef = collection(db, 'user');
    const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Error getting user by phone:', error);
    throw error;
  }
};

/**
 * อัปเดตข้อมูลผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @param {Object} userData - ข้อมูลที่ต้องการอัปเดต
 * @returns {Promise<void>}
 */
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'user', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * ลบผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, 'user', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * ดึงรายการผู้ใช้ทั้งหมด
 * @returns {Promise<Array>} - รายการผู้ใช้
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'user');
    const querySnapshot = await getDocs(usersRef);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// ====================== Attendance Functions ======================

/**
 * บันทึกการลงเวลาเข้างาน
 * @param {Object} attendanceData - ข้อมูลการลงเวลา
 * @returns {Promise<string>} - ID ของการลงเวลา
 */
export const clockIn = async (attendanceData) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    const docRef = await addDoc(attendanceRef, {
      ...attendanceData,
      clockInTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error clocking in:', error);
    throw error;
  }
};

/**
 * บันทึกการลงเวลาออกงาน
 * @param {string} attendanceId - ID ของการลงเวลา
 * @param {Object} clockOutData - ข้อมูลการลงเวลาออก
 * @returns {Promise<void>}
 */
export const clockOut = async (attendanceId, clockOutData) => {
  try {
    const attendanceRef = doc(db, 'attendance', attendanceId);
    await updateDoc(attendanceRef, {
      ...clockOutData,
      clockOutTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error clocking out:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลการลงเวลาของผู้ใช้ในวันนี้
 * @param {string} userId - ID ของผู้ใช้
 * @returns {Promise<Object|null>} - ข้อมูลการลงเวลาหรือ null ถ้าไม่พบ
 */
export const getTodayAttendance = async (userId) => {
  try {
    // สร้าง timestamp สำหรับเริ่มต้นและสิ้นสุดของวันนี้
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = Timestamp.fromDate(today);
    
    today.setHours(23, 59, 59, 999);
    const endOfDay = Timestamp.fromDate(today);
    
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('userId', '==', userId),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const attendanceDoc = querySnapshot.docs[0];
    return { id: attendanceDoc.id, ...attendanceDoc.data() };
  } catch (error) {
    console.error('Error getting today attendance:', error);
    throw error;
  }
};

/**
 * ดึงประวัติการลงเวลาของผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @param {number} limitCount - จำนวนรายการที่ต้องการดึง
 * @returns {Promise<Array>} - รายการประวัติการลงเวลา
 */
export const getUserAttendanceHistory = async (userId, limitCount = 30) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });
    
    return history;
  } catch (error) {
    console.error('Error getting user attendance history:', error);
    throw error;
  }
};

// ====================== Leave Functions ======================

/**
 * สร้างคำขอลา
 * @param {Object} leaveData - ข้อมูลการลา
 * @returns {Promise<string>} - ID ของคำขอลา
 */
export const createLeaveRequest = async (leaveData) => {
  try {
    const leavesRef = collection(db, 'leaves');
    const docRef = await addDoc(leavesRef, {
      ...leaveData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating leave request:', error);
    throw error;
  }
};

/**
 * ดึงคำขอลาจาก ID
 * @param {string} leaveId - ID ของคำขอลา
 * @returns {Promise<Object|null>} - ข้อมูลคำขอลาหรือ null ถ้าไม่พบ
 */
export const getLeaveById = async (leaveId) => {
  try {
    const leaveRef = doc(db, 'leaves', leaveId);
    const leaveSnap = await getDoc(leaveRef);
    
    if (!leaveSnap.exists()) {
      return null;
    }
    
    const leaveData = leaveSnap.data();
    return { id: leaveSnap.id, ...leaveData };
  } catch (error) {
    console.error('Error getting leave by ID:', error);
    throw error;
  }
};

/**
 * อัปเดตสถานะคำขอลา
 * @param {string} leaveId - ID ของคำขอลา
 * @param {string} status - สถานะใหม่ (approved, rejected)
 * @param {string} approvedBy - ID ของผู้อนุมัติ
 * @returns {Promise<void>}
 */
export const updateLeaveStatus = async (leaveId, status, approvedBy) => {
  try {
    const leaveRef = doc(db, 'leaves', leaveId);
    await updateDoc(leaveRef, {
      status,
      approvedBy,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating leave status:', error);
    throw error;
  }
};

/**
 * ดึงคำขอลาของผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @returns {Promise<Array>} - รายการคำขอลา
 */
export const getUserLeaves = async (userId) => {
  try {
    const leavesRef = collection(db, 'leaves');
    const q = query(
      leavesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const leaves = [];
    querySnapshot.forEach((doc) => {
      leaves.push({ id: doc.id, ...doc.data() });
    });
    
    return leaves;
  } catch (error) {
    console.error('Error getting user leaves:', error);
    throw error;
  }
};

/**
 * ดึงคำขอลาที่รอการอนุมัติ
 * @returns {Promise<Array>} - รายการคำขอลาที่รอการอนุมัติ
 */
export const getPendingLeaves = async () => {
  try {
    const leavesRef = collection(db, 'leaves');
    const q = query(
      leavesRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const pendingLeaves = [];
    querySnapshot.forEach((doc) => {
      pendingLeaves.push({ id: doc.id, ...doc.data() });
    });
    
    return pendingLeaves;
  } catch (error) {
    console.error('Error getting pending leaves:', error);
    throw error;
  }
};

/**
 * ดึงคำขอลาทั้งหมด
 * @returns {Promise<Array>} - รายการคำขอลาทั้งหมด
 */
export const getAllLeaves = async () => {
  try {
    const leavesRef = collection(db, 'leaves');
    const q = query(
      leavesRef,
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const allLeaves = [];
    querySnapshot.forEach((doc) => {
      allLeaves.push({ id: doc.id, ...doc.data() });
    });
    
    return allLeaves;
  } catch (error) {
    console.error('Error getting all leaves:', error);
    throw error;
  }
};
