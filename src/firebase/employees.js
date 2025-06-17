'use client';

import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';
import { getUserById } from './users';

// Collection names
const EMPLOYEES_COLLECTION = 'employees';

/**
 * ดึงข้อมูลพนักงานทั้งหมด
 * @param {boolean} activeOnly - ดึงเฉพาะพนักงานที่ยังทำงานอยู่
 * @returns {Promise<Array>} - รายการข้อมูลพนักงาน
 */
export const getAllEmployees = async (activeOnly = false) => {
  try {
    const employeesRef = collection(db, EMPLOYEES_COLLECTION);
    let employeesQuery;
    
    if (activeOnly) {
      employeesQuery = query(employeesRef, where('isActive', '==', true), orderBy('firstName'));
    } else {
      employeesQuery = query(employeesRef, orderBy('firstName'));
    }
    
    const querySnapshot = await getDocs(employeesQuery);
    const employees = [];
    
    querySnapshot.forEach((doc) => {
      employees.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return employees;
  } catch (error) {
    console.error('Error getting employees:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลพนักงานตาม ID
 * @param {string} id - ID ของพนักงาน
 * @returns {Promise<Object|null>} - ข้อมูลพนักงานหรือ null ถ้าไม่พบ
 */
export const getEmployeeById = async (id) => {
  try {
    const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, id));
    
    if (employeeDoc.exists()) {
      return {
        id: employeeDoc.id,
        ...employeeDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting employee by ID:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลพนักงานตาม User ID
 * @param {string} userId - ID ของผู้ใช้
 * @returns {Promise<Object|null>} - ข้อมูลพนักงานหรือ null ถ้าไม่พบ
 */
export const getEmployeeByUserId = async (userId) => {
  try {
    const employeesRef = collection(db, EMPLOYEES_COLLECTION);
    const q = query(employeesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const employeeDoc = querySnapshot.docs[0];
      return {
        id: employeeDoc.id,
        ...employeeDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting employee by user ID:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลพนักงานตามรหัสพนักงาน
 * @param {string} employeeId - รหัสพนักงาน
 * @returns {Object} ข้อมูลพนักงาน
 */
export const getEmployeeByEmployeeId = async (employeeId) => {
  try {
    const employeesRef = collection(db, EMPLOYEES_COLLECTION);
    const q = query(employeesRef, where('employmentInfo.employeeId', '==', employeeId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      throw new Error('ບໍ່ພົບຂໍ້ມູນພະນັກງານ');
    }
  } catch (error) {
    console.error('Error getting employee by employee ID:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลพนักงานตามเบอร์โทรศัพท์
 * @param {string} phone - เบอร์โทรศัพท์
 * @returns {Object} ข้อมูลพนักงาน
 */
export const getEmployeeByPhone = async (phone) => {
  try {
    const employeesRef = collection(db, EMPLOYEES_COLLECTION);
    const q = query(employeesRef, where('personalInfo.contactPhone', '==', phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      throw new Error('ບໍ່ພົບຂໍ້ມູນພະນັກງານ');
    }
  } catch (error) {
    console.error('Error getting employee by phone:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลพนักงานตามแผนก
 * @param {string} departmentId - รหัสแผนก
 * @returns {Array} รายการพนักงานในแผนก
 */
export const getEmployeesByDepartment = async (departmentId) => {
  try {
    const employeesRef = collection(db, EMPLOYEES_COLLECTION);
    const q = query(employeesRef, where('employmentInfo.departmentId', '==', departmentId));
    const querySnapshot = await getDocs(q);
    
    const employees = [];
    querySnapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });
    
    return employees;
  } catch (error) {
    console.error('Error getting employees by department:', error);
    throw error;
  }
};

/**
 * สร้างข้อมูลพนักงานใหม่
 * @param {Object} employeeData - ข้อมูลพนักงาน
 * @returns {Promise<string>} - ID ของพนักงานที่สร้าง
 */
export const createEmployee = async (employeeData) => {
  try {
    // เพิ่มการประทับเวลาการสร้าง/แก้ไข
    const dataToSave = {
      ...employeeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // ถ้ามี employeeId ใช้ setDoc ด้วย id ที่กำหนด
    if (employeeData.employeeId) {
      const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeData.employeeId);
      await setDoc(employeeRef, dataToSave);
      return employeeData.employeeId;
    } 
    // ถ้าไม่มี employeeId ให้ Firestore สร้าง id ให้อัตโนมัติ
    else {
      const employeeRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), dataToSave);
      return employeeRef.id;
    }
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

/**
 * อัปเดตข้อมูลพนักงาน
 * @param {string} id - ID ของพนักงาน
 * @param {Object} employeeData - ข้อมูลพนักงานที่ต้องการอัปเดต
 * @returns {Promise<void>}
 */
export const updateEmployee = async (id, employeeData) => {
  try {
    // ดึงข้อมูลตำแหน่งจาก positionId ถ้ามี
    if (employeeData.employmentInfo && employeeData.employmentInfo.positionId) {
      try {
        const { getPositionById } = await import('./positions');
        const position = await getPositionById(employeeData.employmentInfo.positionId);
        
        console.log('Found position data:', position);
        
        if (position) {
          // อัปเดตชื่อตำแหน่งใน employmentInfo
          employeeData.employmentInfo.positionName = position.title || position.name || position.title_lo || position.name_lo;
          console.log('Updated position name:', employeeData.employmentInfo.positionName);
        }
      } catch (error) {
        console.error('Error fetching position data:', error);
      }
    }
    
    // เพิ่ม timestamp
    const dataWithTimestamp = {
      ...employeeData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(doc(db, EMPLOYEES_COLLECTION, id), dataWithTimestamp);
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

/**
 * ลบข้อมูลพนักงาน
 * @param {string} id - ID ของพนักงาน
 * @returns {Promise<void>}
 */
export const deleteEmployee = async (id) => {
  try {
    await deleteDoc(doc(db, EMPLOYEES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

/**
 * ค้นหาพนักงานตามคำค้นหา
 * @param {string} searchTerm - คำค้นหา
 * @returns {Promise<Array>} - รายการพนักงานที่ค้นพบ
 */
export const searchEmployees = async (searchTerm) => {
  try {
    const employees = await getAllEmployees();
    
    // ทำคำค้นหาเป็นตัวพิมพ์เล็กและลบช่องว่างที่ไม่จำเป็น
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    // กรองพนักงานตามคำค้นหา
    return employees.filter(employee => {
      const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase();
      const fullNameLao = `${employee.firstName_lo || ''} ${employee.lastName_lo || ''}`.toLowerCase();
      const email = (employee.email || '').toLowerCase();
      const phone = (employee.phoneNumber || '').toLowerCase();
      const employeeId = (employee.employeeId || '').toLowerCase();
      const department = (employee.departmentName || '').toLowerCase();
      const position = (employee.positionName || '').toLowerCase();
      
      return (
        fullName.includes(normalizedSearchTerm) ||
        fullNameLao.includes(normalizedSearchTerm) ||
        email.includes(normalizedSearchTerm) ||
        phone.includes(normalizedSearchTerm) ||
        employeeId.includes(normalizedSearchTerm) ||
        department.includes(normalizedSearchTerm) ||
        position.includes(normalizedSearchTerm)
      );
    });
  } catch (error) {
    console.error('Error searching employees:', error);
    throw error;
  }
};

/**
 * อัปเดตสถานะการทำงานของพนักงาน
 * @param {string} id - ID ของพนักงาน
 * @param {string} status - สถานะการทำงานใหม่ ('active', 'on-leave', 'terminated')
 * @returns {boolean} สถานะการอัปเดต
 */
export const updateEmploymentStatus = async (id, status) => {
  try {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, id);
    await updateDoc(employeeRef, {
      'employmentInfo.status': status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating employment status:', error);
    throw error;
  }
};

/**
 * ดึงพนักงานตามสถานะการทำงาน
 * @param {string} status - สถานะการทำงาน ('active', 'on-leave', 'terminated')
 * @returns {Array} รายการพนักงานตามสถานะ
 */
export const getEmployeesByStatus = async (status) => {
  try {
    const employeesRef = collection(db, EMPLOYEES_COLLECTION);
    const q = query(employeesRef, where('employmentInfo.status', '==', status));
    const querySnapshot = await getDocs(q);
    
    const employees = [];
    querySnapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });
    
    return employees;
  } catch (error) {
    console.error('Error getting employees by status:', error);
    throw error;
  }
};

/**
 * เชื่อมโยงพนักงานกับบัญชีผู้ใช้
 * @param {string} employeeId - ID ของพนักงาน
 * @param {string} userId - ID ของผู้ใช้
 * @returns {Promise<void>}
 */
export const linkEmployeeToUser = async (employeeId, userId) => {
  try {
    // อัปเดตข้อมูลพนักงาน
    await updateDoc(doc(db, EMPLOYEES_COLLECTION, employeeId), {
      userId: userId,
      updatedAt: serverTimestamp()
    });
    
    // ดึงข้อมูลผู้ใช้
    const user = await getUserById(userId);
    
    // อัปเดตข้อมูลผู้ใช้ (เพิ่ม employeeId)
    if (user) {
      await updateDoc(doc(db, 'users', userId), {
        employeeId: employeeId,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error linking employee to user:', error);
    throw error;
  }
};

/**
 * ยกเลิกการเชื่อมโยงพนักงานกับบัญชีผู้ใช้
 * @param {string} employeeId - ID ของพนักงาน
 * @returns {Promise<void>}
 */
export const unlinkEmployeeFromUser = async (employeeId) => {
  try {
    // ดึงข้อมูลพนักงาน
    const employee = await getEmployeeById(employeeId);
    
    if (employee && employee.userId) {
      // อัปเดตข้อมูลผู้ใช้ (ลบ employeeId)
      await updateDoc(doc(db, 'users', employee.userId), {
        employeeId: null,
        updatedAt: serverTimestamp()
      });
      
      // อัปเดตข้อมูลพนักงาน (ลบ userId)
      await updateDoc(doc(db, EMPLOYEES_COLLECTION, employeeId), {
        userId: null,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error unlinking employee from user:', error);
    throw error;
  }
};

/**
 * แก้ไข userId ของพนักงาน
 * @param {string} employeeId - ID ของพนักงาน
 * @param {string} newUserId - userId ใหม่
 * @returns {Promise<void>}
 */
export const updateEmployeeUserId = async (employeeId, newUserId) => {
  try {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    
    // อัปเดตเฉพาะฟิลด์ userId
    await updateDoc(employeeRef, {
      userId: newUserId,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Updated employee ${employeeId} with new userId: ${newUserId}`);
    return true;
  } catch (error) {
    console.error('Error updating employee userId:', error);
    throw error;
  }
};

/**
 * ซิงค์ข้อมูลระหว่าง employee และ user
 * @param {string} employeeId - ID ของพนักงาน
 * @param {boolean} forceSync - บังคับซิงค์แม้ว่าข้อมูลจะมีอยู่แล้ว
 * @returns {Promise<Object>} - ผลการซิงค์
 */
export const syncEmployeeWithUserData = async (employeeId, forceSync = false) => {
  try {
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
      throw new Error(`ไม่พบข้อมูลพนักงาน ID: ${employeeId}`);
    }
    
    if (!employee.userId) {
      return {
        success: false,
        message: "ไม่มี userId ในข้อมูลพนักงาน",
        employee
      };
    }
    
    const user = await getUserById(employee.userId);
    if (!user) {
      return {
        success: false,
        message: `ไม่พบข้อมูลผู้ใช้ ID: ${employee.userId}`,
        employee
      };
    }
    
    // ข้อมูลที่จะอัปเดต
    const updatedData = {
      personalInfo: { ...employee.personalInfo }
    };
    let hasChanges = false;
    
    // ซิงค์ข้อมูลชื่อภาษาอังกฤษ
    if ((!employee.personalInfo.firstName_lo || forceSync) && user.firstName_lo) {
      updatedData.personalInfo.firstName_lo = user.firstName_lo;
      hasChanges = true;
    }
    
    if ((!employee.personalInfo.lastName_lo || forceSync) && user.lastName_lo) {
      updatedData.personalInfo.lastName_lo = user.lastName_lo;
      hasChanges = true;
    }
    
    // ซิงค์ข้อมูลการติดต่อ
    if ((!employee.personalInfo.contactEmail || forceSync) && user.email) {
      updatedData.personalInfo.contactEmail = user.email;
      hasChanges = true;
    }
    
    if ((!employee.personalInfo.contactPhone || forceSync) && user.phoneNumber) {
      updatedData.personalInfo.contactPhone = user.phoneNumber;
      hasChanges = true;
    }
    
    // อัปเดตข้อมูลถ้ามีการเปลี่ยนแปลง
    if (hasChanges) {
      await updateEmployee(employeeId, updatedData);
      
      return {
        success: true,
        message: "ซิงค์ข้อมูลสำเร็จ",
        changes: {
          firstName_lo: updatedData.personalInfo.firstName_lo !== employee.personalInfo.firstName_lo,
          lastName_lo: updatedData.personalInfo.lastName_lo !== employee.personalInfo.lastName_lo,
          contactEmail: updatedData.personalInfo.contactEmail !== employee.personalInfo.contactEmail,
          contactPhone: updatedData.personalInfo.contactPhone !== employee.personalInfo.contactPhone
        },
        employee: await getEmployeeById(employeeId) // ดึงข้อมูลล่าสุดหลังอัปเดต
      };
    } else {
      return {
        success: true,
        message: "ไม่มีข้อมูลที่ต้องซิงค์",
        employee
      };
    }
  } catch (error) {
    console.error('Error syncing employee with user data:', error);
    throw error;
  }
};

/**
 * รีเซ็ตและซิงค์ข้อมูลพนักงานใหม่จาก users collection
 * @param {string} employeeId - ID ของพนักงาน
 * @returns {Promise<Object>} - ผลการรีเซ็ตและซิงค์ข้อมูล
 */
export const resetEmployeeData = async (employeeId) => {
  try {
    // ดึงข้อมูลพนักงาน
    const employee = await getEmployeeById(employeeId);
    if (!employee) {
      throw new Error(`ไม่พบข้อมูลพนักงาน ID: ${employeeId}`);
    }
    
    // ตรวจสอบว่ามี userId หรือไม่
    if (!employee.userId) {
      return {
        success: false,
        message: "ไม่มี userId ในข้อมูลพนักงาน ไม่สามารถซิงค์ข้อมูลได้",
        employee
      };
    }
    
    // ดึงข้อมูลผู้ใช้
    const user = await getUserById(employee.userId);
    if (!user) {
      return {
        success: false,
        message: `ไม่พบข้อมูลผู้ใช้ ID: ${employee.userId}`,
        employee
      };
    }
    
    // เก็บข้อมูลสำคัญที่ต้องการเก็บไว้
    const preservedData = {
      employmentInfo: employee.employmentInfo || {},
      payrollInfo: employee.payrollInfo || {},
      isActive: employee.isActive,
      userId: employee.userId
    };
    
    // สร้างข้อมูลใหม่จากข้อมูลผู้ใช้
    const newData = {
      ...preservedData,
      personalInfo: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        firstName_lo: user.firstName_lo || '',
        lastName_lo: user.lastName_lo || '',
        contactEmail: user.email || '',
        contactPhone: user.phoneNumber || '',
        gender: employee.personalInfo?.gender || 'male',
        dateOfBirth: employee.personalInfo?.dateOfBirth || '',
        nationalId: employee.personalInfo?.nationalId || '',
        nationality: employee.personalInfo?.nationality || 'lao',
        maritalStatus: employee.personalInfo?.maritalStatus || 'single',
        address: employee.personalInfo?.address || { village: '', district: '', province: '' }
      },
      // เพิ่มข้อมูลในรูปแบบเก่าสำหรับความเข้ากันได้
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      firstName_lo: user.firstName_lo || '',
      lastName_lo: user.lastName_lo || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      updatedAt: serverTimestamp()
    };
    
    // อัปเดตข้อมูลพนักงาน
    await updateDoc(doc(db, EMPLOYEES_COLLECTION, employeeId), newData);
    
    return {
      success: true,
      message: "รีเซ็ตและซิงค์ข้อมูลพนักงานสำเร็จ",
      employee: await getEmployeeById(employeeId) // ดึงข้อมูลล่าสุดหลังอัปเดต
    };
  } catch (error) {
    console.error('Error resetting employee data:', error);
    throw error;
  }
};