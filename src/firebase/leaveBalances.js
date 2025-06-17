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
  Timestamp,
  increment
} from 'firebase/firestore';

/**
 * leaveBalances collection functions
 * 
 * โครงสร้างข้อมูลวันลาคงเหลือ:
 * - id: string (auto-generated)
 * - userId: string - ID ของพนักงาน
 * - year: number - ปี (เช่น 2025)
 * - leaveTypes: object - ประเภทการลาและจำนวนวันลาคงเหลือ
 *   - sick: { total: number, used: number, pending: number, remaining: number }
 *   - vacation: { total: number, used: number, pending: number, remaining: number }
 *   - personal: { total: number, used: number, pending: number, remaining: number }
 *   - maternity: { total: number, used: number, pending: number, remaining: number }
 *   - paternity: { total: number, used: number, pending: number, remaining: number }
 *   - other: { total: number, used: number, pending: number, remaining: number }
 * - adjustments: array - การปรับแก้ไขวันลา
 *   - [{ type: string, amount: number, reason: string, approvedBy: string, date: timestamp }]
 * - createdAt: timestamp - วันที่สร้าง
 * - updatedAt: timestamp - วันที่อัปเดตล่าสุด
 */

/**
 * สร้างวันลาคงเหลือสำหรับพนักงานในปีใหม่
 * @param {Object} balanceData - ข้อมูลวันลาคงเหลือ
 * @returns {Promise<string>} - ID ของวันลาคงเหลือที่สร้าง
 */
