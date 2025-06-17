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
 * โครงสร้างข้อมูลผู้ใช้ใน Firestore
 * 
 * users collection:
 * - id: string (auto-generated)
 * - email: string
 * - phoneNumber: string
 * - password: string (ควรเข้ารหัสในระบบจริง)
 * - firstName: string
 * - lastName: string
 * - firstName_lo: string (Lao language)
 * - lastName_lo: string (Lao language)
 * - avatar: string (URL)
 * - role: string (admin, manager, staff, user)
 * - isActive: boolean
 * - isEmailVerified: boolean
 * - isPhoneVerified: boolean
 * - language: string (lo, en, th)
 * - timezone: string
 * - notification: {
 *     email: boolean,
 *     push: boolean
 *   }
 * - lastLogin: timestamp
 * - createdAt: timestamp
 * - updatedAt: timestamp
 */

/**
 * สร้างผู้ใช้ใหม่
 * @param {Object} userData - ข้อมูลผู้ใช้
 * @returns {Promise<string>} - ID ของผู้ใช้ที่สร้าง
 */
export const createUser = async (userData) => {
  try {
    const userRef = collection(db, 'users');
    
    // สร้าง displayName จากชื่อและนามสกุล
    const displayName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    
    const docRef = await addDoc(userRef, {
      // ข้อมูลพื้นฐาน
      email: userData.email || null,
      phoneNumber: userData.phoneNumber,
      password: userData.password, // ในระบบจริงควรเข้ารหัสรหัสผ่านก่อนบันทึก
      displayName: userData.displayName || displayName,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      firstName_lo: userData.firstName_lo || '',
      lastName_lo: userData.lastName_lo || '',
      avatar: userData.avatar || null,
      
      // สิทธิ์และสถานะ
      role: userData.role || 'user',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      isEmailVerified: userData.isEmailVerified || false,
      isPhoneVerified: userData.isPhoneVerified || false,
      
      // ตั้งค่าระบบ
      language: userData.language || 'lo',
      timezone: userData.timezone || 'Asia/Vientiane',
      notification: {
        email: userData.notification?.email !== undefined ? userData.notification.email : true,
        push: userData.notification?.push !== undefined ? userData.notification.push : true
      },
      
      // timestamp
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
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return { id: userSnap.id, ...userSnap.data() };
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
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    throw error;
  }
};

/**
 * ค้นหาผู้ใช้จากอีเมล
 * @param {string} email - อีเมล
 * @returns {Promise<Object|null>} - ข้อมูลผู้ใช้หรือ null ถ้าไม่พบ
 */
export const getUserByEmail = async (email) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
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
    const userRef = doc(db, 'users', userId);
    
    // สร้างข้อมูลที่จะอัปเดต
    const updateData = { ...userData };
    
    // ลบข้อมูลที่ไม่ต้องการอัปเดต
    delete updateData.id;
    delete updateData.createdAt;
    
    // ถ้ามีการเปลี่ยนชื่อหรือนามสกุล ให้อัปเดต displayName ด้วย
    if (userData.firstName !== undefined || userData.lastName !== undefined) {
      // ดึงข้อมูลผู้ใช้ปัจจุบันเพื่อใช้ชื่อและนามสกุลเดิมหากไม่มีการอัปเดต
      const currentUser = await getUserById(userId);
      const firstName = userData.firstName !== undefined ? userData.firstName : currentUser.firstName || '';
      const lastName = userData.lastName !== undefined ? userData.lastName : currentUser.lastName || '';
      
      updateData.displayName = `${firstName} ${lastName}`.trim();
    }
    
    // เพิ่ม timestamp
    updateData.updatedAt = serverTimestamp();
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * อัปเดตรหัสผ่านของผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @param {string} newPassword - รหัสผ่านใหม่
 * @returns {Promise<void>}
 */
export const updateUserPassword = async (userId, newPassword) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      password: newPassword, // ในระบบจริงควรเข้ารหัสรหัสผ่านก่อนบันทึก
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};

/**
 * อัปเดตสิทธิ์ของผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @param {Array<string>} roles - สิทธิ์ใหม่
 * @returns {Promise<void>}
 */
export const updateUserRoles = async (userId, roles) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: roles,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user roles:', error);
    throw error;
  }
};

/**
 * อัปเดตสถานะการใช้งานของผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @param {boolean} isActive - สถานะการใช้งาน
 * @returns {Promise<void>}
 */
export const updateUserStatus = async (userId, isActive) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isActive: isActive,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user status:', error);
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
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * ดึงรายการผู้ใช้ทั้งหมด
 * @param {boolean} activeOnly - ดึงเฉพาะผู้ใช้ที่มีสถานะเปิดใช้งาน
 * @returns {Promise<Array>} - รายการผู้ใช้
 */
