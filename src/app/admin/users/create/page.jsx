'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase/context';
import { createUser as createUserFromFirestore } from '@/firebase/users';
import { getAllOrganizations } from '@/firebase/organizations';
import { getDepartmentsByOrganization } from '@/firebase/departments';
import Link from 'next/link';
import { ArrowLeft, Save, User, Briefcase, MapPin, Calendar, UserCog, Fingerprint, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateUser() {
  const router = useRouter();
  const { createUser } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    // ข้อมูลบัญชีผู้ใช้
    phoneNumber: '',
    email: '',
    firstName: '',
    lastName: '',
    firstName_lo: '',
    lastName_lo: '',
    avatar: '',
    password: '',
    
    // สิทธิ์และสถานะ
    role: 'staff',
    isActive: true,
    isEmailVerified: false,
    isPhoneVerified: false,
    
    // ตั้งค่าระบบ
    language: 'lo',
    timezone: 'Asia/Vientiane',
    notification: {
      email: true,
      push: true
    }
  });

  // โหลดข้อมูลองค์กรเมื่อโหลดหน้า
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        console.log('Fetching organizations in create user page...');
        const orgs = await getAllOrganizations(false);
        console.log('Organizations fetched in create user page:', orgs);
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນອົງກອນ');
      }
    };
    
    fetchOrganizations();
  }, []);

  // เพิ่มฟังก์ชันเพื่อดึงข้อมูลแผนกเมื่อมีการเลือกองค์กร
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        if (formData.organizationId) {
          const deps = await getDepartmentsByOrganization(formData.organizationId, true);
          setDepartments(deps);
        } else {
          setDepartments([]);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນພະແນກ');
      }
    };
    
    fetchDepartments();
  }, [formData.organizationId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle nested checkboxes for notification
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: checked
          }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      // Handle normal inputs
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    // Reset error
    setError('');
    
    // Validate phone number format
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      const errorMsg = 'ກະລຸນາປ້ອນເບີໂທລະສັບໃຫ້ຖືກຕ້ອງ';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    
    // Check required fields
    if (!formData.firstName || !formData.lastName) {
      const errorMsg = 'ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ (ຊື່, ນາມສະກຸນ)';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Display loading toast
    const toastId = toast.loading('ກຳລັງບັນທຶກຂໍ້ມູນ...');
    
    try {
      setLoading(true);
      
      // สร้างข้อมูลผู้ใช้สำหรับบันทึก
      const userData = {
        ...formData,
        // ตรวจสอบให้แน่ใจว่า role เป็น string ไม่ใช่ array
        role: formData.role || 'staff'
      };
      
      // Create new user
      const userId = await createUser(userData);
      
      // Update toast to success
      toast.success('ບັນທຶກຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດແລ້ວ!', { id: toastId });
      
      // Navigate back to users management
      router.push('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຜູ້ໃຊ້ໃໝ່');
      
      // Update toast to error
      toast.error(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຜູ້ໃຊ້ໃໝ່', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin/users" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">ເພີ່ມຜູ້ໃຊ້ໃໝ່</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
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
            className={`flex items-center px-4 py-2 ${activeTab === 'permissions' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('permissions')}
          >
            <Key className="h-4 w-4 mr-2" />
            ສິດທິ ແລະ ການເຂົ້າເຖິງ
          </button>
          <button
            className={`flex items-center px-4 py-2 ${activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('settings')}
          >
            <UserCog className="h-4 w-4 mr-2" />
            ຕັ້ງຄ່າ
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Tab Content - Basic Information */}
          <div className={`p-6 ${activeTab === 'basic' ? 'block' : 'hidden'}`}>
            <h2 className="text-xl font-semibold mb-4">ຂໍ້ມູນບັນຊີຜູ້ໃຊ້</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  ນາມສະກຸນ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="firstName_lo" className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ (ພາສາອັງກິດ)
                </label>
                <input
                  type="text"
                  id="firstName_lo"
                  name="firstName_lo"
                  value={formData.firstName_lo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="lastName_lo" className="block text-sm font-medium text-gray-700 mb-1">
                  ນາມສະກຸນ (ພາສາອັງກິດ)
                </label>
                <input
                  type="text"
                  id="lastName_lo"
                  name="lastName_lo"
                  value={formData.lastName_lo}
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
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  ເບີໂທລະສັບ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+8562000000000"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                ລະຫັດຜ່ານ
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ຖ້າບໍ່ໄດ້ກຳນົດລະຫັດຜ່ານ, ລະບົບຈະສົ່ງລະຫັດຜ່ານຊົ່ວຄາວ"
              />
            </div>
          </div>
          
          {/* Tab Content - Permissions */}
          <div className={`p-6 ${activeTab === 'permissions' ? 'block' : 'hidden'}`}>
            <h2 className="text-xl font-semibold mb-4">ສິດທິ ແລະ ການເຂົ້າເຖິງ</h2>
            
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                ບົດບາດ (ສິດທິ)
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="admin">ຜູ້ດູແລລະບົບ (Admin)</option>
                <option value="manager">ຜູ້ຈັດການ (Manager)</option>
                <option value="staff">ພະນັກງານ (Staff)</option>
                <option value="user">ຜູ້ໃຊ້ທົ່ວໄປ (User)</option>
              </select>
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                ເປີດໃຊ້ງານບັນຊີນີ້
              </label>
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isEmailVerified"
                name="isEmailVerified"
                checked={formData.isEmailVerified}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isEmailVerified" className="ml-2 block text-sm text-gray-900">
                ຢືນຢັນອີເມລແລ້ວ
              </label>
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isPhoneVerified"
                name="isPhoneVerified"
                checked={formData.isPhoneVerified}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPhoneVerified" className="ml-2 block text-sm text-gray-900">
                ຢືນຢັນເບີໂທລະສັບແລ້ວ
              </label>
            </div>
          </div>
          
          {/* Tab Content - Settings */}
          <div className={`p-6 ${activeTab === 'settings' ? 'block' : 'hidden'}`}>
            <h2 className="text-xl font-semibold mb-4">ຕັ້ງຄ່າ</h2>
            
            <div className="mb-4">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                ພາສາ
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="lo">ລາວ</option>
                <option value="en">English</option>
                <option value="th">ไทย</option>
              </select>
            </div>
            
            <h3 className="text-md font-medium mb-2 mt-4">ການແຈ້ງເຕືອນ</h3>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="notification.email"
                name="notification.email"
                checked={formData.notification.email}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notification.email" className="ml-2 block text-sm text-gray-900">
                ຮັບການແຈ້ງເຕືອນທາງອີເມລ
              </label>
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="notification.push"
                name="notification.push"
                checked={formData.notification.push}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notification.push" className="ml-2 block text-sm text-gray-900">
                ຮັບການແຈ້ງເຕືອນແບບ Push
              </label>
            </div>
          </div>
          
          {/* Form Buttons */}
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <Link 
              href="/admin/users" 
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
