'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Save, Check } from 'lucide-react';
import { createDepartment } from '@/firebase/departments';
import { getAllOrganizations } from '@/firebase/organizations';
import { getAllDepartments } from '@/firebase/departments';
import { toast } from 'react-hot-toast';

export default function CreateDepartmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    name_lo: '',
    code: '',
    description: '',
    organizationId: '',
    parentDepartmentId: '',
    managerId: '',
    budgetCode: '',
    costCenter: '',
    isActive: true
  });

  // โหลดรายการองค์กรและแผนก
  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgs = await getAllOrganizations(false);
        const depts = await getAllDepartments(false);
        setOrganizations(orgs);
        setDepartments(depts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // กรองแผนกตามองค์กรที่เลือก
  useEffect(() => {
    if (selectedOrg) {
      const filtered = departments.filter(dept => dept.organizationId === selectedOrg);
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments([]);
    }
  }, [selectedOrg, departments]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'organizationId') {
      setSelectedOrg(value);
      if (value && !selectedOrganizations.includes(value)) {
        setSelectedOrganizations([...selectedOrganizations, value]);
      }
      
      setFormData({
        ...formData,
        organizationId: value,
        parentDepartmentId: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleOrganizationCheckboxChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setSelectedOrganizations([...selectedOrganizations, value]);
    } else {
      setSelectedOrganizations(selectedOrganizations.filter(id => id !== value));
      
      if (value === formData.organizationId) {
        setFormData({
          ...formData,
          organizationId: '',
          parentDepartmentId: ''
        });
        setSelectedOrg('');
      }
    }
  };

  const setAsMainOrganization = (orgId) => {
    setFormData({
      ...formData,
      organizationId: orgId
    });
    setSelectedOrg(orgId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!formData.name_lo || !formData.code) {
        throw new Error('กรุณากรอกข้อมูลที่จำเป็น: ชื่อแผนก (ลาว) และรหัส');
      }
      
      if (selectedOrganizations.length === 0) {
        throw new Error('กรุณาเลือกองค์กรอย่างน้อย 1 องค์กร');
      }
      
      if (!formData.organizationId && selectedOrganizations.length > 0) {
        formData.organizationId = selectedOrganizations[0];
      }
      
      await createDepartment(formData, selectedOrganizations);
      
      toast.success('ສ້າງພະແນກສຳເລັດແລ້ວ');
      
      router.push('/admin/departments');
    } catch (error) {
      console.error('Error creating department:', error);
      setError(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງພະແນກ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-5xl">
      <div className="flex items-center mb-4 sm:mb-6">
        <Link href="/admin/departments" className="mr-2 sm:mr-4">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 hover:text-gray-900" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">ເພີ່ມພະແນກໃໝ່</h1>
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
          <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-1 sm:mr-2" />
          <h2 className="text-base sm:text-lg font-medium text-gray-900">ຂໍ້ມູນພະແນກ</h2>
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
                    ຊື່ພະແນກ (ລາວ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name_lo"
                    value={formData.name_lo}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="ກະລຸນາປ້ອນຊື່ພະແນກເປັນພາສາລາວ"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ຊື່ພະແນກ (ອັງກິດ)
                  </label>
                  <input
                    type="text"
                    name="name_en"
                    value={formData.name_en}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Enter department name in English"
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
                    placeholder="ເຊັ່ນ: DEPT001"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">ລະຫັດນີ້ຈະໃຊ້ສຳລັບອ້າງອີງໃນລະບົບ</p>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ລາຍລະອຽດ
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    rows="3"
                    placeholder="ອະທິບາຍກ່ຽວກັບພະແນກນີ້"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm sm:text-md font-medium mb-3 sm:mb-4 text-blue-700 pb-1 sm:pb-2 border-b border-gray-200">
                ຂໍ້ມູນໂຄງສ້າງ ແລະ ການເງິນ
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ອົງກອນ <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 sm:p-4 max-h-48 overflow-y-auto">
                    <p className="text-xs text-gray-500 mb-2">ເລືອກອົງກອນທັງໝົດທີ່ພະແນກນີ້ສັງກັດຢູ່</p>
                    
                    {organizations.length === 0 ? (
                      <p className="text-sm text-gray-500">ບໍ່ພົບຂໍ້ມູນອົງກອນ</p>
                    ) : (
                      <div className="space-y-2">
                        {organizations.map(org => (
                          <div key={org.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`org-${org.id}`}
                              value={org.id}
                              checked={selectedOrganizations.includes(org.id)}
                              onChange={handleOrganizationCheckboxChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`org-${org.id}`} className="ml-2 block text-sm text-gray-900">
                              {org.name_lo || org.name || org.code || `Organization ${org.id}`}
                            </label>
                            {selectedOrganizations.includes(org.id) && (
                              <button
                                type="button"
                                onClick={() => setAsMainOrganization(org.id)}
                                className={`ml-2 px-2 py-0.5 text-xs rounded ${
                                  formData.organizationId === org.id 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                {formData.organizationId === org.id ? (
                                  <>
                                    <Check className="inline-block h-3 w-3 mr-1" />
                                    ອົງກອນຫຼັກ
                                  </>
                                ) : (
                                  'ຕັ້ງເປັນອົງກອນຫຼັກ'
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">ເລືອກອົງກອນຢ່າງໜ້ອຍ 1 ອົງກອນ ແລະ ກຳນົດອົງກອນຫຼັກ</p>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ພະແນກແມ່
                  </label>
                  <select
                    name="parentDepartmentId"
                    value={formData.parentDepartmentId}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                    disabled={!formData.organizationId}
                  >
                    <option value="">ບໍ່ມີ (ພະແນກຫຼັກ)</option>
                    {filteredDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name_lo || dept.name || dept.code || `Department ${dept.id}`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">ເລືອກພະແນກແມ່ ຫຼື ປ່ອຍວ່າງໄວ້ຖ້າເປັນພະແນກລະດັບສູງສຸດ</p>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ລະຫັດງົບປະມານ
                  </label>
                  <input
                    type="text"
                    name="budgetCode"
                    value={formData.budgetCode}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="ລະຫັດງົບປະມານສຳລັບພະແນກນີ້"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ສູນຕົ້ນທຶນ
                  </label>
                  <input
                    type="text"
                    name="costCenter"
                    value={formData.costCenter}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="ລະຫັດສູນຕົ້ນທຶນ"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                    ເປີດໃຊ້ງານພະແນກນີ້
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 flex justify-end space-x-3">
            <Link
              href="/admin/departments"
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-sm sm:text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ຍົກເລີກ
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[100px] justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
