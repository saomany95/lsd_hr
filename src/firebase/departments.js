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
import { 
  migrateDepartmentOrganization, 
  updateDepartmentOrganizations,
  getOrganizationsByDepartment,
  getDepartmentsByOrganization as getDepartmentIdsByOrganization
} from './departmentOrganizations';

/**
 * departments collection functions
 * 
 * โครงสร้างข้อมูลแผนก:
 * - id: string (auto-generated)
 * - name: string - ชื่อแผนก
 * - name_en: string - ชื่อแผนกภาษาอังกฤษ
 * - name_lo: string - ชื่อแผนกภาษาลาว
 * - code: string - รหัสแผนก
 * - description: string - คำอธิบายแผนก
 * - organizationId: string - ID ขององค์กรที่แผนกสังกัด
 * - parentDepartmentId: string - ID ของแผนกแม่ (null ถ้าเป็นแผนกระดับสูงสุด)
 * - managerId: string - ID ของพนักงานที่เป็นผู้จัดการแผนก
 * - budgetCode: string - รหัสงบประมาณ
 * - costCenter: string - ศูนย์ต้นทุน
 * - isActive: boolean - สถานะการใช้งาน
 * - createdAt: timestamp - วันที่สร้าง
 * - updatedAt: timestamp - วันที่อัปเดตล่าสุด
 */

/**
 * สร้างแผนกใหม่
 * @param {Object} deptData - ข้อมูลแผนก
 * @param {Array<string>} [organizationIds] - รายการ ID ขององค์กรที่แผนกสังกัด (ถ้าไม่ระบุจะใช้ organizationId จาก deptData)
 * @returns {Promise<string>} - ID ของแผนกที่สร้าง
 */
