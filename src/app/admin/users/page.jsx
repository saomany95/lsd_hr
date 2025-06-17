'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase/context';
import { User, UserPlus, Edit, Trash2, Search, Eye, Filter, X, UserCheck, Mail, Phone, Briefcase, Clock, Shield } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';


export default function UsersManagement() {
  const { getAllUsers, deleteUser } = useFirebase();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getAllUsers();
        
        // แปลงข้อมูลให้เป็นรูปแบบที่พร้อมแสดงผล
        const formattedUsers = usersData.map(user => {
          // สร้าง displayName หากไม่มี
          if (!user.displayName && (user.name || user.lastname)) {
            user.displayName = `${user.name || ''} ${user.lastname || ''}`.trim();
          }
          
          // แปลง role ให้เป็นรูปแบบที่เข้าใจง่าย
          if (Array.isArray(user.role) && user.role.length > 0) {
            // ใช้ role ที่มีอยู่แล้ว
          } else if (typeof user.role === 'string') {
            // แปลง role เป็น array ถ้าเป็น string
            user.role = [user.role];
          } else {
            // กำหนดค่าเริ่มต้นถ้าไม่มี role
            user.role = ['staff'];
          }
          return user;
        });
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getAllUsers]);

  useEffect(() => {
    let results = users;
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(user => 
        (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastname?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phoneNumber?.includes(searchTerm)) ||
        (user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.department?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.departmentId?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by role
    if (filterRole !== 'all') {
      results = results.filter(user => {
        if (Array.isArray(user.role)) {
          return user.role.includes(filterRole);
        } else {
          return user.role === filterRole;
        }
      });
    }
    
    setFilteredUsers(results);
  }, [searchTerm, users, filterRole]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        setIsDeleting(true);
        await deleteUser(userToDelete.id);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
        toast.success('ລຶບຜູ້ໃຊ້ສຳເລັດແລ້ວ');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບຜູ້ໃຊ້');
      } finally {
        setShowDeleteDialog(false);
        setUserToDelete(null);
        setIsDeleting(false);
      }
    }
  };

  const viewUserDetails = (user) => {
    
    // แปลงข้อมูลที่อยู่จาก address object (ถ้ามี) ให้เป็นฟิลด์แยก
    if (user.address) {
      if (typeof user.address === 'object') {
        user.village = user.address.village || user.village;
        user.district = user.address.district || user.district;
        user.province = user.address.province || user.province;
      } else if (typeof user.address === 'string') {
      }
    }
    
    setSelectedUser(user);
    setShowUserDetails(true);
    toast.success(`ກຳລັງສະແດງຂໍ້ມູນຂອງ ${user.name || user.displayName || 'ຜູ້ໃຊ້'}`, {
      duration: 2000,
      icon: '👤',
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '-';
    
    try {
      // Check if timestamp is a Firebase timestamp
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString('lo-LA');
      }
      
      // Otherwise try to format as a date string
      return new Date(timestamp).toLocaleString('lo-LA');
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ຈັດການຜູ້ໃຊ້</h1>
        <Link 
          href="/admin/users/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <UserPlus className="mr-2" size={18} />
          ເພີ່ມຜູ້ໃຊ້ໃໝ່
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="ຄົ້ນຫາຕາມຊື່, ເບີໂທ, ລະຫັດພະນັກງານ, ພະແນກ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">ທຸກສິດທິ</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">ຜົນການຄົ້ນຫາ:</span>
            <span className="font-medium">{filteredUsers.length}</span>
            <span className="mx-1">ຈາກທັງໝົດ</span>
            <span className="font-medium">{users.length}</span>
            <span>ລາຍການ</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    ຊື່-ນາມສະກຸນ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    ເບີໂທລະສັບ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    ອີເມລ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    ສິດທິ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    ສະຖານະ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    ຈັດການ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profilePhotoUrl ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                                src={user.profilePhotoUrl} 
                                alt={(user.name || '') + ' ' + (user.lastname || '')} 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                                <User className="h-6 w-6 text-blue-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name ? `${user.name} ${user.lastname || ''}` : 
                               user.displayName ? user.displayName : 
                               '-'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phoneNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          Array.isArray(user.role) && user.role.includes('admin') || user.role === 'admin'
                            ? 'bg-red-100 text-red-800' 
                            : Array.isArray(user.role) && user.role.includes('manager') || user.role === 'manager'
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {Array.isArray(user.role) 
                            ? user.role.join(', ') 
                            : user.role || 'staff'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition"
                          title="ເບິ່ງລາຍລະອຽດ"
                        >
                          <Eye className="inline-block h-5 w-5" />
                        </button>
                        <Link 
                          href={`/admin/users/edit/${user.id}`} 
                          className="text-indigo-600 hover:text-indigo-900 p-1 ml-1 hover:bg-indigo-50 rounded transition"
                          title="ແກ້ໄຂ"
                        >
                          <Edit className="inline-block h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(user)} 
                          className="text-red-600 hover:text-red-900 p-1 ml-1 hover:bg-red-50 rounded transition"
                          title="ລຶບ"
                        >
                          <Trash2 className="inline-block h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 bg-gray-50">
                      {searchTerm || filterRole !== 'all' ? 'ບໍ່ພົບຜູ້ໃຊ້ທີ່ກົງກັບການຄົ້ນຫາ' : 'ບໍ່ມີຂໍ້ມູນຜູ້ໃຊ້'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center rounded-t-xl">
              <h2 className="text-2xl font-bold flex items-center text-gray-800">
                <User className="h-6 w-6 mr-3 text-blue-600" />
                ລາຍລະອຽດຜູ້ໃຊ້
              </h2>
              <button 
                onClick={() => setShowUserDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8">
              {/* Header Section with Profile */}
              <div className="flex flex-col lg:flex-row lg:items-start gap-8 mb-8">
                <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-sm border border-blue-100">
                  <div className="h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {selectedUser.profilePhotoUrl ? (
                      <img 
                        src={selectedUser.profilePhotoUrl} 
                        alt={(selectedUser.name || '') + ' ' + (selectedUser.lastname || '')}
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <User className="h-24 w-24 text-blue-500" />
                    )}
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-center text-gray-800">
                    {selectedUser.name 
                      ? `${selectedUser.name} ${selectedUser.lastname || ''}` 
                      : selectedUser.displayName || '-'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">ລະຫັດພະນັກງານ: {selectedUser.employeeId || '-'}</p>
                  <span className={`mt-4 px-5 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    Array.isArray(selectedUser.role) && selectedUser.role.includes('admin') || selectedUser.role === 'admin'
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : Array.isArray(selectedUser.role) && selectedUser.role.includes('manager') || selectedUser.role === 'manager'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                        : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    <Shield className="h-4 w-4 mr-2" />
                    {Array.isArray(selectedUser.role) 
                      ? selectedUser.role.join(', ') 
                      : selectedUser.role || 'staff'}
                  </span>
                  <div className={`mt-3 px-4 py-2 rounded-full text-sm font-medium ${
                    selectedUser.isActive 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {selectedUser.isActive ? '✓ ເປີດໃຊ້ງານ' : '✗ ປິດໃຊ້ງານ'}
                  </div>
                </div>
                
                {/* Main Info Grid */}
                <div className="flex-1 space-y-8">
                  {/* ຂໍ້ມູນສ່ວນຕົວ */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                    <h4 className="text-xl font-bold mb-6 text-blue-800 pb-3 border-b border-blue-200 flex items-center">
                      <UserCheck className="h-6 w-6 mr-3" />
                      ຂໍ້ມູນສ່ວນຕົວ
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">ຊື່</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {selectedUser.firstName || selectedUser.name || selectedUser.firstname || 
                               (selectedUser.displayName && selectedUser.displayName.split(' ')[0]) || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">ນາມສະກຸນ</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {selectedUser.lastName || selectedUser.lastname || selectedUser.surname || 
                               (selectedUser.displayName && selectedUser.displayName.split(' ').slice(1).join(' ')) || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center mb-2">
                          <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <UserCheck className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">ຊື່ (ພາສາອັງກິດ)</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {selectedUser.firstName_lo || selectedUser.firstname_lo || selectedUser.nameEn || 
                               selectedUser.name_en || selectedUser.firstNameEn || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center mb-2">
                          <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <UserCheck className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">ນາມສະກຸນ (ພາສາອັງກິດ)</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {selectedUser.lastName_lo || selectedUser.lastname_lo || selectedUser.lastnameEn || 
                               selectedUser.lastname_en || selectedUser.lastNameEn || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">ອີເມລ</p>
                            <p className="text-lg font-semibold text-gray-800">{selectedUser.email || '-'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center mb-2">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">ເບີໂທລະສັບ</p>
                            <p className="text-lg font-semibold text-gray-800">{selectedUser.phoneNumber || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 flex justify-end space-x-4 border-t rounded-b-xl">
              <Link
                href={`/admin/users/edit/${selectedUser.id}`}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 inline-flex items-center shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Edit className="h-5 w-5 mr-2" />
                ແກ້ໄຂຂໍ້ມູນ
              </Link>
              <button
                onClick={() => setShowUserDetails(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-lg transition-all duration-200"
              >
                ປິດ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && userToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center text-red-600">
                <Trash2 className="h-5 w-5 mr-2" />
                ຢືນຢັນການລຶບຜູ້ໃຊ້
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
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4 border border-gray-200">
                  {userToDelete.profilePhotoUrl ? (
                    <img 
                      src={userToDelete.profilePhotoUrl} 
                      alt={userToDelete.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {userToDelete.name 
                      ? `${userToDelete.name} ${userToDelete.lastname || ''}` 
                      : userToDelete.displayName || 'ຜູ້ໃຊ້'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {userToDelete.email || userToDelete.phoneNumber || ''}
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
                      ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຜູ້ໃຊ້ນີ້? ການດຳເນີນການນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.
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
                    ລຶບຜູ້ໃຊ້
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
