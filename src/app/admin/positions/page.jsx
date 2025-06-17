'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { 
  getAllPositions, 
  getPositionById,
  deletePosition,
  getPositionsByDepartment
} from '@/firebase/positions';
import { getAllDepartments } from '@/firebase/departments';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import PositionDetailsModal from './components/PositionDetailsModal';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';

export default function PositionsPage() {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allPositions = await getAllPositions(false);
      const depts = await getAllDepartments();
      
      setPositions(allPositions);
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeptFilter = (e) => {
    setFilterDept(e.target.value);
  };

  const filteredPositions = positions.filter(position => {
    const matchesSearch = 
      position.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.title_lo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = filterDept ? position.departmentId === filterDept : true;
    
    return matchesSearch && matchesDept;
  });

  const handleViewDetails = async (position) => {
    setSelectedPosition(position);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (position) => {
    setSelectedPosition(position);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedPosition) {
      try {
        setIsDeleting(true);
        await deletePosition(selectedPosition.id);
        await fetchData();
        toast.success('ລຶບຕຳແໜ່ງສຳເລັດແລ້ວ', {
          duration: 3000,
          icon: '✅',
        });
      } catch (error) {
        console.error('Error deleting position:', error);
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບຕຳແໜ່ງ: ' + error.message, {
          duration: 5000,
          icon: '❌',
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedPosition(null);
        setIsDeleting(false);
      }
    }
  };

  const getDeptNameById = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? (dept.name_lo || dept.name) : '-';
  };

  const getLevelText = (level) => {
    const levels = {
      1: 'Entry Level',
      2: 'Junior',
      3: 'Senior',
      4: 'Lead',
      5: 'Manager'
    };
    return levels[level] || level?.toString() || '-';
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">ຈັດການຕຳແໜ່ງ</h1>
        <Link
          href="/admin/positions/create"
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span>ເພີ່ມຕຳແໜ່ງໃໝ່</span>
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ຄົ້ນຫາຕຳແໜ່ງ..."
            className="pl-8 sm:pl-10 pr-2 sm:pr-4 py-2 border rounded-lg w-full text-sm sm:text-base"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div>
          <select
            value={filterDept}
            onChange={handleDeptFilter}
            className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white text-sm sm:text-base"
          >
            <option value="">ທັງໝົດພະແນກ</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name_lo || dept.name}
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
                  ຊື່ຕຳແໜ່ງ
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ລະຫັດ
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  ພະແນກ
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ລະດັບ
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
              {filteredPositions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 sm:px-6 py-3 sm:py-4 text-center text-gray-500 text-sm">
                    ບໍ່ພົບຂໍ້ມູນຕຳແໜ່ງ
                  </td>
                </tr>
              ) : (
                filteredPositions.map((position) => (
                  <tr key={position.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-full">{position.title_lo || position.title}</div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-full">{position.title_en}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500">
                      {position.code}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                      {getDeptNameById(position.departmentId)}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500">
                      {getLevelText(position.level)}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <span className={`px-1.5 sm:px-2 py-0.5 inline-flex text-[10px] sm:text-xs leading-4 sm:leading-5 font-semibold rounded-full ${position.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {position.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleViewDetails(position)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <Link
                          href={`/admin/positions/${position.id}`}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(position)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Position Details Modal */}
      <PositionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        position={selectedPosition}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        position={selectedPosition}
        isDeleting={isDeleting}
      />
    </div>
  );
} 