export const getAllUsers = async (activeOnly = true) => {
  try {
    const users = [];
    
    // ดึงข้อมูลจากคอลเลกชัน users
    const usersRef = collection(db, 'users');
    let q;
    
    if (activeOnly) {
      q = query(usersRef, where('isActive', '==', true));
    } else {
      q = query(usersRef);
    }
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * ดึงรายการผู้ใช้ตามสิทธิ์
 * @param {string} role - สิทธิ์ที่ต้องการค้นหา
 * @param {boolean} activeOnly - ดึงเฉพาะผู้ใช้ที่มีสถานะเปิดใช้งาน
 * @returns {Promise<Array>} - รายการผู้ใช้
 */
export const getUsersByRole = async (role, activeOnly = true) => {
  try {
    const usersRef = collection(db, 'users');
    let q;
    
    if (activeOnly) {
      q = query(
        usersRef,
        where('role', '==', role),
        where('isActive', '==', true)
      );
    } else {
      q = query(usersRef, where('role', '==', role));
    }
    
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
};

/**
 * ตรวจสอบการเข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่าน
 * @param {string} phoneNumber - เบอร์โทรศัพท์
 * @param {string} password - รหัสผ่าน
 * @returns {Promise<Object|null>} - ข้อมูลผู้ใช้หรือ null ถ้าไม่พบหรือรหัสผ่านไม่ถูกต้อง
 */
export const loginWithPhoneAndPassword = async (phoneNumber, password) => {
  try {
    // ค้นหาผู้ใช้จากเบอร์โทรศัพท์
    const user = await getUserByPhone(phoneNumber);
    
    if (!user) {
      throw new Error('ບໍ່ພົບຜູ້ໃຊ້ທີ່ມີເບີໂທນີ້');
    }
    
    // ตรวจสอบรหัสผ่าน (ในระบบจริงควรเปรียบเทียบรหัสผ่านที่เข้ารหัสแล้ว)
    if (user.password !== password) {
      throw new Error('ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
    }
    
    // อัปเดตเวลาเข้าสู่ระบบล่าสุด
    await updateDoc(doc(db, 'users', user.id), {
      lastLogin: serverTimestamp()
    });
    
    // สำหรับผู้ใช้จากคอลเลกชันใหม่ หากค่า role เป็น array ให้แปลงเป็น string
    if (Array.isArray(user.role)) {
      // แปลง role จาก array เป็น string
      const role = user.role[0] || 'staff';
      
      // อัปเดตข้อมูลผู้ใช้
      await updateDoc(doc(db, 'users', user.id), {
        role: role,
        updatedAt: serverTimestamp()
      });
      
      // อัปเดตข้อมูลในผลลัพธ์
      user.role = role;
    }
    
    return user;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

/**
 * เชื่อมโยงบัญชีผู้ใช้กับข้อมูลพนักงาน
 * @param {string} userId - ID ของผู้ใช้
 * @param {string} employeeId - ID ของพนักงาน
 * @returns {Promise<void>}
 */
export const linkUserToEmployee = async (userId, employeeId) => {
  try {
    // อัปเดตข้อมูลผู้ใช้ให้เชื่อมโยงกับพนักงาน
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      employeeId: employeeId,
      updatedAt: serverTimestamp()
    });
    
    // อัปเดตข้อมูลพนักงานให้เชื่อมโยงกับผู้ใช้
    const employeeRef = doc(db, 'employees', employeeId);
    await updateDoc(employeeRef, {
      userId: userId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error linking user to employee:', error);
    throw error;
  }
};

/**
 * ยกเลิกการเชื่อมโยงบัญชีผู้ใช้กับข้อมูลพนักงาน
 * @param {string} userId - ID ของผู้ใช้
 * @param {string} employeeId - ID ของพนักงาน
 * @returns {Promise<void>}
 */
export const unlinkUserFromEmployee = async (userId, employeeId) => {
  try {
    // อัปเดตข้อมูลผู้ใช้ให้ยกเลิกการเชื่อมโยงกับพนักงาน
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      employeeId: null,
      updatedAt: serverTimestamp()
    });
    
    // อัปเดตข้อมูลพนักงานให้ยกเลิกการเชื่อมโยงกับผู้ใช้
    const employeeRef = doc(db, 'employees', employeeId);
    await updateDoc(employeeRef, {
      userId: null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error unlinking user from employee:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลพนักงานที่เชื่อมโยงกับผู้ใช้
 * @param {string} userId - ID ของผู้ใช้
 * @returns {Promise<Object|null>} - ข้อมูลพนักงานหรือ null ถ้าไม่มีการเชื่อมโยง
 */
export const getLinkedEmployee = async (userId) => {
  try {
    // ดึงข้อมูลผู้ใช้
    const user = await getUserById(userId);
    
    if (!user || !user.employeeId) {
      return null;
    }
    
    // ดึงข้อมูลพนักงาน
    const employeeRef = doc(db, 'employees', user.employeeId);
    const employeeSnap = await getDoc(employeeRef);
    
    if (!employeeSnap.exists()) {
      return null;
    }
    
    return { id: employeeSnap.id, ...employeeSnap.data() };
  } catch (error) {
    console.error('Error getting linked employee:', error);
    throw error;
  }
}; 