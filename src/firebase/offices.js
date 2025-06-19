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
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

/**
 * offices collection functions
 * 
 * โครงสร้างข้อมูลสำนักงาน:
 * - id: string (auto-generated)
 * - name: string - ชื่อสำนักงาน/จุดกวด
 * - location: string - สถานที่ตั้ง
 * - status: string - สถานะ (active, inactive)
 * - createdAt: timestamp - วันที่สร้าง
 * - updatedAt: timestamp - วันที่อัปเดตล่าสุด
 */

/**
 * สร้างสำนักงานใหม่
 * @param {Object} officeData - ข้อมูลสำนักงาน
 * @returns {Promise<string>} - ID ของสำนักงานที่สร้าง
 */
export const createOffice = async (officeData) => {
  try {
    const officesRef = collection(db, 'offices');
    const docRef = await addDoc(officesRef, {
      name: officeData.name,
      location: officeData.location || '',
      status: officeData.status || 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating office:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลสำนักงานจาก ID
 * @param {string} officeId - ID ของสำนักงาน
 * @returns {Promise<Object|null>} - ข้อมูลสำนักงานหรือ null ถ้าไม่พบ
 */
export const getOfficeById = async (officeId) => {
  try {
    const officeRef = doc(db, 'offices', officeId);
    const officeSnap = await getDoc(officeRef);
    
    if (!officeSnap.exists()) {
      return null;
    }
    
    const officeData = officeSnap.data();
    return { id: officeSnap.id, ...officeData };
  } catch (error) {
    console.error('Error getting office by ID:', error);
    throw error;
  }
};

/**
 * อัปเดตข้อมูลสำนักงาน
 * @param {string} officeId - ID ของสำนักงาน
 * @param {Object} officeData - ข้อมูลที่ต้องการอัปเดต
 * @returns {Promise<void>}
 */
export const updateOffice = async (officeId, officeData) => {
  try {
    const officeRef = doc(db, 'offices', officeId);
    await updateDoc(officeRef, {
      ...officeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating office:', error);
    throw error;
  }
};

/**
 * ลบสำนักงาน
 * @param {string} officeId - ID ของสำนักงาน
 * @returns {Promise<void>}
 */
export const deleteOffice = async (officeId) => {
  try {
    const officeRef = doc(db, 'offices', officeId);
    await deleteDoc(officeRef);
  } catch (error) {
    console.error('Error deleting office:', error);
    throw error;
  }
};

/**
 * ดึงรายการสำนักงานทั้งหมด
 * @param {string} statusFilter - กรองตามสถานะ ('all', 'active', 'inactive')
 * @returns {Promise<Array>} - รายการสำนักงาน
 */
export const getAllOffices = async (statusFilter = 'all') => {
  try {
    const officesRef = collection(db, 'offices');
    let q;
    
    if (statusFilter === 'active') {
      // เรียงตาม createdAt จากเก่าไปใหม่ (เรียงตามลำดับการสร้าง 1, 2, 3, ...)
      q = query(officesRef, where('status', '==', 'active'), orderBy('createdAt', 'asc'));
    } else if (statusFilter === 'inactive') {
      q = query(officesRef, where('status', '==', 'inactive'), orderBy('createdAt', 'asc'));
    } else {
      // เรียงตาม createdAt จากเก่าไปใหม่ (เรียงตามลำดับการสร้าง 1, 2, 3, ...)
      q = query(officesRef, orderBy('createdAt', 'asc'));
    }
    
    const querySnapshot = await getDocs(q);
    
    const offices = [];
    querySnapshot.forEach((doc) => {
      offices.push({ id: doc.id, ...doc.data() });
    });
    
    // เรียงลำดับสำนักงาน โดยให้ "สำนักงานใหญ่" อยู่ด้านบนสุดเสมอ แม้จะสร้างทีหลังก็ตาม
    offices.sort((a, b) => {
      // ถ้า a คือ "สำนักงานใหญ่" ให้แสดงก่อนเสมอ
      if (a.name === 'สำนักงานใหญ่') return -1;
      // ถ้า b คือ "สำนักงานใหญ่" ให้แสดงก่อนเสมอ
      if (b.name === 'สำนักงานใหญ่') return 1;
      
      // สำหรับสำนักงานอื่นๆ เรียงตามเวลาที่สร้าง (createdAt)
      // ถ้าไม่มีค่า createdAt ให้แสดงท้ายสุด
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      
      // เปรียบเทียบเวลาที่สร้าง
      const aTime = a.createdAt.toDate ? a.createdAt.toDate().getTime() : 0;
      const bTime = b.createdAt.toDate ? b.createdAt.toDate().getTime() : 0;
      return aTime - bTime;
    });
    
    return offices;
  } catch (error) {
    console.error('Error getting all offices:', error);
    throw error;
  }
};

/**
 * ค้นหาสำนักงานตามชื่อ
 * @param {string} searchText - ข้อความที่ต้องการค้นหา
 * @returns {Promise<Array>} - รายการสำนักงานที่ตรงกับการค้นหา
 */
export const searchOffices = async (searchText) => {
  try {
    // Firebase Firestore ไม่รองรับการค้นหาแบบ text search ตรงๆ
    // ต้องดึงข้อมูลทั้งหมดมาก่อน แล้วค่อยกรองที่ client
    const officesRef = collection(db, 'offices');
    const q = query(officesRef);
    
    const querySnapshot = await getDocs(q);
    
    const searchResults = [];
    const searchTextLower = searchText.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.name.toLowerCase().includes(searchTextLower) ||
        data.location.toLowerCase().includes(searchTextLower)
      ) {
        searchResults.push({ id: doc.id, ...data });
      }
    });
    
    return searchResults;
  } catch (error) {
    console.error('Error searching offices:', error);
    throw error;
  }
};

/**
 * เปลี่ยนสถานะของสำนักงาน
 * @param {string} officeId - ID ของสำนักงาน
 * @param {string} status - สถานะใหม่ ('active', 'inactive')
 * @returns {Promise<void>}
 */
export const toggleOfficeStatus = async (officeId, status) => {
  try {
    const officeRef = doc(db, 'offices', officeId);
    await updateDoc(officeRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling office status:', error);
    throw error;
  }
}; 