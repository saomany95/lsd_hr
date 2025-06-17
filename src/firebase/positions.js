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
 * positions collection functions
 * 
 * โครงสร้างข้อมูลตำแหน่ง:
 * - id: string (auto-generated)
 * - title: string - ชื่อตำแหน่ง
 * - title_en: string - ชื่อตำแหน่งภาษาอังกฤษ
 * - title_lo: string - ชื่อตำแหน่งภาษาลาว
 * - code: string - รหัสตำแหน่ง
 * - departmentId: string - ID ของแผนกที่ตำแหน่งนี้สังกัด
 * - level: number - ระดับตำแหน่ง (1=Entry, 2=Junior, 3=Senior, 4=Lead, 5=Manager)
 * - grade: string - เกรดตำแหน่ง (A1, A2, B1, etc.)
 * - description: string - คำอธิบายตำแหน่ง
 * - requirements: object - คุณสมบัติที่ต้องการ {education, experience, skills}
 * - isActive: boolean - สถานะการใช้งาน
 * - createdAt: timestamp - วันที่สร้าง
 * - updatedAt: timestamp - วันที่อัปเดตล่าสุด
 */

/**
 * สร้างตำแหน่งใหม่
 * @param {Object} positionData - ข้อมูลตำแหน่ง
 * @returns {Promise<string>} - ID ของตำแหน่งที่สร้าง
 */
