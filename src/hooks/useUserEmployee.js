'use client';

import { useState } from 'react';
import * as userService from '@/firebase/users';
import * as employeeService from '@/firebase/employees';

/**
 * Hook สำหรับจัดการข้อมูลผู้ใช้และพนักงานร่วมกัน
 * @returns {Object} - ฟังก์ชันและสถานะสำหรับจัดการข้อมูลผู้ใช้และพนักงาน
 */
export function useUserEmployee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * สร้างผู้ใช้และพนักงานใหม่พร้อมกัน
   * @param {Object} userData - ข้อมูลผู้ใช้
   * @param {Object} employeeData - ข้อมูลพนักงาน (ถ้าไม่ระบุจะสร้างจากข้อมูลผู้ใช้)
   * @returns {Promise<Object>} - ข้อมูลผู้ใช้และพนักงานที่สร้าง
   */
  const createUserWithEmployee = async (userData, employeeData = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // สร้างผู้ใช้ใหม่
      const userId = await userService.createUser(userData);
      
      // ถ้าไม่ได้ระบุข้อมูลพนักงาน ให้สร้างจากข้อมูลผู้ใช้
      const employeeDataToCreate = employeeData || employeeService.convertUserToEmployee({
        id: userId,
        ...userData
      });
      
      // กำหนด userId ให้กับข้อมูลพนักงาน
      employeeDataToCreate.userId = userId;
      
      // สร้างพนักงานใหม่
      const employeeId = await employeeService.createEmployee(employeeDataToCreate);
      
      return {
        userId,
        employeeId,
        userData: { id: userId, ...userData },
        employeeData: { id: employeeId, ...employeeDataToCreate }
      };
    } catch (error) {
      console.error('Error creating user with employee:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้และพนักงาน');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * ดึงข้อมูลผู้ใช้และพนักงานพร้อมกัน
   * @param {string} userId - ID ของผู้ใช้
   * @returns {Promise<Object>} - ข้อมูลผู้ใช้และพนักงาน
   */
  const getUserWithEmployee = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      // ดึงข้อมูลผู้ใช้
      const userData = await userService.getUserById(userId);
      
      if (!userData) {
        return { userData: null, employeeData: null };
      }
      
      // ดึงข้อมูลพนักงานจาก userId
      const employeeData = await employeeService.getEmployeeByUserId(userId);
      
      return { userData, employeeData };
    } catch (error) {
      console.error('Error getting user with employee:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้และพนักงาน');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * อัปเดตข้อมูลผู้ใช้และพนักงานพร้อมกัน
   * @param {string} userId - ID ของผู้ใช้
   * @param {string} employeeId - ID ของพนักงาน
   * @param {Object} userData - ข้อมูลผู้ใช้ที่ต้องการอัปเดต
   * @param {Object} employeeData - ข้อมูลพนักงานที่ต้องการอัปเดต
   * @returns {Promise<void>}
   */
  const updateUserWithEmployee = async (userId, employeeId, userData, employeeData) => {
    setLoading(true);
    setError(null);
    
    try {
      // อัปเดตข้อมูลผู้ใช้
      if (userData && Object.keys(userData).length > 0) {
        await userService.updateUser(userId, userData);
      }
      
      // อัปเดตข้อมูลพนักงาน
      if (employeeId && employeeData && Object.keys(employeeData).length > 0) {
        await employeeService.updateEmployee(employeeId, employeeData);
      }
    } catch (error) {
      console.error('Error updating user with employee:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้และพนักงาน');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * ลบผู้ใช้และพนักงานพร้อมกัน
   * @param {string} userId - ID ของผู้ใช้
   * @param {string} employeeId - ID ของพนักงาน
   * @returns {Promise<void>}
   */
  const deleteUserWithEmployee = async (userId, employeeId) => {
    setLoading(true);
    setError(null);
    
    try {
      // ลบข้อมูลพนักงานก่อน
      if (employeeId) {
        await employeeService.deleteEmployee(employeeId);
      } else {
        // ถ้าไม่มี employeeId ให้ค้นหาพนักงานจาก userId แล้วลบ
        const employeeData = await employeeService.getEmployeeByUserId(userId);
        if (employeeData) {
          await employeeService.deleteEmployee(employeeData.id);
        }
      }
      
      // ลบข้อมูลผู้ใช้
      await userService.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user with employee:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้และพนักงาน');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * ค้นหาผู้ใช้และพนักงานตามเงื่อนไข
   * @param {string} searchText - ข้อความที่ต้องการค้นหา
   * @returns {Promise<Array>} - รายการผู้ใช้และพนักงานที่ตรงกับการค้นหา
   */
  const searchUsersWithEmployees = async (searchText) => {
    setLoading(true);
    setError(null);
    
    try {
      // ค้นหาพนักงานก่อนเพราะมีข้อมูลมากกว่า
      const employees = await employeeService.searchEmployees(searchText);
      
      // สร้าง Map ของ userId กับข้อมูลพนักงาน
      const employeeMap = new Map();
      employees.forEach(employee => {
        if (employee.userId) {
          employeeMap.set(employee.userId, employee);
        }
      });
      
      // ดึงข้อมูลผู้ใช้ทั้งหมด
      const allUsers = await userService.getAllUsers();
      
      // กรองผู้ใช้ตามเงื่อนไขและรวมกับข้อมูลพนักงาน
      const results = allUsers
        .filter(user => {
          // กรองผู้ใช้ที่ตรงกับการค้นหาหรือมีข้อมูลพนักงานที่ตรงกับการค้นหา
          return (
            employeeMap.has(user.id) ||
            user.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.phoneNumber?.includes(searchText)
          );
        })
        .map(user => {
          // รวมข้อมูลผู้ใช้กับข้อมูลพนักงาน
          const employee = employeeMap.get(user.id);
          return {
            user,
            employee: employee || null
          };
        });
      
      return results;
    } catch (error) {
      console.error('Error searching users with employees:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการค้นหาผู้ใช้และพนักงาน');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * ดึงรายการผู้ใช้และพนักงานทั้งหมด
   * @param {boolean} activeOnly - ดึงเฉพาะรายการที่เปิดใช้งาน
   * @returns {Promise<Array>} - รายการผู้ใช้และพนักงาน
   */
  const getAllUsersWithEmployees = async (activeOnly = true) => {
    setLoading(true);
    setError(null);
    
    try {
      // ดึงข้อมูลผู้ใช้ทั้งหมด
      const users = await userService.getAllUsers(activeOnly);
      
      // ดึงข้อมูลพนักงานทั้งหมด
      const employees = await employeeService.getAllEmployees(activeOnly);
      
      // สร้าง Map ของ userId กับข้อมูลพนักงาน
      const employeeMap = new Map();
      employees.forEach(employee => {
        if (employee.userId) {
          employeeMap.set(employee.userId, employee);
        }
      });
      
      // รวมข้อมูลผู้ใช้กับข้อมูลพนักงาน
      const results = users.map(user => {
        const employee = employeeMap.get(user.id);
        return {
          user,
          employee: employee || null
        };
      });
      
      return results;
    } catch (error) {
      console.error('Error getting all users with employees:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้และพนักงาน');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * เริ่มกระบวนการย้ายข้อมูลจากระบบเก่าไปยังระบบใหม่
   * @returns {Promise<Object>} - สรุปผลการย้ายข้อมูล
   */
  const migrateToNewStructure = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ย้ายข้อมูลผู้ใช้จากคอลเลกชันเก่าไปยังคอลเลกชันใหม่
      const userMigrationResults = await userService.migrateOldUsers();
      
      // ย้ายข้อมูลพนักงานจากข้อมูลผู้ใช้เก่า
      const employeeMigrationResults = await employeeService.migrateUsersToEmployees();
      
      return {
        userMigration: userMigrationResults,
        employeeMigration: employeeMigrationResults
      };
    } catch (error) {
      console.error('Error migrating to new structure:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการย้ายข้อมูลไปยังโครงสร้างใหม่');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createUserWithEmployee,
    getUserWithEmployee,
    updateUserWithEmployee,
    deleteUserWithEmployee,
    searchUsersWithEmployees,
    getAllUsersWithEmployees,
    migrateToNewStructure
  };
} 