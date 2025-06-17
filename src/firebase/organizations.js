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
 * organizations collection functions
 * 
 * โครงสร้างข้อมูลองค์กร:
 * - id: string (auto-generated)
 * - name: string - ชื่อองค์กร
 * - name_en: string - ชื่อองค์กรภาษาอังกฤษ
 * - name_lo: string - ชื่อองค์กรภาษาลาว
 * - code: string - รหัสองค์กร
 * - type: string - ประเภทองค์กร (company, branch, office)
 * - parentId: string - ID ขององค์กรแม่ (null ถ้าเป็นองค์กรระดับสูงสุด)
 * - address: object - ที่อยู่ {street, city, province, postal_code, country}
 * - contactInfo: object - ข้อมูลติดต่อ {phone, email, fax, website}
 * - taxNumber: string - เลขประจำตัวผู้เสียภาษี
 * - registrationNumber: string - เลขทะเบียนนิติบุคคล
 * - isActive: boolean - สถานะการใช้งาน
 * - createdAt: timestamp - วันที่สร้าง
 * - updatedAt: timestamp - วันที่อัปเดตล่าสุด
 */

/**
 * สร้างองค์กรใหม่
 * @param {Object} orgData - ข้อมูลองค์กร
 * @returns {Promise<string>} - ID ขององค์กรที่สร้าง
 */
export const createOrganization = async (orgData) => {
  try {
    const orgsRef = collection(db, 'organizations');
    const docRef = await addDoc(orgsRef, {
      name: orgData.name,
      name_en: orgData.name_en || null,
      name_lo: orgData.name_lo || null,
      code: orgData.code,
      type: orgData.type || 'company',
      parentId: orgData.parentId || null,
      address: orgData.address || null,
      contactInfo: orgData.contactInfo || null,
      taxNumber: orgData.taxNumber || null,
      registrationNumber: orgData.registrationNumber || null,
      isActive: orgData.isActive !== undefined ? orgData.isActive : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลองค์กรจาก ID
 * @param {string} orgId - ID ขององค์กร
 * @returns {Promise<Object|null>} - ข้อมูลองค์กรหรือ null ถ้าไม่พบ
 */
export const getOrganizationById = async (orgId) => {
  try {
    const orgRef = doc(db, 'organizations', orgId);
    const orgSnap = await getDoc(orgRef);
    
    if (!orgSnap.exists()) {
      return null;
    }
    
    const orgData = orgSnap.data();
    return { id: orgSnap.id, ...orgData };
  } catch (error) {
    console.error('Error getting organization by ID:', error);
    throw error;
  }
};

/**
 * อัปเดตข้อมูลองค์กร
 * @param {string} orgId - ID ขององค์กร
 * @param {Object} orgData - ข้อมูลที่ต้องการอัปเดต
 * @returns {Promise<void>}
 */
export const updateOrganization = async (orgId, orgData) => {
  try {
    const orgRef = doc(db, 'organizations', orgId);
    await updateDoc(orgRef, {
      ...orgData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

/**
 * ลบองค์กร
 * @param {string} orgId - ID ขององค์กร
 * @returns {Promise<void>}
 */
export const deleteOrganization = async (orgId) => {
  try {
    const orgRef = doc(db, 'organizations', orgId);
    await deleteDoc(orgRef);
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
};

/**
 * ดึงรายการองค์กรทั้งหมด
 * @param {boolean} activeOnly - ดึงเฉพาะองค์กรที่เปิดใช้งานหรือไม่
 * @returns {Promise<Array>} - รายการองค์กร
 */
export const getAllOrganizations = async (activeOnly = true) => {
  try {
    console.log('getAllOrganizations called with activeOnly:', activeOnly);
    const orgsRef = collection(db, 'organizations');
    let q;
    
    if (activeOnly) {
      q = query(orgsRef, where('isActive', '==', true), orderBy('name'));
    } else {
      q = query(orgsRef, orderBy('name'));
    }
    
    console.log('Executing Firestore query for organizations...');
    const querySnapshot = await getDocs(q);
    
    const organizations = [];
    querySnapshot.forEach((doc) => {
      organizations.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('Organizations retrieved:', organizations.length, organizations);
    return organizations;
  } catch (error) {
    console.error('Error getting all organizations:', error);
    throw error;
  }
};

/**
 * ดึงรายการสาขาขององค์กรหลัก
 * @param {string} parentId - ID ขององค์กรหลัก
 * @returns {Promise<Array>} - รายการสาขา
 */
export const getBranchesOfOrganization = async (parentId) => {
  try {
    const orgsRef = collection(db, 'organizations');
    const q = query(
      orgsRef,
      where('parentId', '==', parentId),
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    
    const branches = [];
    querySnapshot.forEach((doc) => {
      branches.push({ id: doc.id, ...doc.data() });
    });
    
    return branches;
  } catch (error) {
    console.error('Error getting branches of organization:', error);
    throw error;
  }
};

/**
 * ดึงองค์กรหลัก (ไม่มี parentId)
 * @returns {Promise<Array>} - รายการองค์กรหลัก
 */
export const getMainOrganizations = async () => {
  try {
    const orgsRef = collection(db, 'organizations');
    const q = query(
      orgsRef,
      where('parentId', '==', null),
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    
    const mainOrgs = [];
    querySnapshot.forEach((doc) => {
      mainOrgs.push({ id: doc.id, ...doc.data() });
    });
    
    return mainOrgs;
  } catch (error) {
    console.error('Error getting main organizations:', error);
    throw error;
  }
};

/**
 * ค้นหาองค์กรตามชื่อ
 * @param {string} searchText - ข้อความที่ต้องการค้นหา
 * @returns {Promise<Array>} - รายการองค์กรที่ตรงกับการค้นหา
 */
export const searchOrganizations = async (searchText) => {
  try {
    // Firebase Firestore ไม่รองรับการค้นหาแบบ text search ตรงๆ
    // ต้องดึงข้อมูลทั้งหมดมาก่อน แล้วค่อยกรองที่ client
    const orgsRef = collection(db, 'organizations');
    const q = query(orgsRef, where('isActive', '==', true));
    
    const querySnapshot = await getDocs(q);
    
    const searchResults = [];
    const searchTextLower = searchText.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.name.toLowerCase().includes(searchTextLower) ||
        (data.name_en && data.name_en.toLowerCase().includes(searchTextLower)) ||
        (data.name_lo && data.name_lo.toLowerCase().includes(searchTextLower)) ||
        data.code.toLowerCase().includes(searchTextLower)
      ) {
        searchResults.push({ id: doc.id, ...data });
      }
    });
    
    return searchResults;
  } catch (error) {
    console.error('Error searching organizations:', error);
    throw error;
  }
};

/**
 * เปลี่ยนสถานะการใช้งานขององค์กร
 * @param {string} orgId - ID ขององค์กร
 * @param {boolean} isActive - สถานะการใช้งานใหม่
 * @returns {Promise<void>}
 */
export const toggleOrganizationStatus = async (orgId, isActive) => {
  try {
    const orgRef = doc(db, 'organizations', orgId);
    await updateDoc(orgRef, {
      isActive: isActive,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling organization status:', error);
    throw error;
  }
}; 