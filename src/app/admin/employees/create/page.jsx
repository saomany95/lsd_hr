'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Building2, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import UserSelector from '@/components/user/UserSelector';
import ImportUserDataButton from '@/components/user/ImportUserDataButton';
import { createEmployee } from '@/firebase/employees';
import { getAllOrganizations } from '@/firebase/organizations';
import { getDepartmentsByOrganization } from '@/firebase/departments';
import { getPositionsByDepartment } from '@/firebase/positions';

export default function CreateEmployee() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State สำหรับองค์กร แผนก และตำแหน่ง
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  
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
      contactPhone: '',
      contactEmail: '',
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
      salary: 0,
      socialSecurityNumber: '',
      taxId: '',
      bankAccount: {
        bankName: '',
        accountNumber: '',
        accountName: '',
      }
    },
    userId: '',
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ตรวจสอบว่าเป็นการเปลี่ยนแปลงข้อมูลในกลุ่มใด
    if (name.includes('.')) {
      const [group, field] = name.split('.');
      
      if (group === 'bankAccount') {
        // สำหรับข้อมูลบัญชีธนาคาร (เป็น nested object ใน payrollInfo)
        setFormData(prev => ({
          ...prev,
          payrollInfo: {
            ...prev.payrollInfo,
            bankAccount: {
              ...prev.payrollInfo.bankAccount,
              [field]: value
            }
          }
        }));
      } else {
        // สำหรับข้อมูลกลุ่มอื่นๆ (personalInfo, address, employmentInfo, payrollInfo)
        setFormData(prev => ({
          ...prev,
          [group]: {
            ...prev[group],
            [field]: value
          }
        }));
      }
    } else {
      // สำหรับข้อมูลที่อยู่ในระดับบนสุด
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // ฟังก์ชันสำหรับโหลดข้อมูลองค์กรทั้งหมด
  const loadOrganizations = async () => {
    try {
      const orgs = await getAllOrganizations();
      setOrganizations(orgs);
      console.log('Organizations loaded:', orgs.length);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນອົງກອນ');
    }
  };

  // ฟังก์ชันสำหรับโหลดข้อมูลแผนกตามองค์กรที่เลือก
  const loadDepartments = async (organizationId) => {
    if (!organizationId) {
      setDepartments([]);
      return;
    }

    try {
      setLoadingDepartments(true);
      const depts = await getDepartmentsByOrganization(organizationId);
      setDepartments(depts);
      console.log('Departments loaded:', depts.length);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນພະແນກ');
    } finally {
      setLoadingDepartments(false);
    }
  };

  // ฟังก์ชันสำหรับโหลดข้อมูลตำแหน่งตามแผนกที่เลือก
  const loadPositions = async (departmentId) => {
    if (!departmentId) {
      setPositions([]);
      return;
    }

    try {
      setLoadingPositions(true);
      const pos = await getPositionsByDepartment(departmentId);
      setPositions(pos);
      console.log('Positions loaded:', pos.length);
    } catch (error) {
      console.error('Error loading positions:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນຕຳແໜ່ງ');
    } finally {
      setLoadingPositions(false);
    }
  };

  // ฟังก์ชันสำหรับการเลือกองค์กร
  const handleOrganizationChange = (e) => {
    const organizationId = e.target.value;
    
    // อัปเดต organizationId ใน employmentInfo
    setFormData(prev => ({
      ...prev,
      employmentInfo: {
        ...prev.employmentInfo,
        organizationId: organizationId,
        departmentId: '', // รีเซ็ตแผนกเมื่อเปลี่ยนองค์กร
        positionId: '', // รีเซ็ตตำแหน่งเมื่อเปลี่ยนองค์กร
        departmentName: '',
        positionName: ''
      }
    }));
    
    // โหลดข้อมูลแผนกใหม่
    loadDepartments(organizationId);
    setPositions([]); // รีเซ็ตตำแหน่ง
  };

  // ฟังก์ชันสำหรับการเลือกแผนก
  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    const selectedDept = departments.find(dept => dept.id === departmentId);
    
    // อัปเดต departmentId และ departmentName ใน employmentInfo
    setFormData(prev => ({
      ...prev,
      employmentInfo: {
        ...prev.employmentInfo,
        departmentId: departmentId,
        departmentName: selectedDept ? (selectedDept.name_lo || selectedDept.name) : '',
        positionId: '', // รีเซ็ตตำแหน่งเมื่อเปลี่ยนแผนก
        positionName: ''
      }
    }));
    
    // โหลดข้อมูลตำแหน่งใหม่
    loadPositions(departmentId);
  };

  // ฟังก์ชันสำหรับการเลือกตำแหน่ง
  const handlePositionChange = (e) => {
    const positionId = e.target.value;
    const selectedPos = positions.find(pos => pos.id === positionId);
    
    // อัปเดต positionId และ positionName ใน employmentInfo
    setFormData(prev => ({
      ...prev,
      employmentInfo: {
        ...prev.employmentInfo,
        positionId: positionId,
        positionName: selectedPos ? (selectedPos.title_lo || selectedPos.title || selectedPos.name_lo || selectedPos.name) : ''
      }
    }));
  };

  // โหลดข้อมูลองค์กรเมื่อเริ่มต้น
  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (user) {
      setFormData(prev => ({ ...prev, userId: user.id }));
    } else {
      setFormData(prev => ({ ...prev, userId: '' }));
    }
  };

  const handleImportUserData = (userData) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        firstName: userData.firstName || prev.personalInfo.firstName,
        lastName: userData.lastName || prev.personalInfo.lastName,
        firstName_lo: userData.firstName_lo || prev.personalInfo.firstName_lo,
        lastName_lo: userData.lastName_lo || prev.personalInfo.lastName_lo,
        gender: userData.gender || prev.personalInfo.gender,
        dateOfBirth: userData.dateOfBirth || prev.personalInfo.dateOfBirth,
        contactPhone: userData.contactPhone || userData.phoneNumber || prev.personalInfo.contactPhone,
        contactEmail: userData.contactEmail || userData.email || prev.personalInfo.contactEmail,
        nationality: userData.nationality || prev.personalInfo.nationality,
        nationalId: userData.nationalId || prev.personalInfo.nationalId,
        maritalStatus: userData.maritalStatus || prev.personalInfo.maritalStatus,
      },
      address: {
        ...prev.address,
        village: userData.address?.village || prev.address.village,
        district: userData.address?.district || prev.address.district,
        province: userData.address?.province || prev.address.province
      },
      employmentInfo: {
        ...prev.employmentInfo,
        employeeId: userData.employeeId || prev.employmentInfo.employeeId,
        departmentId: userData.departmentId || prev.employmentInfo.departmentId,
        departmentName: userData.departmentName || prev.employmentInfo.departmentName,
        positionId: userData.positionId || prev.employmentInfo.positionId,
        positionName: userData.positionName || prev.employmentInfo.positionName,
        employmentType: userData.employmentType || prev.employmentInfo.employmentType,
        status: userData.status || prev.employmentInfo.status,
        hireDate: userData.hireDate || prev.employmentInfo.hireDate,
        endDate: userData.endDate || prev.employmentInfo.endDate,
        supervisor: userData.supervisor || prev.employmentInfo.supervisor,
        workLocation: userData.workLocation || prev.employmentInfo.workLocation,
        organizationId: userData.organizationId || prev.employmentInfo.organizationId
      },
      payrollInfo: {
        ...prev.payrollInfo,
        salary: userData.salary || prev.payrollInfo.salary,
        socialSecurityNumber: userData.socialSecurityNumber || prev.payrollInfo.socialSecurityNumber,
        taxId: userData.taxId || prev.payrollInfo.taxId,
        bankAccount: {
          ...prev.payrollInfo.bankAccount,
          bankName: userData.bankAccount?.bankName || prev.payrollInfo.bankAccount.bankName,
          accountNumber: userData.bankAccount?.accountNumber || prev.payrollInfo.bankAccount.accountNumber,
          accountName: userData.bankAccount?.accountName || prev.payrollInfo.bankAccount.accountName
        }
      },
      userId: userData.userId || prev.userId
    }));
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
    
    // Check employee ID format
    if (formData.employmentInfo.employeeId && !/^[A-Za-z0-9-]+$/.test(formData.employmentInfo.employeeId)) {
      const errorMsg = 'ລະຫັດພະນັກງານຄວນປະກອບດ້ວຍຕົວອັກສອນ, ຕົວເລກ ແລະ - ເທົ່ານັ້ນ';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!formData.personalInfo.firstName || !formData.personalInfo.lastName) {
        toast.error('ກະລຸນາປ້ອນຂໍ້ມູນຊື່ ແລະ ນາມສະກຸນ');
        setLoading(false);
        return;
      }
      
      // สร้างข้อมูลพนักงานใหม่
      const employeeData = {
        ...formData,
        // ตรวจสอบและแปลงข้อมูลตัวเลข
        payrollInfo: {
          ...formData.payrollInfo,
          salary: formData.payrollInfo.salary ? parseFloat(formData.payrollInfo.salary) : 0,
        },
        // เพิ่ม timestamp
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // ส่งข้อมูลไปยัง Firebase
      await createEmployee(employeeData);
      
      toast.success('ເພີ່ມຂໍ້ມູນພະນັກງານສຳເລັດແລ້ວ');
      router.push('/admin/employees');
    } catch (error) {
      console.error('Error creating employee:', error);
      setError('ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນພະນັກງານ');
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນພະນັກງານ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin/employees" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">ເພີ່ມພະນັກງານໃໝ່</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* User selector section */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium mb-4">ເຊື່ອມໂຍງກັບບັນຊີຜູ້ໃຊ້</h2>
          <p className="text-sm text-gray-500 mb-4">
            ຖ້າພະນັກງານຄົນນີ້ມີບັນຊີຜູ້ໃຊ້ໃນລະບົບແລ້ວ, ທ່ານສາມາດເຊື່ອມໂຍງແລະນຳເຂົ້າຂໍ້ມູນຈາກບັນຊີຜູ້ໃຊ້ໄດ້.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ຊອກຫາຜູ້ໃຊ້
              </label>
              <UserSelector onSelectUser={handleSelectUser} />
            </div>
            <div>
              <ImportUserDataButton 
                user={selectedUser} 
                onImport={handleImportUserData} 
                disabled={!selectedUser}
              />
            </div>
          </div>
        </div>
        
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="personalInfo.firstName_lo" className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ (ພາສາລາວ)
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
                  ນາມສະກຸນ (ພາສາລາວ)
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
                <label htmlFor="personalInfo.firstName_en" className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ (ພາສາອັງກິດ)
                </label>
                <input
                  type="text"
                  id="personalInfo.firstName_en"
                  name="personalInfo.firstName_en"
                  value={formData.personalInfo.firstName_en}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="personalInfo.lastName_en" className="block text-sm font-medium text-gray-700 mb-1">
                  ນາມສະກຸນ (ພາສາອັງກິດ)
                </label>
                <input
                  type="text"
                  id="personalInfo.lastName_en"
                  name="personalInfo.lastName_en"
                  value={formData.personalInfo.lastName_en}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  ອີເມລ
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="personalInfo.phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  ເບີໂທລະສັບ
                </label>
                <input
                  type="text"
                  id="personalInfo.phoneNumber"
                  name="personalInfo.phoneNumber"
                  value={formData.personalInfo.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+8562000000000"
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
            
            <div className="mb-4">
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                URL ຮູບໂປຣໄຟລ໌
              </label>
              <input
                type="text"
                id="avatar"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {formData.avatar && (
                <div className="mt-2">
                  <img src={formData.avatar} alt="Profile Preview" className="h-16 w-16 rounded-full object-cover border border-gray-200" />
                </div>
              )}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label htmlFor="employmentInfo.employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                  ລະຫັດພະນັກງານ
                </label>
                <input
                  type="text"
                  id="employmentInfo.employeeId"
                  name="employmentInfo.employeeId"
                  value={formData.employmentInfo.employeeId}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* องค์กร */}
              <div>
                <label htmlFor="employmentInfo.organizationId" className="block text-sm font-medium text-gray-700 mb-1">
                  ອົງກອນ
                </label>
                <select
                  id="employmentInfo.organizationId"
                  name="employmentInfo.organizationId"
                  value={formData.employmentInfo.organizationId}
                  onChange={handleOrganizationChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- ເລືອກອົງກອນ --</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name_lo || org.name || org.code}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* แผนก */}
              <div>
                <label htmlFor="employmentInfo.departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                  ພະແນກ
                </label>
                <select
                  id="employmentInfo.departmentId"
                  name="employmentInfo.departmentId"
                  value={formData.employmentInfo.departmentId}
                  onChange={handleDepartmentChange}
                  disabled={!formData.employmentInfo.organizationId || loadingDepartments}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- ເລືອກພະແນກ --</option>
                  {loadingDepartments ? (
                    <option value="" disabled>ກຳລັງໂຫລດ...</option>
                  ) : (
                    departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name_lo || dept.name || dept.code}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              {/* ตำแหน่ง */}
              <div>
                <label htmlFor="employmentInfo.positionId" className="block text-sm font-medium text-gray-700 mb-1">
                  ຕຳແໜ່ງ
                </label>
                <select
                  id="employmentInfo.positionId"
                  name="employmentInfo.positionId"
                  value={formData.employmentInfo.positionId}
                  onChange={handlePositionChange}
                  disabled={!formData.employmentInfo.departmentId || loadingPositions}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- ເລືອກຕຳແໜ່ງ --</option>
                  {loadingPositions ? (
                    <option value="" disabled>ກຳລັງໂຫລດ...</option>
                  ) : (
                    positions.map(pos => (
                      <option key={pos.id} value={pos.id}>
                        {pos.title_lo || pos.title || pos.name_lo || pos.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label htmlFor="employmentInfo.employmentType" className="block text-sm font-medium text-gray-700 mb-1">
                  ປະເພດການຈ້າງ
                </label>
                <select
                  id="employmentInfo.employmentType"
                  name="employmentInfo.employmentType"
                  value={formData.employmentInfo.employmentType}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- ເລືອກປະເພດການຈ້າງ --</option>
                  <option value="full-time">ເຕັມເວລາ (Full-time)</option>
                  <option value="part-time">ບາງເວລາ (Part-time)</option>
                  <option value="contract">ສັນຍາຈ້າງ (Contract)</option>
                  <option value="temporary">ຊົ່ວຄາວ (Temporary)</option>
                  <option value="internship">ຝຶກງານ (Internship)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="employmentInfo.status" className="block text-sm font-medium text-gray-700 mb-1">
                  ສະຖານະ
                </label>
                <select
                  id="employmentInfo.status"
                  name="employmentInfo.status"
                  value={formData.employmentInfo.status}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">ເຮັດວຽກຢູ່ (Active)</option>
                  <option value="on-leave">ລາພັກ (On Leave)</option>
                  <option value="terminated">ພົ້ນສະພາບ (Terminated)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="employmentInfo.hireDate" className="block text-sm font-medium text-gray-700 mb-1">
                  ວັນທີເລີ່ມວຽກ
                </label>
                <input
                  type="date"
                  id="employmentInfo.hireDate"
                  name="employmentInfo.hireDate"
                  value={formData.employmentInfo.hireDate}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="employmentInfo.endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  ວັນທີສິ້ນສຸດ (ຖ້າມີ)
                </label>
                <input
                  type="date"
                  id="employmentInfo.endDate"
                  name="employmentInfo.endDate"
                  value={formData.employmentInfo.endDate}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="employmentInfo.supervisor" className="block text-sm font-medium text-gray-700 mb-1">
                  ຜູ້ຄວບຄຸມ
                </label>
                <input
                  type="text"
                  id="employmentInfo.supervisor"
                  name="employmentInfo.supervisor"
                  value={formData.employmentInfo.supervisor}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="employmentInfo.workLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  ສະຖານທີ່ເຮັດວຽກ
                </label>
                <input
                  type="text"
                  id="employmentInfo.workLocation"
                  name="employmentInfo.workLocation"
                  value={formData.employmentInfo.workLocation}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Tab Content - Payroll Information */}
          <div className={`p-6 ${activeTab === 'payroll' ? 'block' : 'hidden'}`}>
            <h2 className="text-xl font-semibold mb-4">ຂໍ້ມູນເງິນເດືອນ ແລະ ບັນຊີ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="payrollInfo.salary" className="block text-sm font-medium text-gray-700 mb-1">
                  ເງິນເດືອນ (ກີບ)
                </label>
                <input
                  type="number"
                  id="payrollInfo.salary"
                  name="payrollInfo.salary"
                  value={formData.payrollInfo.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="100000"
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
            
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-medium mb-3">ຂໍ້ມູນບັນຊີທະນາຄານ</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    ເລກບັນຊີ
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
          
          {/* Tab Content - Organization */}
          <div className={`p-6 ${activeTab === 'organization' ? 'block' : 'hidden'}`}>
            <h2 className="text-xl font-semibold mb-4">ຂໍ້ມູນອົງກອນ</h2>
            
            <div className="mb-4">
              <label htmlFor="isActive" className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 block text-sm text-gray-900">
                  ພະນັກງານຍັງເຮັດວຽກຢູ່
                </span>
              </label>
            </div>
            
            <div className="mb-4">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                ລະຫັດຜູ້ໃຊ້ (User ID)
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={!!selectedUser}
              />
              <p className="text-sm text-gray-500 mt-1">
                ເຊື່ອມໂຍງກັບບັນຊີຜູ້ໃຊ້ໃນລະບົບ
              </p>
            </div>
            
            <p className="text-sm text-gray-500 italic">
              ຂໍ້ມູນອົງກອນເພີ່ມເຕີມຈະສາມາດເພີ່ມໄດ້ຫຼັງຈາກສ້າງພະນັກງານແລ້ວ.
            </p>
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
              disabled={loading}
            >
              {loading ? (
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
    </div>
  );
} 