'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Save } from 'lucide-react';
import { createPosition } from '@/firebase/positions';
import { getAllDepartments } from '@/firebase/departments';

export default function CreatePositionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    title_lo: '',
    code: '',
    departmentId: '',
    level: 1,
    grade: '',
    description: '',
    requirements: {
      education: '',
      experience: '',
      skills: ''
    },
    isActive: true
  });

  // โหลดรายการแผนก
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const depts = await getAllDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('req_')) {
      // Handle requirements fields
      const reqField = name.replace('req_', '');
      setFormData({
        ...formData,
        requirements: {
          ...formData.requirements,
          [reqField]: value
        }
      });
    } else {
      // Handle normal fields
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? Number(value) : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!formData.title_lo || !formData.code || !formData.departmentId) {
        throw new Error('กรุณากรอกข้อมูลที่จำเป็น: ชื่อตำแหน่ง (ลาว), รหัส และแผนก');
      }
      
      // สร้างตำแหน่งใหม่
      await createPosition({
        ...formData,
        title: formData.title_lo // ใช้ชื่อภาษาลาวเป็นชื่อหลัก
      });
      
      // กลับไปยังหน้ารายการตำแหน่ง
      router.push('/admin/positions');
    } catch (error) {
      console.error('Error creating position:', error);
      setError(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຕຳແໜ່ງ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-5xl">
      <div className="flex items-center mb-4 sm:mb-6">
        <Link href="/admin/positions" className="mr-2 sm:mr-4">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">ເພີ່ມຕຳແໜ່ງໃໝ່</h1>
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
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b flex items-center">
          <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-1 sm:mr-2" />
          <h2 className="text-base sm:text-lg font-medium text-gray-900">ຂໍ້ມູນຕຳແໜ່ງ</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-sm sm:text-md font-medium mb-3 sm:mb-4 text-blue-700 pb-1 sm:pb-2 border-b border-gray-200">
                ຂໍ້ມູນພື້ນຖານ
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ຊື່ຕຳແໜ່ງ (ລາວ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title_lo"
                    value={formData.title_lo}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="ກະລຸນາປ້ອນຊື່ຕຳແໜ່ງເປັນພາສາລາວ"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ຊື່ຕຳແໜ່ງ (ອັງກິດ)
                  </label>
                  <input
                    type="text"
                    name="title_en"
                    value={formData.title_en}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Enter position title in English"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ລະຫັດ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="ເຊັ່ນ: POS001"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">ລະຫັດນີ້ຈະໃຊ້ສຳລັບອ້າງອີງໃນລະບົບ</p>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ພະແນກ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                    required
                  >
                    <option value="">ກະລຸນາເລືອກພະແນກ</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name_lo || dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm sm:text-md font-medium mb-3 sm:mb-4 text-blue-700 pb-1 sm:pb-2 border-b border-gray-200">
                ຂໍ້ມູນລະດັບ ແລະ ລາຍລະອຽດ
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ລະດັບຕຳແໜ່ງ
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                  >
                    <option value={1}>Entry Level</option>
                    <option value={2}>Junior</option>
                    <option value={3}>Senior</option>
                    <option value={4}>Lead</option>
                    <option value={5}>Manager</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ເກຣດ
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="ເຊັ່ນ: A1, B2, C3"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ລາຍລະອຽດຕຳແໜ່ງ
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    rows="3"
                    placeholder="ອະທິບາຍກ່ຽວກັບຕຳແໜ່ງນີ້"
                  ></textarea>
                </div>
                
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-xs sm:text-sm text-gray-900">
                    ເປີດໃຊ້ງານ
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8">
            <h3 className="text-sm sm:text-md font-medium mb-3 sm:mb-4 text-blue-700 pb-1 sm:pb-2 border-b border-gray-200">
              ຄຸນສົມບັດທີ່ຕ້ອງການ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  ການສຶກສາ
                </label>
                <textarea
                  name="req_education"
                  value={formData.requirements.education}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  rows="3"
                  placeholder="ເຊັ່ນ: ປະລິນຍາຕີ ຫຼື ສູງກວ່າ"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  ປະສົບການ
                </label>
                <textarea
                  name="req_experience"
                  value={formData.requirements.experience}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  rows="3"
                  placeholder="ເຊັ່ນ: 2+ ປີ ໃນຕຳແໜ່ງທີ່ກ່ຽວຂ້ອງ"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  ທັກສະ
                </label>
                <textarea
                  name="req_skills"
                  value={formData.requirements.skills}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  rows="3"
                  placeholder="ເຊັ່ນ: ທັກສະການສື່ສານ, ການວິເຄາະ"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-gray-200 gap-4">
            <p className="text-xs text-gray-500">ຂໍ້ມູນທີ່ມີເຄື່ອງໝາຍ <span className="text-red-500">*</span> ແມ່ນຈຳເປັນຕ້ອງປ້ອນ</p>
            
            <div className="flex space-x-2 sm:space-x-3">
              <Link
                href="/admin/positions"
                className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm text-xs sm:text-sm"
              >
                ຍົກເລີກ
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center text-xs sm:text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກຂໍ້ມູນ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 