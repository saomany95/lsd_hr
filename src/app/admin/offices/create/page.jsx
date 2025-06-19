'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building, Save, MapPin } from 'lucide-react';
import { createOffice } from '@/firebase/offices';
import { toast } from 'react-hot-toast';

export default function CreateOfficePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'active'
  });

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
      if (!formData.name) {
        throw new Error('ກະລຸນາປ້ອນຊື່ສຳນັກງານ/ຈຸດກວດ');
      }
      
      // สร้างสำนักงานใหม่
      await createOffice({
        name: formData.name,
        location: formData.location,
        status: formData.status
      });
      
      toast.success('ເພີ່ມສຳນັກງານສຳເລັດແລ້ວ', {
        duration: 3000,
        icon: '✅',
      });
      
      // กลับไปยังหน้ารายการสำนักงาน
      router.push('/admin/offices');
    } catch (error) {
      console.error('Error creating office:', error);
      setError(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງສຳນັກງານ');
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການສ້າງສຳນັກງານ', {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/admin/offices" className="mr-4">
          <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold">ເພີ່ມສຳນັກງານໃໝ່</h1>
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
          <Building className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">ຂໍ້ມູນສຳນັກງານ/ຈຸດກວດ</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ຊື່ສຳນັກງານ/ຈຸດກວດ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                placeholder="ກະລຸນາປ້ອນຊື່ສຳນັກງານ/ຈຸດກວດ"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ສະຖານທີ່
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="ປ້ອນສະຖານທີ່ຕັ້ງຂອງສຳນັກງານ"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ສະຖານະ
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
              >
                <option value="active">ເປີດໃຊ້ງານ</option>
                <option value="inactive">ປິດໃຊ້ງານ</option>
              </select>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Link
              href="/admin/offices"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none mr-2"
            >
              ຍົກເລີກ
            </Link>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
    </div>
  );
} 