export const createLeaveBalance = async (balanceData) => {
  try {
    const leaveBalancesRef = collection(db, 'leaveBalances');
    const docRef = await addDoc(leaveBalancesRef, {
      userId: balanceData.userId,
      year: balanceData.year,
      leaveTypes: {
        sick: {
          total: balanceData.leaveTypes?.sick?.total || 30,
          used: balanceData.leaveTypes?.sick?.used || 0,
          pending: balanceData.leaveTypes?.sick?.pending || 0,
          remaining: balanceData.leaveTypes?.sick?.total || 30
        },
        vacation: {
          total: balanceData.leaveTypes?.vacation?.total || 10,
          used: balanceData.leaveTypes?.vacation?.used || 0,
          pending: balanceData.leaveTypes?.vacation?.pending || 0,
          remaining: balanceData.leaveTypes?.vacation?.total || 10
        },
        personal: {
          total: balanceData.leaveTypes?.personal?.total || 3,
          used: balanceData.leaveTypes?.personal?.used || 0,
          pending: balanceData.leaveTypes?.personal?.pending || 0,
          remaining: balanceData.leaveTypes?.personal?.total || 3
        },
        maternity: {
          total: balanceData.leaveTypes?.maternity?.total || 90,
          used: balanceData.leaveTypes?.maternity?.used || 0,
          pending: balanceData.leaveTypes?.maternity?.pending || 0,
          remaining: balanceData.leaveTypes?.maternity?.total || 90
        },
        paternity: {
          total: balanceData.leaveTypes?.paternity?.total || 5,
          used: balanceData.leaveTypes?.paternity?.used || 0,
          pending: balanceData.leaveTypes?.paternity?.pending || 0,
          remaining: balanceData.leaveTypes?.paternity?.total || 5
        },
        other: {
          total: balanceData.leaveTypes?.other?.total || 0,
          used: balanceData.leaveTypes?.other?.used || 0,
          pending: balanceData.leaveTypes?.other?.pending || 0,
          remaining: balanceData.leaveTypes?.other?.total || 0
        }
      },
      adjustments: balanceData.adjustments || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating leave balance:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลวันลาคงเหลือจาก ID
 * @param {string} balanceId - ID ของวันลาคงเหลือ
 * @returns {Promise<Object|null>} - ข้อมูลวันลาคงเหลือหรือ null ถ้าไม่พบ
 */
export const getLeaveBalanceById = async (balanceId) => {
  try {
    const balanceRef = doc(db, 'leaveBalances', balanceId);
    const balanceSnap = await getDoc(balanceRef);
    
    if (!balanceSnap.exists()) {
      return null;
    }
    
    const balanceData = balanceSnap.data();
    return { id: balanceSnap.id, ...balanceData };
  } catch (error) {
    console.error('Error getting leave balance by ID:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลวันลาคงเหลือของพนักงานในปีที่ระบุ
 * @param {string} userId - ID ของพนักงาน
 * @param {number} year - ปีที่ต้องการดึงข้อมูล
 * @returns {Promise<Object|null>} - ข้อมูลวันลาคงเหลือหรือ null ถ้าไม่พบ
 */
export const getLeaveBalanceByUserAndYear = async (userId, year) => {
  try {
    const leaveBalancesRef = collection(db, 'leaveBalances');
    const q = query(
      leaveBalancesRef,
      where('userId', '==', userId),
      where('year', '==', year)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const balanceDoc = querySnapshot.docs[0];
    return { id: balanceDoc.id, ...balanceDoc.data() };
  } catch (error) {
    console.error('Error getting leave balance by user and year:', error);
    throw error;
  }
};

/**
 * อัปเดตวันลาที่ใช้ไป
 * @param {string} balanceId - ID ของวันลาคงเหลือ
 * @param {string} leaveType - ประเภทการลา (sick, vacation, personal, maternity, paternity, other)
 * @param {number} days - จำนวนวันที่ใช้ไป
 * @returns {Promise<void>}
 */
export const updateLeaveUsed = async (balanceId, leaveType, days) => {
  try {
    const balanceRef = doc(db, 'leaveBalances', balanceId);
    
    // ต้องเข้าถึง field ซ้อน (nested field) ใน Firestore
    const fieldPath = `leaveTypes.${leaveType}.used`;
    const remainingPath = `leaveTypes.${leaveType}.remaining`;
    
    // ใช้ increment ของ Firestore เพื่อเพิ่มค่าโดยไม่ต้องอ่านก่อน
    await updateDoc(balanceRef, {
      [fieldPath]: increment(days),
      [remainingPath]: increment(-days),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating leave used:', error);
    throw error;
  }
};

/**
 * อัปเดตวันลาที่รออนุมัติ
 * @param {string} balanceId - ID ของวันลาคงเหลือ
 * @param {string} leaveType - ประเภทการลา (sick, vacation, personal, maternity, paternity, other)
 * @param {number} days - จำนวนวันที่รออนุมัติ (ใช้ค่าลบเพื่อลดจำนวนวันที่รออนุมัติ)
 * @returns {Promise<void>}
 */
export const updateLeavePending = async (balanceId, leaveType, days) => {
  try {
    const balanceRef = doc(db, 'leaveBalances', balanceId);
    
    // ต้องเข้าถึง field ซ้อน (nested field) ใน Firestore
    const fieldPath = `leaveTypes.${leaveType}.pending`;
    const remainingPath = `leaveTypes.${leaveType}.remaining`;
    
    // ใช้ increment ของ Firestore เพื่อเพิ่มค่าโดยไม่ต้องอ่านก่อน
    await updateDoc(balanceRef, {
      [fieldPath]: increment(days),
      [remainingPath]: increment(-days), // ลดวันที่เหลือด้วยจำนวนวันที่รออนุมัติ
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating leave pending:', error);
    throw error;
  }
};

/**
 * เพิ่มการปรับแก้ไขวันลา
 * @param {string} balanceId - ID ของวันลาคงเหลือ
 * @param {string} leaveType - ประเภทการลา (sick, vacation, personal, maternity, paternity, other)
 * @param {number} amount - จำนวนวันที่ปรับแก้ไข (ค่าบวกคือเพิ่ม, ค่าลบคือลด)
 * @param {string} reason - เหตุผลในการปรับแก้ไข
 * @param {string} approvedBy - ID ของผู้อนุมัติ
 * @returns {Promise<void>}
 */
export const addLeaveAdjustment = async (balanceId, leaveType, amount, reason, approvedBy) => {
  try {
    const balanceRef = doc(db, 'leaveBalances', balanceId);
    
    // ดึงข้อมูลเดิมเพื่อเพิ่มค่าใน array
    const balanceSnap = await getDoc(balanceRef);
    
    if (!balanceSnap.exists()) {
      throw new Error('Leave balance not found');
    }
    
    const balanceData = balanceSnap.data();
    
    // สร้างข้อมูลการปรับแก้ไขใหม่
    const newAdjustment = {
      type: leaveType,
      amount: amount,
      reason: reason,
      approvedBy: approvedBy,
      date: new Date()
    };
    
    // อัปเดตทั้ง adjustments array และค่า total กับ remaining
    const totalPath = `leaveTypes.${leaveType}.total`;
    const remainingPath = `leaveTypes.${leaveType}.remaining`;
    
    await updateDoc(balanceRef, {
      adjustments: [...(balanceData.adjustments || []), newAdjustment],
      [totalPath]: increment(amount),
      [remainingPath]: increment(amount),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding leave adjustment:', error);
    throw error;
  }
};

/**
 * ดึงรายการวันลาคงเหลือของพนักงาน (ทุกปี)
 * @param {string} userId - ID ของพนักงาน
 * @returns {Promise<Array>} - รายการวันลาคงเหลือ
 */
export const getLeaveBalancesByUser = async (userId) => {
  try {
    const leaveBalancesRef = collection(db, 'leaveBalances');
    const q = query(
      leaveBalancesRef,
      where('userId', '==', userId),
      orderBy('year', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const balances = [];
    querySnapshot.forEach((doc) => {
      balances.push({ id: doc.id, ...doc.data() });
    });
    
    return balances;
  } catch (error) {
    console.error('Error getting leave balances by user:', error);
    throw error;
  }
};

/**
 * สร้างหรืออัปเดตวันลาคงเหลือของพนักงานในปีที่ระบุ
 * @param {string} userId - ID ของพนักงาน
 * @param {number} year - ปีที่ต้องการสร้างหรืออัปเดต
 * @param {Object} leaveTypesData - ข้อมูลประเภทการลา
 * @returns {Promise<string>} - ID ของวันลาคงเหลือ
 */
export const createOrUpdateLeaveBalance = async (userId, year, leaveTypesData = {}) => {
  try {
    // ค้นหาว่ามีวันลาคงเหลือของพนักงานในปีนี้หรือไม่
    const existingBalance = await getLeaveBalanceByUserAndYear(userId, year);
    
    if (existingBalance) {
      // อัปเดตวันลาคงเหลือที่มีอยู่
      const balanceRef = doc(db, 'leaveBalances', existingBalance.id);
      await updateDoc(balanceRef, {
        leaveTypes: leaveTypesData,
        updatedAt: serverTimestamp()
      });
      return existingBalance.id;
    } else {
      // สร้างวันลาคงเหลือใหม่
      const balanceData = {
        userId,
        year,
        leaveTypes: leaveTypesData
      };
      return await createLeaveBalance(balanceData);
    }
  } catch (error) {
    console.error('Error creating or updating leave balance:', error);
    throw error;
  }
};

/**
 * คำนวณวันลาคงเหลือใหม่ทั้งหมด
 * @param {string} balanceId - ID ของวันลาคงเหลือ
 * @returns {Promise<void>}
 */
export const recalculateLeaveBalance = async (balanceId) => {
  try {
    const balanceRef = doc(db, 'leaveBalances', balanceId);
    const balanceSnap = await getDoc(balanceRef);
    
    if (!balanceSnap.exists()) {
      throw new Error('Leave balance not found');
    }
    
    const balanceData = balanceSnap.data();
    const leaveTypes = balanceData.leaveTypes;
    
    // คำนวณวันที่เหลือใหม่สำหรับแต่ละประเภทการลา
    const recalculatedLeaveTypes = {};
    Object.keys(leaveTypes).forEach(type => {
      const leaveType = leaveTypes[type];
      recalculatedLeaveTypes[type] = {
        ...leaveType,
        remaining: leaveType.total - leaveType.used - leaveType.pending
      };
    });
    
    await updateDoc(balanceRef, {
      leaveTypes: recalculatedLeaveTypes,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error recalculating leave balance:', error);
    throw error;
  }
}; 