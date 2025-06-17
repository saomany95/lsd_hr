'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getEmployeeById, updateEmployee, updateEmployeeUserId, syncEmployeeWithUserData, resetEmployeeData } from '@/firebase/employees';
import { getAllOrganizations } from '@/firebase/organizations';
import { getDepartmentsByOrganization } from '@/firebase/departments';
import { getPositionsByDepartment } from '@/firebase/positions';
import { getUserById, getAllUsers } from '@/firebase/users';
import Link from 'next/link';
import { ArrowLeft, Save, User, Briefcase, MapPin, Calendar, AlertCircle, Check, RefreshCw, Repeat, Trash2, AlertTriangle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditEmployee() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'work', 'payroll', 'organization'
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const [userIdError, setUserIdError] = useState(null);
  const [userIdFixed, setUserIdFixed] = useState(false);
  const [userIdFixing, setUserIdFixing] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      firstName_lo: '',
      lastName_lo: '',
      gender: '',
      dateOfBirth: '',
      maritalStatus: '',
      nationality: '',
      nationalId: '',
      contactEmail: '',
      contactPhone: '',
    },
    address: {
      village: '',
      district: '',
      province: '',
    },
    employmentInfo: {
      employeeId: '',
      organizationId: '',
      departmentId: '',
      departmentName: '',
      positionId: '',
      positionName: '',
      employmentType: '',
      status: 'active',
      hireDate: '',
      endDate: '',
      supervisor: '',
      workLocation: '',
    },
    payrollInfo: {
      salary: '',
      bankAccount: {
        bankName: '',
        accountNumber: '',
        accountName: '',
      },
      socialSecurityNumber: '',
      taxId: '',
    },
    userId: '',
    isActive: true,
    profileImage: '',
  });

  // ฟังก์ชันสำหรับดึงข้อมูลพนักงาน
  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const employeeData = await getEmployeeById(params.id);
      
      if (!employeeData) {
        toast.error('ບໍ່ພົບຂໍ້ມູນພະນັກງານ');
        router.push('/admin/employees');
        return;
      }
      
      console.log('Employee data from database:', employeeData);
      
      // สร้าง formData ที่มีโครงสร้างที่ถูกต้อง โดยรองรับทั้งข้อมูลเก่าและใหม่
      const updatedFormData = {
        personalInfo: {
          firstName: employeeData.personalInfo?.firstName || employeeData.firstName || '',
          lastName: employeeData.personalInfo?.lastName || employeeData.lastName || '',
          firstName_lo: employeeData.personalInfo?.firstName_lo || employeeData.firstName_lo || '',
          lastName_lo: employeeData.personalInfo?.lastName_lo || employeeData.lastName_lo || '',
          gender: employeeData.personalInfo?.gender || employeeData.gender || '',
          dateOfBirth: employeeData.personalInfo?.dateOfBirth || employeeData.dateOfBirth || '',
          maritalStatus: employeeData.personalInfo?.maritalStatus || employeeData.maritalStatus || '',
          nationality: employeeData.personalInfo?.nationality || employeeData.nationality || '',
          nationalId: employeeData.personalInfo?.nationalId || employeeData.nationalId || '',
          contactEmail: employeeData.personalInfo?.contactEmail || employeeData.email || '',
          contactPhone: employeeData.personalInfo?.contactPhone || employeeData.phoneNumber || '',
        },
        address: {
          village: employeeData.address?.village || employeeData.personalInfo?.address?.village || '',
          district: employeeData.address?.district || employeeData.personalInfo?.address?.district || '',
          province: employeeData.address?.province || employeeData.personalInfo?.address?.province || '',
        },
        employmentInfo: {
          employeeId: employeeData.employmentInfo?.employeeId || employeeData.employeeId || '',
          organizationId: employeeData.employmentInfo?.organizationId || employeeData.organizationId || '',
          departmentId: employeeData.employmentInfo?.departmentId || employeeData.departmentId || '',
          departmentName: employeeData.employmentInfo?.departmentName || employeeData.departmentName || '',
          positionId: employeeData.employmentInfo?.positionId || employeeData.positionId || '',
          positionName: employeeData.employmentInfo?.positionName || employeeData.positionName || '',
          employmentType: employeeData.employmentInfo?.employmentType || employeeData.employmentType || '',
          status: employeeData.employmentInfo?.status || employeeData.status || 'active',
          hireDate: employeeData.employmentInfo?.hireDate || employeeData.hireDate || employeeData.startDate || '',
          endDate: employeeData.employmentInfo?.endDate || employeeData.endDate || '',
          supervisor: employeeData.employmentInfo?.supervisor || employeeData.supervisor || '',
          workLocation: employeeData.employmentInfo?.workLocation || employeeData.workLocation || '',
        },
        payrollInfo: {
          salary: employeeData.payrollInfo?.salary || employeeData.salary || '',
          bankAccount: {
            bankName: employeeData.payrollInfo?.bankAccount?.bankName || '',
            accountNumber: employeeData.payrollInfo?.bankAccount?.accountNumber || '',
            accountName: employeeData.payrollInfo?.bankAccount?.accountName || '',
          },
          socialSecurityNumber: employeeData.payrollInfo?.socialSecurityNumber || '',
          taxId: employeeData.payrollInfo?.taxId || '',
        },
        userId: employeeData.userId || '',
        isActive: employeeData.isActive !== undefined ? employeeData.isActive : true,
        profileImage: employeeData.profileImage || '',
      };
      
      console.log('Updated form data:', updatedFormData);
      setFormData(updatedFormData);
      
      // ถ้ามี organizationId ให้โหลดข้อมูลแผนก
      if (updatedFormData.employmentInfo.organizationId) {
        loadDepartments(updatedFormData.employmentInfo.organizationId);
      }
      
      // ถ้ามี departmentId ให้โหลดข้อมูลตำแหน่ง
      if (updatedFormData.employmentInfo.departmentId) {
        loadPositions(updatedFormData.employmentInfo.departmentId);
      }
      
      // ตรวจสอบ userId ทันทีหลังจากโหลดข้อมูล
      if (updatedFormData.userId) {
        await validateUserIdConnection(updatedFormData.userId);
      } else {
        // ถ้าไม่มี userId ให้แสดงสถานะว่าไม่พบ
        setUserIdError('ບໍ່ພົບ userId ໃນຂໍ້ມູນພະນັກງານ');
        setUserIdFixed(false);
      }
      
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນພະນັກງານ');
    } finally {
      setLoading(false);
    }
  };
  
  // ฟังก์ชันสำหรับตรวจสอบและยืนยันการเชื่อมต่อกับ userId
  const validateUserIdConnection = async (userId) => {
    try {
      if (!userId) {
        setUserIdError('ບໍ່ພົບ userId');
        setUserIdFixed(false);
        return;
      }
      
      const userData = await getUserById(userId);
      
      if (!userData) {
        setUserIdError('ບໍ່ພົບຜູ້ໃຊ້ທີ່ເຊື່ອມຕໍ່');
        setUserIdFixed(false);
        return;
      }
      
      // พบผู้ใช้ที่เชื่อมต่อ
      setUserIdFixed(true);
      setUserIdError(null);
      console.log(`พบข้อมูลผู้ใช้ ${userData.firstName} ${userData.lastName} สำหรับ userId: ${userId}`);
      
      // ตรวจสอบว่าข้อมูลได้รับการ sync แล้วหรือไม่
      const isSynced = checkIfDataIsSynced(userData);
      if (isSynced) {
        console.log('ข้อมูลได้รับการ sync แล้ว');
      } else {
        console.log('ข้อมูลยังไม่ได้รับการ sync');
      }
      
      return userData;
    } catch (error) {
      console.error('Error validating userId connection:', error);
      setUserIdError('ເກີດຂໍ້ຜິດພາດໃນການກວດສອບ userId');
      setUserIdFixed(false);
      return null;
    }
  };
  
  // ฟังก์ชันตรวจสอบว่าข้อมูลได้รับการ sync แล้วหรือไม่
  const checkIfDataIsSynced = (userData) => {
    // ตรวจสอบว่าข้อมูลส่วนตัวได้รับการ sync จาก user แล้วหรือไม่
    const personalInfoSynced = 
      formData.personalInfo.firstName === userData.firstName &&
      formData.personalInfo.lastName === userData.lastName &&
      formData.personalInfo.contactEmail === userData.email &&
      formData.personalInfo.contactPhone === userData.phoneNumber;
    
    return personalInfoSynced;
  };
  
  // โหลดข้อมูลเมื่อเปิดหน้า
  useEffect(() => {
    const init = async () => {
      try {
        // โหลดข้อมูลองค์กร
        const { getAllOrganizations } = await import('@/firebase/organizations');
        const orgs = await getAllOrganizations();
        setOrganizations(orgs);
        
        // โหลดข้อมูลพนักงาน
        await fetchEmployee();
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ');
      }
    };
    
    init();
  }, []);
  
  // ฟังก์ชันสำหรับตรวจสอบ userId (เมื่อกดปุ่มตรวจสอบ)
  const checkUserId = async () => {
    try {
      if (!formData.userId) {
        setUserIdError('ບໍ່ພົບ userId');
        setUserIdFixed(false);
        return;
      }
      
      const userData = await validateUserIdConnection(formData.userId);
      
      if (userData) {
        toast.success('ເຊື່ອມຕໍ່ກັບບັນຊີຜູ້ໃຊ້ສຳເລັດ');
      }
    } catch (error) {
      console.error('Error checking user ID:', error);
      setUserIdError('ເກີດຂໍ້ຜິດພາດໃນການກວດສອບ userId');
      setUserIdFixed(false);
    }
  };

  // ฟังก์ชันโหลดข้อมูลผู้ใช้ทั้งหมด
  const fetchAllUsers = async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນຜູ້ໃຊ້');
    }
  };
  
  // ฟังก์ชันเลือกผู้ใช้สำหรับเชื่อมโยง
  const selectUser = async (user) => {
    try {
      setUserIdFixing(true);
      
      setFormData(prev => ({
        ...prev,
        userId: user.id
      }));
      
      toast.success(`ເຊື່ອມຕໍ່ກັບ ${user.firstName} ${user.lastName} ສຳເລັດ`);
      
      // ปิดรายการผู้ใช้
      setShowUsersList(false);
      
      // ตรวจสอบการเชื่อมโยง
      await checkUserId();
    } catch (error) {
      console.error('Error selecting user:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ຜູ້ໃຊ້');
    } finally {
      setUserIdFixing(false);
    }
  };
  
  // ฟังก์ชัน sync ข้อมูลจากผู้ใช้
  const syncUserData = async (showToast = true) => {
    try {
      setSyncingData(true);
      
      if (!formData.userId) {
        if (showToast) toast.error('ບໍ່ພົບ userId ສຳລັບ sync ຂໍ້ມູນ');
        return;
      }
      
      const userData = await getUserById(formData.userId);
      
      if (!userData) {
        if (showToast) toast.error('ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ສຳລັບ sync');
        return;
      }
      
      // อัปเดตข้อมูลส่วนตัว
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName: userData.firstName || prev.personalInfo.firstName,
          lastName: userData.lastName || prev.personalInfo.lastName,
          firstName_lo: userData.firstName_lo || prev.personalInfo.firstName_lo,
          lastName_lo: userData.lastName_lo || prev.personalInfo.lastName_lo,
          contactEmail: userData.email || prev.personalInfo.contactEmail,
          contactPhone: userData.phoneNumber || prev.personalInfo.contactPhone,
        }
      }));
      
      if (showToast) toast.success('Sync ຂໍ້ມູນຈາກບັນຊີຜູ້ໃຊ້ສຳເລັດ');
    } catch (error) {
      console.error('Error syncing user data:', error);
      if (showToast) toast.error('ເກີດຂໍ້ຜິດພາດໃນການ sync ຂໍ້ມູນ');
    } finally {
      setSyncingData(false);
    }
  };
  
  // ฟังก์ชัน reset และ sync ข้อมูลใหม่
  const handleResetData = async () => {
    try {
      setResetting(true);
      
      if (!formData.userId) {
        toast.error('ບໍ່ພົບ userId ສຳລັບ reset ຂໍ້ມູນ');
        return;
      }
      
      // รีเซ็ตข้อมูลส่วนตัว
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          firstName: '',
          lastName: '',
          firstName_lo: '',
          lastName_lo: '',
          gender: '',
          dateOfBirth: '',
          maritalStatus: '',
          nationality: '',
          nationalId: '',
          contactEmail: '',
          contactPhone: '',
        }
      }));
      
      // sync ข้อมูลจากผู้ใช้
      await syncUserData(false);
      
      toast.success('Reset ແລະ Sync ຂໍ້ມູນສຳເລັດ');
      setShowResetConfirm(false);
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການ reset ຂໍ້ມູນ');
    } finally {
      setResetting(false);
    }
  };

  // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // แยกชื่อฟิลด์ตาม dot notation
    const fieldPath = name.split('.');
    
    if (fieldPath.length === 1) {
      // ฟิลด์ระดับบนสุด
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (fieldPath.length === 2) {
      // ฟิลด์ระดับที่ 2
      const [section, field] = fieldPath;
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else if (fieldPath.length === 3) {
      // ฟิลด์ระดับที่ 3
      const [section, subSection, field] = fieldPath;
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subSection]: {
            ...prev[section][subSection],
            [field]: value
          }
        }
      }));
    }
  };

  const validateForm = () => {
    // Reset error
    setError('');
    
    // Check required fields
    if (!formData.personalInfo.firstName || !formData.personalInfo.lastName) {
      const errorMsg = 'ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ (ຊື່, ນາມສະກຸນ)';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    
    return true;
  };

  // ฟังก์ชันบันทึกข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!formData.personalInfo.firstName || !formData.personalInfo.lastName || !formData.employmentInfo.employeeId) {
        toast.error('ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ');
        setSaving(false);
        return;
      }
      
      // สร้างข้อมูลที่จะบันทึก
      const employeeData = {
        ...formData,
        updatedAt: new Date(),
      };
      
      // บันทึกข้อมูล
      await updateEmployee(params.id, employeeData);
      
      toast.success('ອັບເດດຂໍ້ມູນພະນັກງານສຳເລັດແລ້ວ');
      
      // กลับไปยังหน้ารายการพนักงาน
      router.push('/admin/employees');
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນພະນັກງານ');
    } finally {
      setSaving(false);
    }
  };

  // ฟังก์ชันจัดการการเลือกองค์กร
  const handleOrganizationChange = (e) => {
    const organizationId = e.target.value;
    
    // อัปเดต formData
    setFormData(prev => ({
      ...prev,
      employmentInfo: {
        ...prev.employmentInfo,
        organizationId,
        departmentId: '', // รีเซ็ตแผนก
        departmentName: '',
        positionId: '', // รีเซ็ตตำแหน่ง
        positionName: '',
      }
    }));
    
    // โหลดข้อมูลแผนก
    if (organizationId) {
      loadDepartments(organizationId);
    } else {
      setDepartments([]);
      setPositions([]);
    }
  };

  // ฟังก์ชันจัดการการเลือกแผนก
  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    
    // หาชื่อแผนกจาก departmentId
    const selectedDept = departments.find(dept => dept.id === departmentId);
    const departmentName = selectedDept ? (selectedDept.name_lo || selectedDept.name) : '';
    
    // อัปเดต formData
    setFormData(prev => ({
      ...prev,
      employmentInfo: {
        ...prev.employmentInfo,
        departmentId,
        departmentName,
        positionId: '', // รีเซ็ตตำแหน่ง
        positionName: '',
      }
    }));
    
    // โหลดข้อมูลตำแหน่ง
    if (departmentId) {
      loadPositions(departmentId);
    } else {
      setPositions([]);
    }
  };

  // ฟังก์ชันจัดการการเลือกตำแหน่ง
  const handlePositionChange = (e) => {
    const positionId = e.target.value;
    
    // หาชื่อตำแหน่งจาก positionId
    const selectedPos = positions.find(pos => pos.id === positionId);
    const positionName = selectedPos ? (selectedPos.name_lo || selectedPos.title_lo || selectedPos.name || selectedPos.title) : '';
    
    // อัปเดต formData
    setFormData(prev => ({
      ...prev,
      employmentInfo: {
        ...prev.employmentInfo,
        positionId,
        positionName,
      }
    }));
  };

  // ฟังก์ชันโหลดข้อมูลแผนก
  const loadDepartments = async (organizationId) => {
    try {
      const { getDepartmentsByOrganization } = await import('@/firebase/departments');
      const deptData = await getDepartmentsByOrganization(organizationId);
      setDepartments(deptData);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('ບໍ່ສາມາດໂຫລດຂໍ້ມູນພະແນກໄດ້');
    }
  };

  // ฟังก์ชันโหลดข้อมูลตำแหน่ง
  const loadPositions = async (departmentId) => {
    try {
      const { getPositionsByDepartment } = await import('@/firebase/positions');
      const posData = await getPositionsByDepartment(departmentId);
      setPositions(posData);
    } catch (error) {
      console.error('Error loading positions:', error);
      toast.error('ບໍ່ສາມາດໂຫລດຂໍ້ມູນຕຳແໜ່ງໄດ້');
    }
  };

  // useEffect สำหรับการโหลดข้อมูลแผนกเมื่อมีการเปลี่ยนแปลง organizationId
  useEffect(() => {
    if (formData.employmentInfo.organizationId) {
      loadDepartments(formData.employmentInfo.organizationId);
    }
  }, [formData.employmentInfo.organizationId]);

  // useEffect สำหรับการโหลดข้อมูลตำแหน่งเมื่อมีการเปลี่ยนแปลง departmentId
  useEffect(() => {
    if (formData.employmentInfo.departmentId) {
      loadPositions(formData.employmentInfo.departmentId);
    }
  }, [formData.employmentInfo.departmentId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin/employees" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">ແກ້ໄຂຂໍ້ມູນພະນັກງານ</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              className={`flex items-center px-4 py-2 ${activeTab === 'basic' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('basic')}
            >
              <User className="h-4 w-4 mr-2" />
              ຂໍ້ມູນພື້ນຖານ
            </button>
            <button
              className={`flex items-center px-4 py-2 ${activeTab === 'work' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('work')}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              ຂໍ້ມູນການເຮັດວຽກ
            </button>
            <button
              className={`flex items-center px-4 py-2 ${activeTab === 'payroll' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('payroll')}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ຂໍ້ມູນເງິນເດືອນ
            </button>
            <button
              className={`flex items-center px-4 py-2 ${activeTab === 'organization' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('organization')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              ຂໍ້ມູນອົງກອນ
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Tab Content - Basic Information */}
            <div className={`p-6 ${activeTab === 'basic' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-semibold mb-4">ຂໍ້ມູນພື້ນຖານ</h2>
              
              {/* แสดงข้อมูลการเชื่อมโยงกับผู้ใช้ */}
              {formData.userId && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="text-sm font-medium text-blue-800 mb-1">ຂໍ້ມູນເຊື່ອມໂຍງກັບບັນຊີຜູ້ໃຊ້</h3>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-blue-500 mr-2" />
                    <p className="text-sm text-blue-600">
                      ພະນັກງານນີ້ເຊື່ອມໂຍງກັບບັນຊີຜູ້ໃຊ້ <span className="font-medium">{formData.userId}</span>
                    </p>
                  </div>
                  
                  {/* แสดงสถานะการเชื่อมโยง */}
                  <div className="mt-2 flex items-center">
                    {userIdError ? (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs"> ສະຖານະການເຊື່ອມຕໍ່: {userIdError}</span>
                      </div>
                    ) : userIdFixed ? (
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        <span className="text-xs"> ສະຖານະການເຊື່ອມຕໍ່: ເຊື່ອມຕໍ່ສຳເລັດ</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs"> ສະຖານະການເຊື່ອມຕໍ່: ລໍຖ້າການກວດສອບ</span>
                      </div>
                    )}
                  </div>
                  
                  {/* ปุ่มตรวจสอบและแก้ไข userId */}
                  <div className="mt-3 flex space-x-2">
                    <button
                      type="button"
                      onClick={checkUserId}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      ກວດສອບການເຊື່ອມຕໍ່
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowUsersList(!showUsersList)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                    >
                      <User className="h-3 w-3 mr-1" />
                      {showUsersList ? 'ເຊື່ອງລາຍການຜູ້ໃຊ້' : 'ສະແດງລາຍການຜູ້ໃຊ້ທັງໝົດ'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => syncUserData(false)}
                      disabled={syncingData || !userIdFixed}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center disabled:opacity-50"
                    >
                      <Repeat className="h-3 w-3 mr-1" />
                      {syncingData ? 'ກຳລັງ Sync...' : 'Sync ຂໍ້ມູລຈາກຜູ້ໃຊ້'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      disabled={!userIdFixed || resetting}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {resetting ? 'ກຳລັງ Reset...' : 'Reset ແລະ Sync ຂໍ້ມູນໃໝ່'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* แสดง Dialog ยืนยันการรีเซ็ตข้อมูล */}
              {showResetConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <div className="flex items-center mb-4 text-red-600">
                      <AlertTriangle className="h-6 w-6 mr-2" />
                      <h3 className="text-lg font-medium">ຢືນຢັນການ Reset ຂໍ້ມູນ</h3>
                    </div>
                    
                    <p className="mb-6 text-gray-700">
                      ການ Reset ຂໍ້ມູນຈະລົບຂໍ້ມູລສ່ວນຕົວປັຈຈຸບັນແລະດຶງຂໍ້ມູນໃຫມ່ຈາກບັນຊີຜູ້ໃຊ້ 
                      ຂໍ້ມູນການເຮັດວຽກແລະຂໍ້ມູລນຳຄັນອື່ນໆ ຈະບໍ່ຖືກລົບ ທ່ານຈະເຮັດຕໍ່ໄປບໍ່?
                    </p>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        disabled={resetting}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800"
                      >
                        ຍົກເລີກ
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleResetData}
                        disabled={resetting}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white flex items-center"
                      >
                        {resetting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            ກຳລັງ Reset...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            ຢືນຢັນການ Reset
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* แสดงรายการผู้ใช้ทั้งหมดเพื่อให้เลือกเชื่อมโยง */}
              {showUsersList && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">ລາຍການຜູ້ໃຊ້ທັງໝົດໃນລະບບ</h3>
                  
                  {allUsers.length === 0 ? (
                    <div className="text-sm text-gray-500">ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ໃນຣະບບ</div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {allUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md">
                          <div>
                            <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500">
                              {user.email || user.phoneNumber || 'ບໍ່ມີຂໍ້ມູນການຕິດຕໍ່'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => selectUser(user)}
                            disabled={userIdFixing}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          >
                            {userIdFixing ? 'ກຳລັງດຳເນີນການ...' : 'ເລືອກ'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {allUsers.length === 0 && (
                    <button
                      type="button"
                      onClick={fetchAllUsers}
                      className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      ໂຫລດຂໍ້ມູນຜູ້ໃຊ້
                    </button>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="personalInfo.firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    ຊື່ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="personalInfo.firstName"
                    name="personalInfo.firstName"
                    value={formData.personalInfo.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="personalInfo.lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    ນາມສະກຸນ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="personalInfo.lastName"
                    name="personalInfo.lastName"
                    value={formData.personalInfo.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="personalInfo.firstName_lo" className="block text-sm font-medium text-gray-700 mb-1">
                    ຊື່ (ພາສາອັງກິດ)
                  </label>
                  <input
                    type="text"
                    id="personalInfo.firstName_lo"
                    name="personalInfo.firstName_lo"
                    value={formData.personalInfo.firstName_lo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="personalInfo.lastName_lo" className="block text-sm font-medium text-gray-700 mb-1">
                    ນາມສະກຸນ (ພາສາອັງກິດ)
                  </label>
                  <input
                    type="text"
                    id="personalInfo.lastName_lo"
                    name="personalInfo.lastName_lo"
                    value={formData.personalInfo.lastName_lo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="personalInfo.contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    ອີເມວ
                  </label>
                  <input
                    type="email"
                    id="personalInfo.contactEmail"
                    name="personalInfo.contactEmail"
                    value={formData.personalInfo.contactEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="personalInfo.contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    ເບີໂທລະສັບ
                  </label>
                  <input
                    type="text"
                    id="personalInfo.contactPhone"
                    name="personalInfo.contactPhone"
                    value={formData.personalInfo.contactPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="personalInfo.gender" className="block text-sm font-medium text-gray-700 mb-1">
                    ເພດ
                  </label>
                  <select
                    id="personalInfo.gender"
                    name="personalInfo.gender"
                    value={formData.personalInfo.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- ເລືອກ --</option>
                    <option value="male">ຊາຍ</option>
                    <option value="female">ຍິງ</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="personalInfo.dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    ວັນເດືອນປີເກີດ
                  </label>
                  <input
                    type="date"
                    id="personalInfo.dateOfBirth"
                    name="personalInfo.dateOfBirth"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="personalInfo.maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    ສະຖານະພາບການແຕ່ງງານ
                  </label>
                  <select
                    id="personalInfo.maritalStatus"
                    name="personalInfo.maritalStatus"
                    value={formData.personalInfo.maritalStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- ເລືອກ --</option>
                    <option value="single">ໂສດ</option>
                    <option value="married">ແຕ່ງງານແລ້ວ</option>
                    <option value="divorced">ຢ່າຮ້າງ</option>
                    <option value="widowed">ໝ້າຍ</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="personalInfo.nationality" className="block text-sm font-medium text-gray-700 mb-1">
                    ສັນຊາດ
                  </label>
                  <input
                    type="text"
                    id="personalInfo.nationality"
                    name="personalInfo.nationality"
                    value={formData.personalInfo.nationality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="personalInfo.nationalId" className="block text-sm font-medium text-gray-700 mb-1">
                  ເລກບັດປະຈຳຕົວ
                </label>
                <input
                  type="text"
                  id="personalInfo.nationalId"
                  name="personalInfo.nationalId"
                  value={formData.personalInfo.nationalId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-3">ທີ່ຢູ່</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="mb-4">
                    <label htmlFor="address.village" className="block text-sm font-medium text-gray-700 mb-1">
                      ບ້ານ
                    </label>
                    <input
                      type="text"
                      id="address.village"
                      name="address.village"
                      value={formData.address.village}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="address.district" className="block text-sm font-medium text-gray-700 mb-1">
                      ເມືອງ
                    </label>
                    <input
                      type="text"
                      id="address.district"
                      name="address.district"
                      value={formData.address.district}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="address.province" className="block text-sm font-medium text-gray-700 mb-1">
                      ແຂວງ
                    </label>
                    <input
                      type="text"
                      id="address.province"
                      name="address.province"
                      value={formData.address.province}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab Content - Work Information */}
            <div className={`p-6 ${activeTab === 'work' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-semibold mb-4">ຂໍ້ມູນການເຮັດວຽກ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="employmentInfo.employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                    ລະຫັດພະນັກງານ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="employmentInfo.employeeId"
                    name="employmentInfo.employeeId"
                    value={formData.employmentInfo.employeeId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="employmentInfo.employmentType" className="block text-sm font-medium text-gray-700 mb-1">
                    ປະເພດການຈ້າງ
                  </label>
                  <select
                    id="employmentInfo.employmentType"
                    name="employmentInfo.employmentType"
                    value={formData.employmentInfo.employmentType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- ເລືອກ --</option>
                    <option value="full-time">ເຕັມເວລາ</option>
                    <option value="part-time">ບາງເວລາ</option>
                    <option value="contract">ສັນຍາຈ້າງ</option>
                    <option value="internship">ຝຶກງານ</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="employmentInfo.hireDate" className="block text-sm font-medium text-gray-700 mb-1">
                    ວັນທີເລີ່ມເຮັດວຽກ
                  </label>
                  <input
                    type="date"
                    id="employmentInfo.hireDate"
                    name="employmentInfo.hireDate"
                    value={formData.employmentInfo.hireDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="employmentInfo.endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    ວັນທີສິ້ນສຸດສັນຍາ
                  </label>
                  <input
                    type="date"
                    id="employmentInfo.endDate"
                    name="employmentInfo.endDate"
                    value={formData.employmentInfo.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="employmentInfo.status" className="block text-sm font-medium text-gray-700 mb-1">
                    ສະຖານະການເຮັດວຽກ
                  </label>
                  <select
                    id="employmentInfo.status"
                    name="employmentInfo.status"
                    value={formData.employmentInfo.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- ເລືອກ --</option>
                    <option value="active">ເຮັດວຽກຢູ່</option>
                    <option value="on-leave">ລາພັກ</option>
                    <option value="terminated">ພົ້ນສະພາບ</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="employmentInfo.workLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    ສະຖານທີ່ເຮັດວຽກ
                  </label>
                  <input
                    type="text"
                    id="employmentInfo.workLocation"
                    name="employmentInfo.workLocation"
                    value={formData.employmentInfo.workLocation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="employmentInfo.supervisor" className="block text-sm font-medium text-gray-700 mb-1">
                    ຜູ້ຄວບຄຸມ
                  </label>
                  <input
                    type="text"
                    id="employmentInfo.supervisor"
                    name="employmentInfo.supervisor"
                    value={formData.employmentInfo.supervisor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Tab Content - Payroll Information */}
            <div className={`p-6 ${activeTab === 'payroll' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-semibold mb-4">ຂໍ້ມູນເງິນເດືອນ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="payrollInfo.salary" className="block text-sm font-medium text-gray-700 mb-1">
                    ເງິນເດືອນ
                  </label>
                  <input
                    type="text"
                    id="payrollInfo.salary"
                    name="payrollInfo.salary"
                    value={formData.payrollInfo.salary}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="payrollInfo.socialSecurityNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    ເລກປະກັນສັງຄົມ
                  </label>
                  <input
                    type="text"
                    id="payrollInfo.socialSecurityNumber"
                    name="payrollInfo.socialSecurityNumber"
                    value={formData.payrollInfo.socialSecurityNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="payrollInfo.taxId" className="block text-sm font-medium text-gray-700 mb-1">
                    ເລກປະຈຳຕົວຜູ້ເສຍພາສີ
                  </label>
                  <input
                    type="text"
                    id="payrollInfo.taxId"
                    name="payrollInfo.taxId"
                    value={formData.payrollInfo.taxId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-3">ຂໍ້ມູນບັນຊີທະນາຄານ</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="payrollInfo.bankAccount.bankName" className="block text-sm font-medium text-gray-700 mb-1">
                      ຊື່ທະນາຄານ
                    </label>
                    <input
                      type="text"
                      id="payrollInfo.bankAccount.bankName"
                      name="payrollInfo.bankAccount.bankName"
                      value={formData.payrollInfo.bankAccount.bankName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="payrollInfo.bankAccount.accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      ເລກບັນຊີທະນາຄານ
                    </label>
                    <input
                      type="text"
                      id="payrollInfo.bankAccount.accountNumber"
                      name="payrollInfo.bankAccount.accountNumber"
                      value={formData.payrollInfo.bankAccount.accountNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="payrollInfo.bankAccount.accountName" className="block text-sm font-medium text-gray-700 mb-1">
                      ຊື່ບັນຊີ
                    </label>
                    <input
                      type="text"
                      id="payrollInfo.bankAccount.accountName"
                      name="payrollInfo.bankAccount.accountName"
                      value={formData.payrollInfo.bankAccount.accountName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab Content - Organization Information */}
            <div className={`p-6 ${activeTab === 'organization' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-semibold mb-4">ຂໍ້ມູນອົງກອນ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="employmentInfo.organizationId" className="block text-sm font-medium text-gray-700 mb-1">
                    ອົງກອນ
                  </label>
                  <select
                    id="employmentInfo.organizationId"
                    name="employmentInfo.organizationId"
                    value={formData.employmentInfo.organizationId}
                    onChange={handleOrganizationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">ເລືອກອົງກອນ</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name_lo || org.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="employmentInfo.departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                    ພະແນກ
                  </label>
                  <select
                    id="employmentInfo.departmentId"
                    name="employmentInfo.departmentId"
                    value={formData.employmentInfo.departmentId}
                    onChange={handleDepartmentChange}
                    disabled={!formData.employmentInfo.organizationId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">ເລືອກພະແນກ</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name_lo || dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="employmentInfo.positionId" className="block text-sm font-medium text-gray-700 mb-1">
                    ຕຳແໜ່ງ
                  </label>
                  <select
                    id="employmentInfo.positionId"
                    name="employmentInfo.positionId"
                    value={formData.employmentInfo.positionId}
                    onChange={handlePositionChange}
                    disabled={!formData.employmentInfo.departmentId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">ເລືອກຕຳແໜ່ງ</option>
                    {positions.length > 0 ? (
                      positions.map((pos) => (
                        <option key={pos.id} value={pos.id}>
                          {pos.name_lo || pos.title_lo || pos.name || pos.title || `Position ${pos.id}`}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>ບໍ່ມີຕຳແໜ່ງ</option>
                    )}
                  </select>
                  {positions.length === 0 && formData.employmentInfo.departmentId && (
                    <p className="text-sm text-amber-600 mt-1">
                      ບໍ່ພົບຕຳແໜ່ງສຳລັບພະແນກນີ້
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Form Buttons */}
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
              <Link 
                href="/admin/employees" 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800"
              >
                ຍົກເລີກ
              </Link>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ກຳລັງບັນທຶກ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    ບັນທຶກ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 