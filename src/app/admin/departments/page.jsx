'use client';

import { useState, useEffect, Fragment } from 'react';
import { 
  PlusCircle, Pencil, Trash2, ChevronDown, ChevronUp, Search, Eye, X, 
  Building2, Briefcase, Calendar, Clock, Hash, FileText, Info, Tag, Shield
} from 'lucide-react';
import { 
  getAllDepartments, 
  getDepartmentById,
  deleteDepartment,
  getMainDepartments,
  getSubDepartments
} from '@/firebase/departments';
import { getAllOrganizations } from '@/firebase/organizations';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import DepartmentDetailsModal from './components/DepartmentDetailsModal';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDepts, setExpandedDepts] = useState({});
  const [deptChildren, setDeptChildren] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsDept, setDetailsDept] = useState(null);
  const [filterOrg, setFilterOrg] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortField, setSortField] = useState('name_lo');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allDepts = await getAllDepartments(false);
      const orgs = await getAllOrganizations(false);
      
      setDepartments(allDepts);
      setOrganizations(orgs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOrgFilter = (e) => {
    setFilterOrg(e.target.value);
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = 
      dept.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.name_lo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOrg = filterOrg ? dept.organizationId === filterOrg : true;
    
    return matchesSearch && matchesOrg;
  });

  const toggleExpand = async (deptId) => {
    const newExpandedState = { ...expandedDepts };
    newExpandedState[deptId] = !expandedDepts[deptId];
    setExpandedDepts(newExpandedState);

    // Fetch children if expanding and not already loaded
    if (newExpandedState[deptId] && !deptChildren[deptId]) {
      try {
        const subDepts = await getSubDepartments(deptId);
        setDeptChildren({
          ...deptChildren,
          [deptId]: subDepts
        });
      } catch (error) {
        console.error('Error fetching sub-departments:', error);
      }
    }
  };

  const openDetailsModal = async (deptId) => {
    try {
      const dept = await getDepartmentById(deptId);
      setDetailsDept(dept);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching department details:', error);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsDept(null);
  };

  const handleDeleteClick = (dept) => {
    setSelectedDepartment(dept);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedDepartment) {
      try {
        setIsDeleting(true);
        await deleteDepartment(selectedDepartment.id);
        await fetchData();
        toast.success('ລຶບພະແນກສຳເລັດແລ້ວ', {
          duration: 3000,
          icon: '✅',
        });
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບພະແນກ: ' + error.message, {
          duration: 5000,
          icon: '❌',
        });
      } finally {
        setShowDeleteDialog(false);
        setSelectedDepartment(null);
        setIsDeleting(false);
      }
    }
  };

  const getOrgNameById = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? (org.name_lo || org.name) : '-';
  };

  const getParentDeptName = (parentId) => {
    const dept = departments.find(d => d.id === parentId);
    return dept ? (dept.name_lo || dept.name) : '-';
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (dept) => {
    setSelectedDepartment(dept);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">ຈັດການພະແນກ</h1>
        <Link
          href="/admin/departments/create"
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span>ເພີ່ມພະແນກໃໝ່</span>
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ຄົ້ນຫາພະແນກ..."
            className="pl-8 sm:pl-10 pr-2 sm:pr-4 py-2 border rounded-lg w-full text-sm sm:text-base"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div>
          <select
            value={filterOrg}
            onChange={handleOrgFilter}
            className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white text-sm sm:text-base"
          >
            <option value="">ທັງໝົດອົງກອນ</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.name_lo || org.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຊື່ພະແນກ
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ລະຫັດ
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  ອົງກອນ
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ສະຖານະ
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຈັດການ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 sm:px-6 py-3 sm:py-4 text-center text-gray-500 text-sm">
                    ບໍ່ພົບຂໍ້ມູນພະແນກ
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <Fragment key={dept.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <div className="flex items-center">
                          {deptChildren[dept.id]?.length > 0 || !deptChildren[dept.id] ? (
                            <button
                              onClick={() => toggleExpand(dept.id)}
                              className="mr-1 sm:mr-2 focus:outline-none"
                            >
                              {expandedDepts[dept.id] ? (
                                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                              )}
                            </button>
                          ) : (
                            <span className="w-4 sm:w-6"></span>
                          )}
                          <div className="ml-1 sm:ml-2">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-full">{dept.name_lo || dept.name}</div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-full">{dept.name_en}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500">
                        {dept.code}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {getOrgNameById(dept.organizationId)}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <span className={`px-1.5 sm:px-2 py-0.5 inline-flex text-[10px] sm:text-xs leading-4 sm:leading-5 font-semibold rounded-full ${dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {dept.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleViewDetails(dept)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <Link
                            href={`/admin/departments/${dept.id}`}
                            className="text-amber-600 hover:text-amber-900"
                          >
                            <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(dept)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedDepts[dept.id] && deptChildren[dept.id]?.map(subDept => (
                      <tr key={subDept.id} className="bg-gray-50 hover:bg-gray-100">
                        <td className="pl-8 sm:pl-12 pr-3 sm:pr-6 py-2 sm:py-4">
                          <div className="flex items-center">
                            <div className="ml-1 sm:ml-2">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-full">{subDept.name_lo || subDept.name}</div>
                              <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-full">{subDept.name_en}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500">
                          {subDept.code}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                          {getOrgNameById(subDept.organizationId)}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          <span className={`px-1.5 sm:px-2 py-0.5 inline-flex text-[10px] sm:text-xs leading-4 sm:leading-5 font-semibold rounded-full ${subDept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {subDept.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleViewDetails(subDept)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <Link
                              href={`/admin/departments/${subDept.id}`}
                              className="text-amber-600 hover:text-amber-900"
                            >
                              <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(subDept)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Department Details Modal */}
      <DepartmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        department={selectedDepartment}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        department={selectedDepartment}
        isDeleting={isDeleting}
      />
    </div>
  );
}