export const createPosition = async (positionData) => {
  try {
    const positionsRef = collection(db, 'positions');
    const docRef = await addDoc(positionsRef, {
      title: positionData.title,
      title_en: positionData.title_en || null,
      title_lo: positionData.title_lo || null,
      code: positionData.code,
      departmentId: positionData.departmentId,
      level: positionData.level || 1,
      grade: positionData.grade || null,
      description: positionData.description || null,
      requirements: positionData.requirements || null,
      isActive: positionData.isActive !== undefined ? positionData.isActive : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating position:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลตำแหน่งจาก ID
 * @param {string} positionId - ID ของตำแหน่ง
 * @returns {Promise<Object|null>} - ข้อมูลตำแหน่งหรือ null ถ้าไม่พบ
 */
export const getPositionById = async (positionId) => {
  try {
    const positionRef = doc(db, 'positions', positionId);
    const positionSnap = await getDoc(positionRef);
    
    if (!positionSnap.exists()) {
      return null;
    }
    
    const positionData = positionSnap.data();
    return { id: positionSnap.id, ...positionData };
  } catch (error) {
    console.error('Error getting position by ID:', error);
    throw error;
  }
};

/**
 * อัปเดตข้อมูลตำแหน่ง
 * @param {string} positionId - ID ของตำแหน่ง
 * @param {Object} positionData - ข้อมูลที่ต้องการอัปเดต
 * @returns {Promise<void>}
 */
export const updatePosition = async (positionId, positionData) => {
  try {
    const positionRef = doc(db, 'positions', positionId);
    await updateDoc(positionRef, {
      ...positionData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating position:', error);
    throw error;
  }
};

/**
 * ลบตำแหน่ง
 * @param {string} positionId - ID ของตำแหน่ง
 * @returns {Promise<void>}
 */
export const deletePosition = async (positionId) => {
  try {
    const positionRef = doc(db, 'positions', positionId);
    await deleteDoc(positionRef);
  } catch (error) {
    console.error('Error deleting position:', error);
    throw error;
  }
};

/**
 * ดึงรายการตำแหน่งทั้งหมด
 * @param {boolean} activeOnly - ดึงเฉพาะตำแหน่งที่เปิดใช้งานหรือไม่
 * @returns {Promise<Array>} - รายการตำแหน่ง
 */
export const getAllPositions = async (activeOnly = true) => {
  try {
    const positionsRef = collection(db, 'positions');
    let q;
    
    if (activeOnly) {
      q = query(positionsRef, where('isActive', '==', true), orderBy('title'));
    } else {
      q = query(positionsRef, orderBy('title'));
    }
    
    const querySnapshot = await getDocs(q);
    
    const positions = [];
    querySnapshot.forEach((doc) => {
      positions.push({ id: doc.id, ...doc.data() });
    });
    
    return positions;
  } catch (error) {
    console.error('Error getting all positions:', error);
    throw error;
  }
};

/**
 * ดึงรายการตำแหน่งของแผนก
 * @param {string} departmentId - ID ของแผนก
 * @param {boolean} activeOnly - ดึงเฉพาะตำแหน่งที่เปิดใช้งานหรือไม่
 * @returns {Promise<Array>} - รายการตำแหน่ง
 */
export const getPositionsByDepartment = async (departmentId, activeOnly = true) => {
  try {
    console.log('Fetching positions for department:', departmentId);
    
    const positionsRef = collection(db, 'positions');
    let q;
    
    if (activeOnly) {
      q = query(
        positionsRef,
        where('departmentId', '==', departmentId),
        where('isActive', '==', true)
      );
    } else {
      q = query(
        positionsRef,
        where('departmentId', '==', departmentId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    console.log('Positions query returned:', querySnapshot.size, 'documents');
    
    const positions = [];
    querySnapshot.forEach((doc) => {
      const positionData = doc.data();
      console.log('Position data:', positionData);
      
      // ตรวจสอบว่าตำแหน่งมีชื่อหรือไม่ (ทั้งในรูปแบบ title หรือ name)
      if (positionData.title || positionData.title_lo || positionData.name || positionData.name_lo) {
        // สร้าง name และ name_lo สำหรับการแสดงผลในหน้า UI
        if (!positionData.name && (positionData.title || positionData.title_lo)) {
          positionData.name = positionData.title || positionData.title_lo;
        }
        
        if (!positionData.name_lo && (positionData.title_lo || positionData.title)) {
          positionData.name_lo = positionData.title_lo || positionData.title;
        }
        
        positions.push({ id: doc.id, ...positionData });
      }
    });
    
    console.log('Processed positions:', positions.length);
    return positions;
  } catch (error) {
    console.error('Error getting positions by department:', error);
    throw error;
  }
};

/**
 * ดึงรายการตำแหน่งตามระดับ
 * @param {number} level - ระดับตำแหน่ง
 * @returns {Promise<Array>} - รายการตำแหน่ง
 */
export const getPositionsByLevel = async (level) => {
  try {
    const positionsRef = collection(db, 'positions');
    const q = query(
      positionsRef,
      where('level', '==', level),
      where('isActive', '==', true),
      orderBy('title')
    );
    
    const querySnapshot = await getDocs(q);
    
    const positions = [];
    querySnapshot.forEach((doc) => {
      positions.push({ id: doc.id, ...doc.data() });
    });
    
    return positions;
  } catch (error) {
    console.error('Error getting positions by level:', error);
    throw error;
  }
};

/**
 * ค้นหาตำแหน่งตามชื่อ
 * @param {string} searchText - ข้อความที่ต้องการค้นหา
 * @param {string} departmentId - ID ของแผนก (optional)
 * @returns {Promise<Array>} - รายการตำแหน่งที่ตรงกับการค้นหา
 */
export const searchPositions = async (searchText, departmentId = null) => {
  try {
    const positionsRef = collection(db, 'positions');
    let q;
    
    if (departmentId) {
      q = query(
        positionsRef,
        where('departmentId', '==', departmentId),
        where('isActive', '==', true)
      );
    } else {
      q = query(positionsRef, where('isActive', '==', true));
    }
    
    const querySnapshot = await getDocs(q);
    
    const searchResults = [];
    const searchTextLower = searchText.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.title.toLowerCase().includes(searchTextLower) ||
        (data.title_en && data.title_en.toLowerCase().includes(searchTextLower)) ||
        (data.title_lo && data.title_lo.toLowerCase().includes(searchTextLower)) ||
        data.code.toLowerCase().includes(searchTextLower) ||
        (data.description && data.description.toLowerCase().includes(searchTextLower))
      ) {
        searchResults.push({ id: doc.id, ...data });
      }
    });
    
    return searchResults;
  } catch (error) {
    console.error('Error searching positions:', error);
    throw error;
  }
};

/**
 * เปลี่ยนสถานะการใช้งานของตำแหน่ง
 * @param {string} positionId - ID ของตำแหน่ง
 * @param {boolean} isActive - สถานะการใช้งานใหม่
 * @returns {Promise<void>}
 */
export const togglePositionStatus = async (positionId, isActive) => {
  try {
    const positionRef = doc(db, 'positions', positionId);
    await updateDoc(positionRef, {
      isActive: isActive,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling position status:', error);
    throw error;
  }
}; 