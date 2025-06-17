'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Save, Check } from 'lucide-react';
import { updatePosition, getPositionById } from '@/firebase/positions';
import { getAllDepartments } from '@/firebase/departments';
import { toast } from 'react-hot-toast';

export default function EditPositionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    title_lo: '',
    code: '',
    description: '',
    departmentId: '',
    level: 1,
    grade: '',
    requirements: {
      education: '',
      experience: '',
      skills: ''
    },
    isActive: true
  });

  // โหลดข้อมูลตำแหน่งและข้อมูลอื่นๆ เมื่อโหลดหน้า
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ดึงข้อมูลตำแหน่งตาม ID
        const positionData = await getPositionById(id);
        if (!positionData) {
          setError('ບໍ່ພົບຂໍ້ມູນຕຳແໜ່ງ');
          toast.error('ບໍ່ພົບຂໍ້ມູນຕຳແໜ່ງ');
          return;
        }
        
        // ดึงข้อมูลแผนกทั้งหมด
        const allDepts = await getAllDepartments(false);
        
        // ตั้งค่าข้อมูลฟอร์ม
        // ตรวจสอบว่า requirements มีข้อมูลครบถ้วนหรือไม่
        const requirements = positionData.requirements || {};
        const formattedData = {
          ...positionData,
          requirements: {
            education: requirements.education || '',
            experience: requirements.experience || '',
            skills: requirements.skills || ''
          }
        };
        
        setDepartments(allDepts);
        setFormData(formattedData);
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
    
    if (name.startsWith('requirements.')) {
      // จัดการข้อมูลใน requirements
      const requirementField = name.split('.')[1];
      setFormData({
        ...formData,
        requirements: {
          ...formData.requirements,
          [requirementField]: value
        }
      });
    } else {
      // จัดการข้อมูลปกติ
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!formData.title_lo || !formData.code) {
        throw new Error('ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ: ຊື່ຕຳແໜ່ງ (ລາວ) ແລະ ລະຫັດ');
      }
      
      // ตรวจสอบว่ามีการเลือกแผนก
      if (!formData.departmentId) {
        throw new Error('ກະລຸນາເລືອກພະແນກ');
      }
      
      // อัปเดตข้อมูลตำแหน่ง
      await updatePosition(id, formData);
      
      toast.success('ອັບເດດຂໍ້ມູນຕຳແໜ່ງສຳເລັດແລ້ວ');
      
      // กลับไปยังหน้ารายการตำแหน่ง
      router.push('/admin/positions');
    } catch (error) {
      console.error('Error updating position:', error);
      setError(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຕຳແໜ່ງ');
      toast.error(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຕຳແໜ່ງ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-5xl">
      <div className="flex items-center mb-4 sm:mb-6">
        <Link
          href="/admin/positions"
          className="mr-2 sm:mr-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center">
          <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-blue-600" />
          ແກ້ໄຂຕຳແໜ່ງ
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            ຂໍ້ມູນຕຳແໜ່ງ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ຊື່ຕຳແໜ່ງ (ລາວ) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="title_lo"
                value={formData.title_lo || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ຊື່ຕຳແໜ່ງ (ອັງກິດ)
              </label>
              <input
                type="text"
                name="title_en"
                value={formData.title_en || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ລະຫັດຕຳແໜ່ງ <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ພະແນກ <span className="text-red-600">*</span>
              </label>
              <select
                name="departmentId"
                value={formData.departmentId || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">ເລືອກພະແນກ</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name_lo || dept.name || dept.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ລະດັບຕຳແໜ່ງ
              </label>
              <select
                name="level"
                value={formData.level || 1}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value={1}>Entry Level</option>
                <option value={2}>Junior</option>
                <option value={3}>Senior</option>
                <option value={4}>Lead</option>
                <option value={5}>Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ເກຣດ
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ເຊັ່ນ A1, B2, ..."
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ລາຍລະອຽດຕຳແໜ່ງ
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                ເປີດໃຊ້ງານ
              </label>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-8">
            ຄຸນສົມບັດທີ່ຕ້ອງການ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ການສຶກສາ
              </label>
              <textarea
                name="requirements.education"
                value={formData.requirements?.education || ''}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ວຸດທິການສຶກສາທີ່ຕ້ອງການ"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ປະສົບການ
              </label>
              <textarea
                name="requirements.experience"
                value={formData.requirements?.experience || ''}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ປະສົບການທີ່ຕ້ອງການ"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ທັກສະ
              </label>
              <textarea
                name="requirements.skills"
                value={formData.requirements?.skills || ''}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ທັກສະທີ່ຕ້ອງການ"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
          <Link
            href="/admin/positions"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 mr-2"
          >
            ຍົກເລີກ
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ກຳລັງບັນທຶກ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                ບັນທຶກ
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 