export const createDepartment = async (deptData, organizationIds = []) => {
  try {
    const deptsRef = collection(db, 'departments');
    const docRef = await addDoc(deptsRef, {
      name: deptData.name,
      name_en: deptData.name_en || null,
      name_lo: deptData.name_lo || null,
      code: deptData.code,
      description: deptData.description || null,
      organizationId: deptData.organizationId, // ยังคงเก็บ organizationId หลักไว้เพื่อความเข้ากันได้กับระบบเดิม
      parentDepartmentId: deptData.parentDepartmentId || null,
      managerId: deptData.managerId || null,
      budgetCode: deptData.budgetCode || null,
      costCenter: deptData.costCenter || null,
      isActive: deptData.isActive !== undefined ? deptData.isActive : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const departmentId = docRef.id;
    
    // ถ้ามีการระบุ organizationIds ให้บันทึกความสัมพันธ์
    if (organizationIds && organizationIds.length > 0) {
      await updateDepartmentOrganizations(departmentId, organizationIds);
    } 
    // ถ้าไม่ได้ระบุ organizationIds แต่มี organizationId ให้ย้ายไปยังความสัมพันธ์ใหม่
    else if (deptData.organizationId) {
      await migrateDepartmentOrganization(departmentId, deptData.organizationId);
    }
    
    return departmentId;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลแผนกจาก ID พร้อมข้อมูลองค์กรที่เกี่ยวข้อง
 * @param {string} deptId - ID ของแผนก
 * @returns {Promise<Object|null>} - ข้อมูลแผนกหรือ null ถ้าไม่พบ
 */
export const getDepartmentById = async (deptId) => {
  try {
    const deptRef = doc(db, 'departments', deptId);
    const deptSnap = await getDoc(deptRef);
    
    if (!deptSnap.exists()) {
      return null;
    }
    
    const deptData = deptSnap.data();
    
    // ดึงรายการองค์กรที่เกี่ยวข้อง
    const relatedOrganizationIds = await getOrganizationsByDepartment(deptId);
    
    // เพิ่มรายการองค์กรที่เกี่ยวข้องเข้าไปในข้อมูลแผนก
    return { 
      id: deptSnap.id, 
      ...deptData,
      relatedOrganizationIds 
    };
  } catch (error) {
    console.error('Error getting department by ID:', error);
    throw error;
  }
};

/**
 * อัปเดตข้อมูลแผนก
 * @param {string} deptId - ID ของแผนก
 * @param {Object} deptData - ข้อมูลที่ต้องการอัปเดต
 * @param {Array<string>} [organizationIds] - รายการ ID ขององค์กรที่แผนกสังกัด
 * @returns {Promise<void>}
 */
export const updateDepartment = async (deptId, deptData, organizationIds) => {
  try {
    const deptRef = doc(db, 'departments', deptId);
    await updateDoc(deptRef, {
      ...deptData,
      updatedAt: serverTimestamp()
    });
    
    // ถ้ามีการระบุ organizationIds ให้อัปเดตความสัมพันธ์
    if (organizationIds !== undefined) {
      await updateDepartmentOrganizations(deptId, organizationIds);
    }
    // ถ้าไม่ได้ระบุ organizationIds แต่มีการเปลี่ยน organizationId หลัก ให้อัปเดตความสัมพันธ์ด้วย
    else if (deptData.organizationId) {
      // ทำการ migrate เฉพาะเมื่อมีการเปลี่ยน organizationId
      const currentDept = await getDepartmentById(deptId);
      if (currentDept && currentDept.organizationId !== deptData.organizationId) {
        await migrateDepartmentOrganization(deptId, deptData.organizationId);
      }
    }
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

/**
 * ลบแผนก
 * @param {string} deptId - ID ของแผนก
 * @returns {Promise<void>}
 */
export const deleteDepartment = async (deptId) => {
  try {
    const deptRef = doc(db, 'departments', deptId);
    await deleteDoc(deptRef);
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};

/**
 * ดึงรายการแผนกทั้งหมด
 * @param {boolean} activeOnly - ดึงเฉพาะแผนกที่เปิดใช้งานหรือไม่
 * @returns {Promise<Array>} - รายการแผนก
 */
export const getAllDepartments = async (activeOnly = true) => {
  try {
    const deptsRef = collection(db, 'departments');
    let q;
    
    if (activeOnly) {
      q = query(deptsRef, where('isActive', '==', true), orderBy('name'));
    } else {
      q = query(deptsRef, orderBy('name'));
    }
    
    const querySnapshot = await getDocs(q);
    
    const departments = [];
    querySnapshot.forEach((doc) => {
      departments.push({ id: doc.id, ...doc.data() });
    });
    
    return departments;
  } catch (error) {
    console.error('Error getting all departments:', error);
    throw error;
  }
};

/**
 * ดึงรายการแผนกขององค์กร
 * @param {string} organizationId - ID ขององค์กร
 * @param {boolean} activeOnly - ดึงเฉพาะแผนกที่เปิดใช้งานหรือไม่
 * @returns {Promise<Array>} - รายการแผนก
 */
export const getDepartmentsByOrganization = async (organizationId, activeOnly = true) => {
  try {
    // 1. ดึงแผนกที่มี organizationId ตรงกับที่ระบุ (วิธีเดิม)
    const deptsRef = collection(db, 'departments');
    let q;
    
    if (activeOnly) {
      q = query(
        deptsRef,
        where('organizationId', '==', organizationId),
        where('isActive', '==', true),
        orderBy('name')
      );
    } else {
      q = query(
        deptsRef,
        where('organizationId', '==', organizationId),
        orderBy('name')
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const departments = [];
    const departmentIds = new Set(); // ใช้ Set เพื่อป้องกันข้อมูลซ้ำ
    
    querySnapshot.forEach((doc) => {
      departments.push({ id: doc.id, ...doc.data() });
      departmentIds.add(doc.id);
    });
    
    // 2. ดึงรายการแผนกจากความสัมพันธ์ใน departmentOrganizations
    const relationsRef = collection(db, 'departmentOrganizations');
    const relationsQuery = query(
      relationsRef,
      where('organizationId', '==', organizationId),
      where('isActive', '==', true)
    );
    
    const relationsSnapshot = await getDocs(relationsQuery);
    const relatedDeptIds = [];
    
    relationsSnapshot.forEach((doc) => {
      relatedDeptIds.push(doc.data().departmentId);
    });
    
    // 3. ดึงข้อมูลแผนกจาก IDs ที่ได้จาก departmentOrganizations
    for (const deptId of relatedDeptIds) {
      // ข้ามถ้าเป็น ID ที่มีอยู่แล้ว
      if (departmentIds.has(deptId)) continue;
      
      const deptRef = doc(db, 'departments', deptId);
      const deptSnap = await getDoc(deptRef);
      
      if (deptSnap.exists()) {
        const deptData = deptSnap.data();
        
        // ตรวจสอบเงื่อนไข activeOnly
        if (!activeOnly || deptData.isActive) {
          departments.push({ id: deptId, ...deptData });
          departmentIds.add(deptId);
        }
      }
    }
    
    // เรียงลำดับตามชื่อแผนก
    departments.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });
    
    return departments;
  } catch (error) {
    console.error('Error getting departments by organization:', error);
    throw error;
  }
};

/**
 * ดึงรายการแผนกย่อยของแผนกหลัก
 * @param {string} parentDepartmentId - ID ของแผนกหลัก
 * @returns {Promise<Array>} - รายการแผนกย่อย
 */
export const getSubDepartments = async (parentDepartmentId) => {
  try {
    const deptsRef = collection(db, 'departments');
    const q = query(
      deptsRef,
      where('parentDepartmentId', '==', parentDepartmentId),
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    
    const subDepartments = [];
    querySnapshot.forEach((doc) => {
      subDepartments.push({ id: doc.id, ...doc.data() });
    });
    
    return subDepartments;
  } catch (error) {
    console.error('Error getting sub-departments:', error);
    throw error;
  }
};

/**
 * ดึงแผนกหลัก (ไม่มี parentDepartmentId) ขององค์กร
 * @param {string} organizationId - ID ขององค์กร
 * @returns {Promise<Array>} - รายการแผนกหลัก
 */
export const getMainDepartments = async (organizationId) => {
  try {
    const deptsRef = collection(db, 'departments');
    const q = query(
      deptsRef,
      where('organizationId', '==', organizationId),
      where('parentDepartmentId', '==', null),
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    
    const mainDepartments = [];
    querySnapshot.forEach((doc) => {
      mainDepartments.push({ id: doc.id, ...doc.data() });
    });
    
    return mainDepartments;
  } catch (error) {
    console.error('Error getting main departments:', error);
    throw error;
  }
};

/**
 * ค้นหาแผนกตามชื่อ
 * @param {string} searchText - ข้อความที่ต้องการค้นหา
 * @param {string} organizationId - ID ขององค์กร (optional)
 * @returns {Promise<Array>} - รายการแผนกที่ตรงกับการค้นหา
 */
export const searchDepartments = async (searchText, organizationId = null) => {
  try {
    const deptsRef = collection(db, 'departments');
    let q;
    
    if (organizationId) {
      q = query(
        deptsRef,
        where('organizationId', '==', organizationId),
        where('isActive', '==', true)
      );
    } else {
      q = query(deptsRef, where('isActive', '==', true));
    }
    
    const querySnapshot = await getDocs(q);
    
    const searchResults = [];
    const searchTextLower = searchText.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.name.toLowerCase().includes(searchTextLower) ||
        (data.name_en && data.name_en.toLowerCase().includes(searchTextLower)) ||
        (data.name_lo && data.name_lo.toLowerCase().includes(searchTextLower)) ||
        data.code.toLowerCase().includes(searchTextLower) ||
        (data.description && data.description.toLowerCase().includes(searchTextLower))
      ) {
        searchResults.push({ id: doc.id, ...data });
      }
    });
    
    return searchResults;
  } catch (error) {
    console.error('Error searching departments:', error);
    throw error;
  }
};

/**
 * เปลี่ยนสถานะการใช้งานของแผนก
 * @param {string} deptId - ID ของแผนก
 * @param {boolean} isActive - สถานะการใช้งานใหม่
 * @returns {Promise<void>}
 */
export const toggleDepartmentStatus = async (deptId, isActive) => {
  try {
    const deptRef = doc(db, 'departments', deptId);
    await updateDoc(deptRef, {
      isActive: isActive,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling department status:', error);
    throw error;
  }
};

/**
 * อัปเดตผู้จัดการแผนก
 * @param {string} deptId - ID ของแผนก
 * @param {string} managerId - ID ของพนักงานที่เป็นผู้จัดการใหม่
 * @returns {Promise<void>}
 */
export const updateDepartmentManager = async (deptId, managerId) => {
  try {
    const deptRef = doc(db, 'departments', deptId);
    await updateDoc(deptRef, {
      managerId: managerId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating department manager:', error);
    throw error;
  }
}; 