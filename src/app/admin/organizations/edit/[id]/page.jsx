'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { getOrganizationById, updateOrganization, getAllOrganizations } from '@/firebase/organizations';
import toast from 'react-hot-toast';

export default function EditOrganizationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  
  const [formData, setFormData] = useState({
    name_lo: '',
    name_en: '',
    code: '',
    type: 'company',
    parentId: '',
    address: '',
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    taxNumber: '',
    registrationNumber: '',
    isActive: true
  });

  // โหลดข้อมูลองค์กรเมื่อโหลดหน้า
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ดึงข้อมูลองค์กรที่ต้องการแก้ไข
        const orgData = await getOrganizationById(id);
        
        if (!orgData) {
          setError('ບໍ່ພົບຂໍ້ມູນອົງກອນ');
          return;
        }
        
        // ดึงรายการองค์กรทั้งหมดเพื่อใช้เป็นตัวเลือกสำหรับองค์กรแม่
        const allOrgs = await getAllOrganizations(false);
        // กรองออกองค์กรปัจจุบัน และลูกขององค์กรปัจจุบัน (ป้องกันการเลือกตัวเองหรือลูกเป็นแม่)
        const filteredOrgs = allOrgs.filter(org => org.id !== id);
        setOrganizations(filteredOrgs);
        
        // ตั้งค่าข้อมูลฟอร์ม
        setFormData({
          name_lo: orgData.name_lo || '',
          name_en: orgData.name_en || '',
          code: orgData.code || '',
          type: orgData.type || 'company',
          parentId: orgData.parentId || '',
          address: orgData.address || '',
          contactInfo: orgData.contactInfo || {
            phone: '',
            email: '',
            website: ''
          },
          taxNumber: orgData.taxNumber || '',
          registrationNumber: orgData.registrationNumber || '',
          isActive: orgData.isActive !== undefined ? orgData.isActive : true
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // ตรวจสอบว่าเป็นฟิลด์ nested หรือไม่
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    // แสดง toast กำลังบันทึกข้อมูล
    const toastId = toast.loading('ກຳລັງບັນທຶກຂໍ້ມູນ...');
    
    try {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!formData.name_lo || !formData.code) {
        throw new Error('ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ: ຊື່ອົງກອນ (ລາວ) ແລະ ລະຫັດ');
      }
      
      // ตรวจสอบว่าไม่ได้เลือกตัวเองเป็นองค์กรแม่
      if (formData.parentId === id) {
        throw new Error('ບໍ່ສາມາດເລືອກຕົວເອງເປັນອົງກອນແມ່ໄດ້');
      }
      
      // อัปเดตองค์กร
      await updateOrganization(id, {
        ...formData,
        parentId: formData.parentId || null
      });
      
      // อัปเดต toast เป็นสำเร็จ
      toast.success('ອັບເດດອົງກອນສຳເລັດແລ້ວ!', { id: toastId });
      
      // กลับไปยังหน้ารายการองค์กร
      router.push('/admin/organizations');
    } catch (error) {
      console.error('Error updating organization:', error);
      setError(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດອົງກອນ');
      
      // อัปเดต toast เป็นข้อผิดพลาด
      toast.error(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດອົງກອນ', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/admin/organizations" className="mr-4">
          <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold">ແກ້ໄຂຂໍ້ມູນອົງກອນ</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b flex items-center">
            <Building2 className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">ຂໍ້ມູນອົງກອນ</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium mb-4 text-blue-700 pb-2 border-b border-gray-200">
                  ຂໍ້ມູນພື້ນຖານ
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ຊື່ອົງກອນ (ລາວ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name_lo"
                      value={formData.name_lo}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="ກະລຸນາປ້ອນຊື່ອົງກອນເປັນພາສາລາວ"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ຊື່ອົງກອນ (ອັງກິດ)
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Enter organization name in English"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ລະຫັດ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="ເຊັ່ນ: ORG001"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">ລະຫັດນີ້ຈະໃຊ້ສຳລັບອ້າງອີງໃນລະບົບ</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-4 text-blue-700 pb-2 border-b border-gray-200">
                  ຂໍ້ມູນເພີ່ມເຕີມ
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ປະເພດ <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                    >
                      <option value="company">ບໍລິສັດ</option>
                      <option value="branch">ສາຂາ</option>
                      <option value="department">ພະແນກ</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ສັງກັດອົງກອນ
                    </label>
                    <select
                      name="parentId"
                      value={formData.parentId}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                    >
                      <option value="">ບໍ່ມີ (ອົງກອນຫຼັກ)</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>
                          {org.name_lo || org.name_en || org.code}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">ເລືອກອົງກອນແມ່ ຫຼື ປ່ອຍວ່າງໄວ້ຖ້າເປັນອົງກອນລະດັບສູງສຸດ</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ທີ່ຢູ່
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      rows="3"
                      placeholder="ທີ່ຢູ່ຂອງອົງກອນ"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ເບີໂທລະສັບ
                    </label>
                    <input
                      type="tel"
                      name="contactInfo.phone"
                      value={formData.contactInfo.phone}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="+856XXXXXXXX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ອີເມລ
                    </label>
                    <input
                      type="email"
                      name="contactInfo.email"
                      value={formData.contactInfo.email}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="example@company.com"
                    />
                  </div>
                  
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      ເປີດໃຊ້ງານ
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-8 pt-5 border-t border-gray-200">
              <Link
                href="/admin/organizations"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                ຍົກເລີກ
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກຂໍ້ມູນ'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
