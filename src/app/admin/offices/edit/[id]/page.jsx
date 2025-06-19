'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building, Save, MapPin, Loader2 } from 'lucide-react';
import { getOfficeById, updateOffice } from '@/firebase/offices';
import { toast } from 'react-hot-toast';

export default function EditOfficePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'active'
  });

  // โหลดข้อมูลสำนักงานที่ต้องการแก้ไข
  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const officeData = await getOfficeById(id);
        if (!officeData) {
          setNotFound(true);
          toast.error('ບໍ່ພົບຂໍ້ມູນສຳນັກງານ');
          return;
        }
        
        setFormData({
          name: officeData.name || '',
          location: officeData.location || '',
          status: officeData.status || 'active'
        });
      } catch (error) {
        console.error('Error fetching office:', error);
        setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສຳນັກງານ');
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສຳນັກງານ');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffice();
  }, [id]);

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
    setSaving(true);
    
    try {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!formData.name) {
        throw new Error('ກະລຸນາປ້ອນຊື່ສຳນັກງານ/ຈຸດກວດ');
      }
      
      // อัปเดตข้อมูลสำนักงาน
      await updateOffice(id, {
        name: formData.name,
        location: formData.location,
        status: formData.status
      });
      
      toast.success('ອັບເດດຂໍ້ມູນສຳນັກງານສຳເລັດແລ້ວ', {
        duration: 3000,
        icon: '✅',
      });
      
      // กลับไปยังหน้ารายการสำนักงาน
      router.push('/admin/offices');
    } catch (error) {
      console.error('Error updating office:', error);
      setError(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນສຳນັກງານ');
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນສຳນັກງານ', {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center mb-6">
          <Link href="/admin/offices" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold">ບໍ່ພົບຂໍ້ມູນສຳນັກງານ</h1>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                ບໍ່ພົບຂໍ້ມູນສຳນັກງານທີ່ຕ້ອງການແກ້ໄຂ. <Link href="/admin/offices" className="font-medium underline">ກັບໄປໜ້າລາຍການສຳນັກງານ</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center mb-6">
          <Link href="/admin/offices" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold">ແກ້ໄຂຂໍ້ມູນສຳນັກງານ</h1>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="mt-2 text-gray-600">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/admin/offices" className="mr-4">
          <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-2xl font-bold">ແກ້ໄຂຂໍ້ມູນສຳນັກງານ</h1>
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
              disabled={saving}
            >
              {saving ? (
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