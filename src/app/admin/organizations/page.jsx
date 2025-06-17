'use client';

import { useState, useEffect, Fragment } from 'react';
import { PlusCircle, Pencil, Trash2, ChevronDown, ChevronUp, Search, Eye, X, Building2, FileText, Tag, MapPin, GitBranch, Clock, Hash } from 'lucide-react';
import { 
  getAllOrganizations, 
  createOrganization, 
  updateOrganization, 
  deleteOrganization,
  getMainOrganizations,
  getBranchesOfOrganization
} from '@/firebase/organizations';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { toast } from 'react-hot-toast';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrgs, setExpandedOrgs] = useState({});
  const [orgChildren, setOrgChildren] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsOrg, setDetailsOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    name_lo: '',
    code: '',
    type: 'company',
    parentId: null,
    address: '',
    isActive: true
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const orgs = await getAllOrganizations(false);
      const mainOrgs = orgs.filter(org => org.parentId === null);
      setOrganizations(mainOrgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredOrganizations = organizations.filter(org => 
    org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.name_lo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = async (orgId) => {
    const newExpandedState = { ...expandedOrgs };
    newExpandedState[orgId] = !expandedOrgs[orgId];
    setExpandedOrgs(newExpandedState);

    // Fetch children if expanding and not already loaded
    if (newExpandedState[orgId] && !orgChildren[orgId]) {
      try {
        // ดึงองค์กรทั้งหมดแทนที่จะดึงเฉพาะที่ isActive เป็น true
        const orgsRef = collection(db, 'organizations');
        const q = query(
          orgsRef,
          where('parentId', '==', orgId),
          orderBy('name')
        );
        
        const querySnapshot = await getDocs(q);
        
        const branches = [];
        querySnapshot.forEach((doc) => {
          branches.push({ id: doc.id, ...doc.data() });
        });

        setOrgChildren({
          ...orgChildren,
          [orgId]: branches
        });
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    }
  };

  const openAddModal = () => {
    setCurrentOrg(null);
    setFormData({
      name: '',
      name_en: '',
      name_lo: '',
      code: '',
      type: 'company',
      parentId: null,
      address: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (org) => {
    setCurrentOrg(org);
    setFormData({
      name: org.name || '',
      name_en: org.name_en || '',
      name_lo: org.name_lo || '',
      code: org.code || '',
      type: org.type || 'company',
      parentId: org.parentId || null,
      address: org.address || '',
      isActive: org.isActive
    });
    setIsModalOpen(true);
  };

  const openDetailsModal = (org) => {
    setDetailsOrg(org);
    setShowDetailsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentOrg) {
        // Update
        await updateOrganization(currentOrg.id, formData);
      } else {
        // Create
        await createOrganization(formData);
      }
      
      setIsModalOpen(false);
      fetchOrganizations();
    } catch (error) {
      console.error('Error saving organization:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    }
  };

  const handleDeleteClick = (org) => {
    setOrgToDelete(org);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (orgToDelete) {
      try {
        setIsDeleting(true);
        await deleteOrganization(orgToDelete.id);
        await fetchOrganizations();
        toast.success('ລຶບອົງກອນສຳເລັດແລ້ວ', {
          duration: 3000,
          icon: '✅',
        });
      } catch (error) {
        console.error('Error deleting organization:', error);
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບອົງກອນ: ' + error.message, {
          duration: 5000,
          icon: '❌',
        });
      } finally {
        setShowDeleteDialog(false);
        setOrgToDelete(null);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ຈັດການອົງກອນ</h1>
        <Link
          href="/admin/organizations/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          <span>ເພີ່ມອົງກອນໃໝ່</span>
        </Link>
      </div>

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="ຄົ້ນຫາອົງກອນ..."
          className="pl-10 pr-4 py-2 border rounded-lg w-full"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຊື່ອົງກອນ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ລະຫັດ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ປະເພດ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ສະຖານະ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຈັດການ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrganizations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    ບໍ່ພົບຂໍ້ມູນອົງກອນ
                  </td>
                </tr>
              ) : (
                filteredOrganizations.map((org) => (
                  <Fragment key={org.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {orgChildren[org.id]?.length > 0 || !orgChildren[org.id] ? (
                            <button
                              onClick={() => toggleExpand(org.id)}
                              className="mr-2 focus:outline-none"
                            >
                              {expandedOrgs[org.id] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          ) : (
                            <span className="w-6"></span>
                          )}
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">{org.name}</div>
                            <div className="text-sm text-gray-500">{org.name_en}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {org.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {org.type === 'company' ? 'ບໍລິສັດ' : 
                         org.type === 'branch' ? 'ສາຂາ' : 
                         org.type === 'department' ? 'ພະແນກ' : org.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          org.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {org.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openDetailsModal(org)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <Link
                            href={`/admin/organizations/edit/${org.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Pencil className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(org)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrgs[org.id] && orgChildren[org.id] && (
                      <>
                        {orgChildren[org.id].length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-2 text-sm text-gray-500 bg-gray-50">
                              <div className="ml-8">ບໍ່ມີໜ່ວຍງານຍ່ອຍ</div>
                            </td>
                          </tr>
                        ) : (
                          orgChildren[org.id].map(child => (
                            <tr key={child.id} className="bg-gray-50">
                              <td className="px-6 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-8">
                                    <div className="text-sm font-medium text-gray-900">{child.name}</div>
                                    <div className="text-sm text-gray-500">{child.name_en}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                {child.code}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                {child.type === 'company' ? 'ບໍລິສັດ' : 
                                 child.type === 'branch' ? 'ສາຂາ' : 
                                 child.type === 'department' ? 'ພະແນກ' : child.type}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  child.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {child.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                                </span>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => openDetailsModal(child)}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                  title="ເບິ່ງລາຍລະອຽດ"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => openEditModal(child)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                  title="ແກ້ໄຂ"
                                >
                                  <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(child)}
                                  className="text-red-600 hover:text-red-900"
                                  title="ລຶບ"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {currentOrg ? 'ແກ້ໄຂຂໍ້ມູນອົງກອນ' : 'ເພີ່ມອົງກອນໃໝ່'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="Enter organization name in English"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ຊື່ອົງກອນ (ໄທ)
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="กรุณาใส่ชื่อองค์กรเป็นภาษาไทย"
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        value={formData.parentId || ''}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        rows="3"
                        placeholder="ກະລຸນາປ້ອນທີ່ຢູ່ຂອງອົງກອນ"
                      ></textarea>
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
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
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    ຍົກເລີກ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                  >
                    <PlusCircle className={`h-4 w-4 mr-2 ${currentOrg ? 'hidden' : ''}`} />
                    <Pencil className={`h-4 w-4 mr-2 ${currentOrg ? '' : 'hidden'}`} />
                    {currentOrg ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມອົງກອນ'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Organization Details */}
      {showDetailsModal && detailsOrg && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                ລາຍລະອຽດອົງກອນ
              </h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="flex flex-col items-center bg-blue-50 p-6 rounded-xl shadow-sm">
                  <div className="h-36 w-36 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                    <Building2 className="h-20 w-20 text-blue-500" />
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-center">
                    {detailsOrg.name_lo || detailsOrg.name || detailsOrg.code}
                  </h3>
                  <span className={`mt-2 px-4 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    detailsOrg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {detailsOrg.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-lg font-medium mb-4 text-blue-700 flex items-center">
                        ຂໍ້ມູນທົ່ວໄປ
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ຊື່ອົງກອນ (ລາວ)</p>
                            <p className="font-medium">{detailsOrg.name_lo || '-'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ຊື່ອົງກອນ (ອັງກິດ)</p>
                            <p className="font-medium">{detailsOrg.name_en || '-'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ຊື່ອົງກອນ (ໄທ)</p>
                            <p className="font-medium">{detailsOrg.name || '-'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Hash className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ລະຫັດ</p>
                            <p className="font-medium">{detailsOrg.code || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-4 text-blue-700 flex items-center">
                        ຂໍ້ມູນເພີ່ມເຕີມ
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Tag className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ປະເພດ</p>
                            <p className="font-medium">
                              {detailsOrg.type === 'company' ? 'ບໍລິສັດ' : 
                               detailsOrg.type === 'branch' ? 'ສາຂາ' : 
                               detailsOrg.type === 'department' ? 'ພະແນກ' : detailsOrg.type}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ທີ່ຢູ່</p>
                            <p className="font-medium">{detailsOrg.address || '-'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <GitBranch className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ສັງກັດອົງກອນ</p>
                            <p className="font-medium">
                              {detailsOrg.parentId ? (
                                organizations.find(o => o.id === detailsOrg.parentId)?.name_lo || 
                                organizations.find(o => o.id === detailsOrg.parentId)?.name || 
                                '-'
                              ) : 'ບໍ່ມີ (ອົງກອນຫຼັກ)'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ວັນທີສ້າງ</p>
                            <p className="font-medium">
                              {detailsOrg.createdAt ? new Date(detailsOrg.createdAt.seconds * 1000).toLocaleString('lo-LA') : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-8 space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(detailsOrg);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  ແກ້ໄຂຂໍ້ມູນ
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ປິດ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteDialog && orgToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center text-red-600">
                <Trash2 className="h-5 w-5 mr-2" />
                ຢືນຢັນການລຶບອົງກອນ
              </h2>
              <button 
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4 bg-blue-100 flex items-center justify-center border border-gray-200">
                  <Building2 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium">
                    {orgToDelete.name_lo || orgToDelete.name || orgToDelete.code || 'ອົງກອນ'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {orgToDelete.type === 'company' ? 'ບໍລິສັດ' : 
                     orgToDelete.type === 'branch' ? 'ສາຂາ' : 
                     orgToDelete.type === 'department' ? 'ພະແນກ' : orgToDelete.type}
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບອົງກອນນີ້? ການດຳເນີນການນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm flex items-center disabled:opacity-50 disabled:pointer-events-none"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ກຳລັງລຶບ...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    ລຶບອົງກອນ
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
              >
                ຍົກເລີກ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 