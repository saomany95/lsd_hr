'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { createOrganization, getMainOrganizations } from '@/firebase/organizations';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    name_lo: '',
    code: '',
    type: 'company',
    parentId: '',
    address: '',
    isActive: true
  });

  // โหลดรายการองค์กรหลักเพื่อใช้ในการเลือกองค์กรแม่
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const mainOrgs = await getMainOrganizations();
        setOrganizations(mainOrgs);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };
    
    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!formData.name_lo || !formData.code) {
        throw new Error('กรุณากรอกข้อมูลที่จำเป็น: ชื่อองค์กร (ลาว) และรหัส');
      }
      
      // สร้างองค์กรใหม่
      await createOrganization({
        ...formData,
        parentId: formData.parentId || null
      });
      
      // กลับไปยังหน้ารายการองค์กร
      router.push('/admin/organizations');
    } catch (error) {
      console.error('Error creating organization:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการสร้างองค์กร');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/admin/organizations" className="mr-4">
          <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold">ເພີ່ມອົງກອນໃໝ່</h1>
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
                        {org.name_lo || org.name}
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
                    rows="5"
                    placeholder="ກະລຸນາປ້ອນທີ່ຢູ່ຂອງອົງກອນ"
                  ></textarea>
                </div>
                
                <div className="flex items-center mt-2">
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
          
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-200">
            <p className="text-xs text-gray-500">ຂໍ້ມູນທີ່ມີເຄື່ອງໝາຍ <span className="text-red-500">*</span> ແມ່ນຈຳເປັນຕ້ອງປ້ອນ</p>
            
            <div className="flex space-x-3">
              <Link
                href="/admin/organizations"
                className="px-4 py-2 border rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
              >
                ຍົກເລີກ
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກຂໍ້ມູນ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
