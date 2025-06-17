'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase/context';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AttendanceHistory() {
  const { user, getUserAttendanceHistory, getTodayAttendance } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filteredHistory, setFilteredHistory] = useState([]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // ดึงข้อมูลการลงเวลาวันนี้
        const today = await getTodayAttendance(user.id);
        setTodayAttendance(today);
        
        // ดึงประวัติการลงเวลา
        const history = await getUserAttendanceHistory(user.id, 90); // 3 เดือนย้อนหลัง
        setAttendanceHistory(history);
        
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user, getTodayAttendance, getUserAttendanceHistory]);

  // กรองประวัติตามเดือนปัจจุบัน
  useEffect(() => {
    if (!attendanceHistory.length) {
      setFilteredHistory([]);
      return;
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const filtered = attendanceHistory.filter(record => {
      const recordDate = record.date.toDate ? record.date.toDate() : new Date(record.date);
      return recordDate.getFullYear() === year && recordDate.getMonth() === month;
    });
    
    setFilteredHistory(filtered);
  }, [attendanceHistory, currentMonth]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const nextDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (nextDate <= new Date()) {
      setCurrentMonth(nextDate);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm:ss');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd/MM/yyyy');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">ມາເຮັດວຽກ</span>;
      case 'late':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">ມາຊ້າ</span>;
      case 'absent':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">ຂາດ</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg">ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງປະຫວັດການລົງເວລາ</p>
        <Link href="/login" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
          ເຂົ້າສູ່ລະບົບ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ປະຫວັດການລົງເວລາ</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* ข้อมูลการลงเวลาวันนี้ */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">ການລົງເວລາວັນນີ້</h2>
            
            {todayAttendance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-4">
                    <Calendar className="mr-2 text-blue-500" />
                    <span className="font-medium">ວັນທີ:</span>
                    <span className="ml-2">{formatDate(todayAttendance.date)}</span>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <Clock className="mr-2 text-green-500" />
                    <span className="font-medium">ເວລາເຂົ້າ:</span>
                    <span className="ml-2">{formatTime(todayAttendance.clockInTime)}</span>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <Clock className="mr-2 text-red-500" />
                    <span className="font-medium">ເວລາອອກ:</span>
                    <span className="ml-2">
                      {todayAttendance.clockOutTime ? formatTime(todayAttendance.clockOutTime) : 'ຍັງບໍ່ໄດ້ລົງເວລາອອກ'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-4">
                    <MapPin className="mr-2 text-blue-500" />
                    <span className="font-medium">ສະຖານທີ່ເຂົ້າ:</span>
                    <span className="ml-2 text-sm">
                      {todayAttendance.clockInLocation?.address || '-'}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <MapPin className="mr-2 text-red-500" />
                    <span className="font-medium">ສະຖານທີ່ອອກ:</span>
                    <span className="ml-2 text-sm">
                      {todayAttendance.clockOutLocation?.address || '-'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="mr-2 text-gray-500" />
                    <span className="font-medium">ສະຖານະ:</span>
                    <span className="ml-2">
                      {getStatusBadge(todayAttendance.status)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">ທ່ານຍັງບໍ່ໄດ້ລົງເວລາໃນວັນນີ້</p>
            )}
          </div>
          
          {/* ประวัติการลงเวลา */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">ປະຫວັດການລົງເວລາ</h2>
              
              <div className="flex items-center">
                <button 
                  onClick={prevMonth}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="mx-2 min-w-[120px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                
                <button 
                  onClick={nextMonth}
                  className="p-1 rounded-full hover:bg-gray-100"
                  disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ວັນທີ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ເວລາເຂົ້າ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ເວລາອອກ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ສະຖານະ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ໝາຍເຫດ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(record.clockInTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.clockOutTime ? formatTime(record.clockOutTime) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        ບໍ່ມີຂໍ້ມູນການລົງເວລາໃນເດືອນນີ້
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
