'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase/context';
import Link from 'next/link';
import { ArrowLeft, Calendar, Upload, Save } from 'lucide-react';

export default function CreateLeavePage() {
  const router = useRouter();
  const { user, createLeaveRequest } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    leaveType: 'sick',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false,
    halfDayPeriod: 'morning',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    setError('');

    if (!formData.startDate || !formData.endDate) {
      setError('ກະລຸນາເລືອກວັນທີເລີ່ມຕົ້ນ ແລະ ວັນທີສິ້ນສຸດ');
      return false;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError('ບໍ່ສາມາດເລືອກວັນທີໃນອະດີດໄດ້');
      return false;
    }

    if (end < start) {
      setError('ວັນທີສິ້ນສຸດຕ້ອງຫຼັງຈາກວັນທີເລີ່ມຕົ້ນ');
      return false;
    }

    if (!formData.reason.trim()) {
      setError('ກະລຸນາລະບຸເຫດຜົນໃນການລາ');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // ສ້າງຂໍ້ມູນຄຳຂໍລາ
      const leaveData = {
        userId: user.id,
        userName: user.displayName,
        leaveType: formData.leaveType,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        reason: formData.reason,
        status: 'pending',
        createdAt: new Date(),
        halfDay: formData.halfDay,
        halfDayPeriod: formData.halfDay ? formData.halfDayPeriod : null,
      };
      
      // ອັບໂຫລດໄຟລ໌ແນບ (ຖ້າມີ)
      const fileUrls = [];
      if (files.length > 0) {
        // ໃນສະພາບແວດລ້ອມຈິງ, ຈະຕ້ອງມີການອັບໂຫລດໄຟລ໌ໄປຍັງ Firebase Storage
        // ແລະ ເກັບ URL ໃນ fileUrls
        // ຕົວຢ່າງ:
        // for (const file of files) {
        //   const fileUrl = await uploadFileToStorage(file);
        //   fileUrls.push(fileUrl);
        // }
      }
      
      leaveData.attachments = fileUrls;
      
      // ສົ່ງຄຳຂໍລາ
      await createLeaveRequest(leaveData);
      
      // ກັບໄປຍັງໜ້າລາຍການລາ
      router.push('/leaves');
    } catch (error) {
      console.error('Error creating leave request:', error);
      setError(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຄຳຂໍລາ');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg">ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອສ້າງຄຳຂໍລາ</p>
        <Link href="/login" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
          ເຂົ້າສູ່ລະບົບ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/leaves" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">ສ້າງຄຳຂໍລາໃໝ່</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ປະເພດການລາ */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="leaveType">
              ປະເພດການລາ <span className="text-red-500">*</span>
            </label>
            <select
              id="leaveType"
              name="leaveType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.leaveType}
              onChange={handleChange}
              required
            >
              <option value="sick">ລາປ່ວຍ</option>
              <option value="vacation">ລາພັກຜ່ອນ</option>
              <option value="personal">ລາກິດສ່ວນຕົວ</option>
            </select>
          </div>
          
          {/* ຄຶ່ງມື້ */}
          <div className="flex items-center">
            <input
              id="halfDay"
              name="halfDay"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.halfDay}
              onChange={handleChange}
            />
            <label className="ml-2 block text-sm text-gray-900" htmlFor="halfDay">
              ລາຄຶ່ງມື້
            </label>
            
            {formData.halfDay && (
              <select
                id="halfDayPeriod"
                name="halfDayPeriod"
                className="ml-4 shadow appearance-none border rounded py-1 px-2 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
                value={formData.halfDayPeriod}
                onChange={handleChange}
              >
                <option value="morning">ຊ່ວງເຊົ້າ</option>
                <option value="afternoon">ຊ່ວງບ່າຍ</option>
              </select>
            )}
          </div>
          
          {/* ວັນທີເລີ່ມຕົ້ນ */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
              ວັນທີເລີ່ມຕົ້ນ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="startDate"
                name="startDate"
                type="date"
                className="shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          {/* ວັນທີສິ້ນສຸດ */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
              ວັນທີສິ້ນສຸດ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className="shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        
        {/* ເຫດຜົນ */}
        <div className="mt-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason">
            ເຫດຜົນໃນການລາ <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            rows="4"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.reason}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        {/* ອັບໂຫລດໄຟລ໌ */}
        <div className="mt-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            ເອກະສານແນບ (ຖ້າມີ)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>ອັບໂຫລດໄຟລ໌</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">ຫຼື ລາກໄຟລ໌ມາໃສ່ນີ້</p>
              </div>
              <p className="text-xs text-gray-500">
                ສາມາດອັບໂຫລດໄຟລ໌ໄດ້ຫຼາຍກວ່າ 1 ໄຟລ໌ (PDF, PNG, JPG, ຂະໜາດບໍ່ເກີນ 5MB)
              </p>
            </div>
          </div>
          
          {/* ລາຍການໄຟລ໌ທີ່ອັບໂຫລດ */}
          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">ໄຟລ໌ທີ່ອັບໂຫລດ ({files.length})</h4>
              <ul className="divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li key={index} className="py-2 flex justify-between items-center">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ລຶບ
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <Link 
            href="/leaves" 
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
          >
            ຍົກເລີກ
          </Link>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ກຳລັງສົ່ງ...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                ສົ່ງຄຳຂໍລາ
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
