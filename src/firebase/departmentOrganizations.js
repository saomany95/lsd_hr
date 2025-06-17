'use client';

import { db } from './config';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * departmentOrganizations collection functions
 * 
 * โครงสร้างข้อมูลความสัมพันธ์ระหว่างแผนกและองค์กร:
 * - id: string (auto-generated)
 * - departmentId: string - ID ของแผนก
 * - organizationId: string - ID ขององค์กร
 * - isActive: boolean - สถานะการใช้งาน
 * - createdAt: timestamp - วันที่สร้าง
 * - updatedAt: timestamp - วันที่อัปเดตล่าสุด
 */

/**
 * เพิ่มความสัมพันธ์ระหว่างแผนกและองค์กร
 * @param {string} departmentId - ID ของแผนก
 * @param {string} organizationId - ID ขององค์กร
 * @returns {Promise<string>} - ID ของความสัมพันธ์ที่สร้าง
 */
export const addDepartmentToOrganization = async (departmentId, organizationId) => {
  try {
    // ตรวจสอบว่าความสัมพันธ์นี้มีอยู่แล้วหรือไม่
    const existingRelation = await getDepartmentOrganizationRelation(departmentId, organizationId);
    if (existingRelation) {
      console.log('Relation already exists:', existingRelation);
      return existingRelation.id; // ถ้ามีอยู่แล้ว ให้คืน ID เดิม
    }

    // สร้างความสัมพันธ์ใหม่
    const relationRef = collection(db, 'departmentOrganizations');
    const docRef = await addDoc(relationRef, {
      departmentId,
      organizationId,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding department to organization:', error);
    throw error;
  }
};

/**
 * ลบความสัมพันธ์ระหว่างแผนกและองค์กร
 * @param {string} departmentId - ID ของแผนก
 * @param {string} organizationId - ID ขององค์กร
 * @returns {Promise<void>}
 */
export const removeDepartmentFromOrganization = async (departmentId, organizationId) => {
  try {
    // ค้นหาความสัมพันธ์
    const relation = await getDepartmentOrganizationRelation(departmentId, organizationId);
    
    if (relation) {
      // ลบความสัมพันธ์
      const relationRef = doc(db, 'departmentOrganizations', relation.id);
      await deleteDoc(relationRef);
    }
  } catch (error) {
    console.error('Error removing department from organization:', error);
    throw error;
  }
};

/**
 * ค้นหาความสัมพันธ์ระหว่างแผนกและองค์กร
 * @param {string} departmentId - ID ของแผนก
 * @param {string} organizationId - ID ขององค์กร
 * @returns {Promise<Object|null>} - ข้อมูลความสัมพันธ์หรือ null ถ้าไม่พบ
 */
export const getDepartmentOrganizationRelation = async (departmentId, organizationId) => {
  try {
    const relationsRef = collection(db, 'departmentOrganizations');
    const q = query(
      relationsRef,
      where('departmentId', '==', departmentId),
      where('organizationId', '==', organizationId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // ส่งคืนความสัมพันธ์แรกที่พบ
    const relation = querySnapshot.docs[0];
    return { id: relation.id, ...relation.data() };
  } catch (error) {
    console.error('Error getting department organization relation:', error);
    throw error;
  }
};

/**
 * ดึงรายการองค์กรที่เกี่ยวข้องกับแผนก
 * @param {string} departmentId - ID ของแผนก
 * @returns {Promise<Array>} - รายการ organizationId
 */
export const getOrganizationsByDepartment = async (departmentId) => {
  try {
    const relationsRef = collection(db, 'departmentOrganizations');
    const q = query(
      relationsRef,
      where('departmentId', '==', departmentId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    const organizationIds = [];
    querySnapshot.forEach((doc) => {
      organizationIds.push(doc.data().organizationId);
    });
    
    return organizationIds;
  } catch (error) {
    console.error('Error getting organizations by department:', error);
    throw error;
  }
};

/**
 * ดึงรายการแผนกที่เกี่ยวข้องกับองค์กร
 * @param {string} organizationId - ID ขององค์กร
 * @returns {Promise<Array>} - รายการ departmentId
 */
export const getDepartmentsByOrganization = async (organizationId) => {
  try {
    const relationsRef = collection(db, 'departmentOrganizations');
    const q = query(
      relationsRef,
      where('organizationId', '==', organizationId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    const departmentIds = [];
    querySnapshot.forEach((doc) => {
      departmentIds.push(doc.data().departmentId);
    });
    
    return departmentIds;
  } catch (error) {
    console.error('Error getting departments by organization:', error);
    throw error;
  }
};

/**
 * อัปเดตความสัมพันธ์ระหว่างแผนกและองค์กรทั้งหมด
 * สร้างความสัมพันธ์ใหม่และลบความสัมพันธ์เก่าตามที่กำหนด
 * @param {string} departmentId - ID ของแผนก
 * @param {Array<string>} organizationIds - รายการ ID ขององค์กรที่ต้องการให้มีความสัมพันธ์
 * @returns {Promise<void>}
 */
export const updateDepartmentOrganizations = async (departmentId, organizationIds) => {
  try {
    // ดึงความสัมพันธ์ปัจจุบัน
    const currentOrganizationIds = await getOrganizationsByDepartment(departmentId);
    
    // หา organizationIds ที่ต้องเพิ่ม
    const organizationsToAdd = organizationIds.filter(id => !currentOrganizationIds.includes(id));
    
    // หา organizationIds ที่ต้องลบ
    const organizationsToRemove = currentOrganizationIds.filter(id => !organizationIds.includes(id));
    
    // เพิ่มความสัมพันธ์ใหม่
    for (const orgId of organizationsToAdd) {
      await addDepartmentToOrganization(departmentId, orgId);
    }
    
    // ลบความสัมพันธ์เก่า
    for (const orgId of organizationsToRemove) {
      await removeDepartmentFromOrganization(departmentId, orgId);
    }
  } catch (error) {
    console.error('Error updating department organizations:', error);
    throw error;
  }
};

/**
 * ย้ายข้อมูลความสัมพันธ์จาก organizationId ในคอลเลคชั่น departments 
 * ไปยังคอลเลคชั่น departmentOrganizations
 * @param {string} departmentId - ID ของแผนก
 * @param {string} organizationId - ID ขององค์กรที่อยู่ในฟิลด์ organizationId เดิม
 * @returns {Promise<void>}
 */
export const migrateDepartmentOrganization = async (departmentId, organizationId) => {
  if (!organizationId) return; // ไม่มี organizationId ไม่ต้องทำอะไร
  
  try {
    await addDepartmentToOrganization(departmentId, organizationId);
  } catch (error) {
    console.error('Error migrating department organization:', error);
    throw error;
  }
}; 