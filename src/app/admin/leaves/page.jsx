'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase/context';
import { format } from 'date-fns';
import { Calendar, User, Search, CheckCircle, XCircle, Filter } from 'lucide-react';
import Link from 'next/link';

export default function AdminLeavesPage() {
  const { user, getAllLeaves, updateLeaveStatus } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingLeave, setProcessingLeave] = useState(null);

  useEffect(() => {
    const fetchLeaves = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const leavesData = await getAllLeaves();
        setLeaves(leavesData);
        setFilteredLeaves(leavesData);
      } catch (error) {
        console.error('Error fetching leaves:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [user, getAllLeaves]);

  useEffect(() => {
    // Filter leaves based on search query and status
    let filtered = [...leaves];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(leave => 
        leave.userName?.toLowerCase().includes(query) || 
        leave.userId?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }
    
    setFilteredLeaves(filtered);
  }, [leaves, searchQuery, statusFilter]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd/MM/yyyy');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">ອະນຸມັດແລ້ວ</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">ປະຕິເສດ</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">ລໍຖ້າການອະນຸມັດ</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>;
    }
  };

  const getLeaveTypeName = (type) => {
    switch (type) {
      case 'sick':
        return 'ລາປ່ວຍ';
      case 'vacation':
        return 'ລາພັກຜ່ອນ';
      case 'personal':
        return 'ລາກິດສ່ວນຕົວ';
      default:
        return type;
    }
  };

  const handleApprove = async (leaveId) => {
    if (!user || !user.role || (user.role !== 'admin' && user.role !== 'manager')) {
      alert('ທ່ານບໍ່ມີສິດອະນຸມັດຄຳຂໍລາ');
      return;
    }
    
    try {
      setProcessingLeave(leaveId);
      await updateLeaveStatus(leaveId, 'approved', user.displayName);
      
      // Update local state
      setLeaves(prev => prev.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'approved', approvedBy: user.displayName } 
          : leave
      ));
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('ເກີດຂໍ້ຜິດພາດໃນການອະນຸມັດຄຳຂໍລາ');
    } finally {
      setProcessingLeave(null);
    }
  };

  const handleReject = async (leaveId) => {
    if (!user || !user.role || (user.role !== 'admin' && user.role !== 'manager')) {
      alert('ທ່ານບໍ່ມີສິດປະຕິເສດຄຳຂໍລາ');
      return;
    }
    
    try {
      setProcessingLeave(leaveId);
      await updateLeaveStatus(leaveId, 'rejected', user.displayName);
      
      // Update local state
      setLeaves(prev => prev.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'rejected', approvedBy: user.displayName } 
          : leave
      ));
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('ເກີດຂໍ້ຜິດພາດໃນການປະຕິເສດຄຳຂໍລາ');
    } finally {
      setProcessingLeave(null);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg">ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້</p>
        <Link href="/" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
          ກັບໄປໜ້າຫຼັກ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ຈັດການຄຳຂໍລາ</h1>
      
      {/* ຕົວກອງ ແລະ ຄົ້ນຫາ */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ຄົ້ນຫາຕາມຊື່ພະນັກງານ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">ທັງໝົດ</option>
              <option value="pending">ລໍຖ້າການອະນຸມັດ</option>
              <option value="approved">ອະນຸມັດແລ້ວ</option>
              <option value="rejected">ປະຕິເສດ</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {filteredLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ພະນັກງານ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ປະເພດການລາ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ວັນທີລາ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ສະຖານະ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ຈັດການ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{leave.userName}</div>
                            <div className="text-sm text-gray-500">{leave.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getLeaveTypeName(leave.leaveType)}</div>
                        <div className="text-xs text-gray-500">
                          {leave.halfDay ? `ຄຶ່ງມື້ (${leave.halfDayPeriod === 'morning' ? 'ຊ່ວງເຊົ້າ' : 'ຊ່ວງບ່າຍ'})` : 'ເຕັມມື້'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-900">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(leave.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link 
                          href={`/admin/leaves/${leave.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          ລາຍລະອຽດ
                        </Link>
                        
                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(leave.id)}
                              disabled={processingLeave === leave.id}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              {processingLeave === leave.id ? 'ກຳລັງດຳເນີນການ...' : 'ອະນຸມັດ'}
                            </button>
                            
                            <button
                              onClick={() => handleReject(leave.id)}
                              disabled={processingLeave === leave.id}
                              className="text-red-600 hover:text-red-900"
                            >
                              {processingLeave === leave.id ? 'ກຳລັງດຳເນີນການ...' : 'ປະຕິເສດ'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchQuery || statusFilter !== 'all' ? (
                <p>ບໍ່ພົບຂໍ້ມູນຄຳຂໍລາທີ່ຕ້ອງການ</p>
              ) : (
                <p>ບໍ່ມີຄຳຂໍລາໃນລະບົບ</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
