'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, Search, Eye, Building, MapPin, Clock } from 'lucide-react';
import { 
  getAllOffices, 
  deleteOffice,
  toggleOfficeStatus
} from '@/firebase/offices';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function OfficesPage() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOffices();
  }, [statusFilter]);

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const officesList = await getAllOffices(statusFilter);
      setOffices(officesList);
    } catch (error) {
      console.error('Error fetching offices:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສຳນັກງານ');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredOffices = offices.filter(office => 
    office.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    office.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (office) => {
    setOfficeToDelete(office);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (officeToDelete) {
      try {
        setIsDeleting(true);
        await deleteOffice(officeToDelete.id);
        await fetchOffices();
        toast.success('ລຶບສຳນັກງານສຳເລັດແລ້ວ', {
          duration: 3000,
          icon: '✅',
        });
      } catch (error) {
        console.error('Error deleting office:', error);
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບສຳນັກງານ: ' + error.message, {
          duration: 5000,
          icon: '❌',
        });
      } finally {
        setShowDeleteDialog(false);
        setOfficeToDelete(null);
        setIsDeleting(false);
      }
    }
  };

  const handleToggleStatus = async (office) => {
    try {
      const newStatus = office.status === 'active' ? 'inactive' : 'active';
      await toggleOfficeStatus(office.id, newStatus);
      toast.success(`ປ່ຽນສະຖານະສຳນັກງານເປັນ ${newStatus === 'active' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'} ສຳເລັດແລ້ວ`);
      fetchOffices();
    } catch (error) {
      console.error('Error toggling office status:', error);
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະສຳນັກງານ');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ຈັດການສຳນັກງານ</h1>
        <Link
          href="/admin/offices/create"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center text-sm"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          ເພີ່ມສຳນັກງານໃໝ່
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ຄົ້ນຫາສຳນັກງານ..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">ສະຖານະ:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ທັງໝົດ</option>
              <option value="active">ເປີດໃຊ້ງານ</option>
              <option value="inactive">ປິດໃຊ້ງານ</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຊື່ສຳນັກງານ/ຈຸດກວດ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ສະຖານທີ່
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ສະຖານະ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຈັດການ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
                  </td>
                </tr>
              ) : filteredOffices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchQuery ? 'ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ' : 'ບໍ່ມີຂໍ້ມູນສຳນັກງານ'}
                  </td>
                </tr>
              ) : (
                filteredOffices.map((office) => (
                  <tr key={office.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{office.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {office.location || 'ບໍ່ມີຂໍ້ມູນ'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          office.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {office.status === 'active' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(office)}
                          className={`p-1 rounded-full ${
                            office.status === 'active'
                              ? 'hover:bg-red-100 text-red-600'
                              : 'hover:bg-green-100 text-green-600'
                          }`}
                          title={office.status === 'active' ? 'ປິດໃຊ້ງານ' : 'ເປີດໃຊ້ງານ'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/offices/edit/${office.id}`}
                          className="p-1 rounded-full hover:bg-yellow-100 text-yellow-600"
                          title="ແກ້ໄຂ"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(office)}
                          className="p-1 rounded-full hover:bg-red-100 text-red-600"
                          title="ລຶບ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200">
            <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
              <Trash2 className="h-5 w-5 text-red-500 mr-2" />
              ຢືນຢັນການລຶບ
            </h3>
            <p className="text-gray-700 mb-6">
              ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສຳນັກງານ "<span className="font-medium">{officeToDelete?.name}</span>"?
              <br />
              <span className="text-red-500 text-sm mt-2 block">ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.</span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                disabled={isDeleting}
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ກຳລັງລຶບ...
                  </>
                ) : (
                  'ລຶບ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 