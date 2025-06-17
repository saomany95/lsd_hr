'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase/context';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function LeavesPage() {
  const { user, getUserLeaves } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [expandedLeave, setExpandedLeave] = useState(null);

  useEffect(() => {
    const fetchLeaves = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const leavesData = await getUserLeaves(user.id);
        setLeaves(leavesData);
      } catch (error) {
        console.error('Error fetching leaves:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [user, getUserLeaves]);

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

  const toggleExpandLeave = (leaveId) => {
    if (expandedLeave === leaveId) {
      setExpandedLeave(null);
    } else {
      setExpandedLeave(leaveId);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg">ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງຂໍ້ມູນການລາ</p>
        <Link href="/login" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
          ເຂົ້າສູ່ລະບົບ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ຂໍ້ມູນການລາ</h1>
        <Link 
          href="/leaves/create" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="mr-2" size={18} />
          ສ້າງຄຳຂໍລາໃໝ່
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg">
          {leaves.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {leaves.map((leave) => (
                <div key={leave.id} className="p-4">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpandLeave(leave.id)}
                  >
                    <div className="flex items-center">
                      <Calendar className="mr-3 text-blue-500" size={20} />
                      <div>
                        <h3 className="font-medium">{getLeaveTypeName(leave.leaveType)}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusBadge(leave.status)}
                      <ChevronDown 
                        className={`ml-2 transition-transform ${expandedLeave === leave.id ? 'transform rotate-180' : ''}`} 
                        size={18} 
                      />
                    </div>
                  </div>
                  
                  {expandedLeave === leave.id && (
                    <div className="mt-4 pl-9 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 mb-2">
                            <span className="font-medium">ປະເພດການລາ:</span> {getLeaveTypeName(leave.leaveType)}
                          </p>
                          <p className="text-gray-500 mb-2">
                            <span className="font-medium">ວັນທີເລີ່ມ:</span> {formatDate(leave.startDate)}
                          </p>
                          <p className="text-gray-500 mb-2">
                            <span className="font-medium">ວັນທີສິ້ນສຸດ:</span> {formatDate(leave.endDate)}
                          </p>
                          <p className="text-gray-500 mb-2">
                            <span className="font-medium">ສະຖານະ:</span> {getStatusBadge(leave.status)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-2">
                            <span className="font-medium">ເຫດຜົນ:</span>
                          </p>
                          <p className="bg-gray-50 p-2 rounded">{leave.reason}</p>
                          
                          {leave.attachments && leave.attachments.length > 0 && (
                            <div className="mt-3">
                              <p className="text-gray-500 mb-2">
                                <span className="font-medium">ເອກະສານແນບ:</span>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {leave.attachments.map((attachment, index) => (
                                  <a 
                                    key={index}
                                    href={attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center bg-gray-100 hover:bg-gray-200 rounded-md px-2 py-1"
                                  >
                                    <FileText size={14} className="mr-1" />
                                    <span className="text-xs">ເອກະສານ {index + 1}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {leave.status !== 'pending' && (
                            <p className="text-gray-500 mt-3">
                              <span className="font-medium">ອະນຸມັດໂດຍ:</span> {leave.approvedBy || '-'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {leave.status === 'pending' && (
                        <div className="mt-4 flex justify-end">
                          <Link 
                            href={`/leaves/edit/${leave.id}`}
                            className="text-blue-500 hover:text-blue-700 mr-4"
                          >
                            ແກ້ໄຂ
                          </Link>
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລີກຄຳຂໍລານີ້?')) {
                                // ຟັງຊັນຍົກເລີກຄຳຂໍລາ
                              }
                            }}
                          >
                            ຍົກເລີກ
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>ທ່ານຍັງບໍ່ມີປະຫວັດການລາ</p>
              <Link 
                href="/leaves/create" 
                className="mt-4 inline-block text-blue-500 hover:text-blue-700"
              >
                ສ້າງຄຳຂໍລາໃໝ່
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
