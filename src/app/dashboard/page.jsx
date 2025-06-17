'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase/context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Clock, 
  Users, 
  Calendar, 
  FileCheck, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Briefcase,
  TrendingUp,
  BarChart,
  Building2,
  UserCircle,
  Layers,
  PieChart
} from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';

export default function DashboardPage() {
  const { user, loading: authLoading } = useFirebase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;
    
    // Check if user is logged in
    if (!user) {
      router.push('/login');
      return;
    }
    
    setLoading(false);

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('ສະບາຍດີຕອນເຊົ້າ');
    } else if (hour < 17) {
      setGreeting('ສະບາຍດີຕອນບ່າຍ');
    } else {
      setGreeting('ສະບາຍດີຕອນແລງ');
    }
  }, [user, router, authLoading]);

  // Show loading while auth is being checked or while component is loading
  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen">ກຳລັງໂຫລດ...</div>;
  }

  // If no user after auth loading is complete, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // สร้างข้อมูลสถิติสำหรับแสดงผล (จะถูกแทนที่ด้วยข้อมูลจริงจาก Firebase ในภายหลัง)
  const stats = [
    { 
      title: 'พนักงานทั้งหมด', 
      value: '24', 
      trend: '+2 จากเดือนที่แล้ว', 
      trendUp: true,
      icon: <Users className="h-6 w-6 text-blue-500" />,
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'มาทำงานวันนี้', 
      value: '18', 
      trend: '75% ของพนักงาน', 
      trendUp: null,
      icon: <Clock className="h-6 w-6 text-green-500" />,
      bgColor: 'bg-green-50'
    },
    { 
      title: 'ขาดงานวันนี้', 
      value: '6', 
      trend: '25% ของพนักงาน', 
      trendUp: false,
      icon: <Calendar className="h-6 w-6 text-red-500" />,
      bgColor: 'bg-red-50'
    },
    { 
      title: 'คำขอลารออนุมัติ', 
      value: '3', 
      trend: 'อัปเดต 3 ชม. ที่แล้ว', 
      trendUp: null,
      icon: <FileText className="h-6 w-6 text-amber-500" />,
      bgColor: 'bg-amber-50'
    },
  ];

  // ข้อมูลส่วนเพิ่มเติม
  const insightsData = [
    { 
      title: 'อัตราการมาทำงาน', 
      value: '92%', 
      trend: '+5% จากเดือนที่แล้ว', 
      trendUp: true,
      icon: <TrendingUp className="h-5 w-5 text-indigo-500" />,
      bgColor: 'bg-indigo-50'
    },
    { 
      title: 'ประสิทธิภาพองค์กร', 
      value: '87%', 
      trend: '+3% จากไตรมาสที่แล้ว', 
      trendUp: true,
      icon: <BarChart className="h-5 w-5 text-purple-500" />,
      bgColor: 'bg-purple-50'
    },
    { 
      title: 'ตำแหน่งว่าง', 
      value: '4', 
      trend: 'เปิดรับสมัคร', 
      trendUp: null,
      icon: <Briefcase className="h-5 w-5 text-cyan-500" />,
      bgColor: 'bg-cyan-50'
    },
    { 
      title: 'จำนวนแผนก', 
      value: '8', 
      trend: 'ทั่วประเทศ', 
      trendUp: null,
      icon: <Building2 className="h-5 w-5 text-teal-500" />,
      bgColor: 'bg-teal-50'
    },
  ];

  // ข้อมูลกราฟการมาทำงาน
  const attendanceData = [
    { day: 'จ', present: 22, absent: 2, late: 0, date: '30 พ.ค.' },
    { day: 'อ', present: 20, absent: 3, late: 1, date: '31 พ.ค.' },
    { day: 'พ', present: 21, absent: 2, late: 1, date: '1 มิ.ย.' },
    { day: 'พฤ', present: 19, absent: 3, late: 2, date: '2 มิ.ย.' },
    { day: 'ศ', present: 18, absent: 5, late: 1, date: '3 มิ.ย.' },
    { day: 'ส', present: 8, absent: 16, late: 0, date: '4 มิ.ย.' },
    { day: 'อา', present: 5, absent: 19, late: 0, date: '5 มิ.ย.' },
  ];

  // ข้อมูลคำขอลา
  const leaveRequests = [
    { name: 'ນາງ ນິດສະດາ ແກ້ວປະເສີດ', type: 'ລາປ່ວຍ', dates: '10-12 ມິ.ຍ. 2025', status: 'pending', avatar: 'N' },
    { name: 'ທ້າວ ວິໄລພອນ ສົມສັກດາ', type: 'ລາພັກຮ້ອນ', dates: '15-16 ມິ.ຍ. 2025', status: 'pending', avatar: 'V' },
    { name: 'ທ້າວ ສຸລິນທອນ ພົມມະຈັນ', type: 'ລາກິດ', dates: '8 ມິ.ຍ. 2025', status: 'approved', avatar: 'S' },
    { name: 'ນາງ ພອນສະຫວັນ ແສງທອງ', type: 'ລາປ່ວຍ', dates: '20-22 ມິ.ຍ. 2025', status: 'pending', avatar: 'P' },
  ];

  // ข้อมูลการลงเวลาล่าสุด
  const recentAttendance = [
    { name: 'ທ້າວ ວິໄຊ ສຸກສະຫວັດດີ', position: 'ຜູ້ຈັດການຝ່າຍບຸກຄົນ', date: '05/06/2025', checkIn: '08:30', checkOut: '17:45', status: 'normal' },
    { name: 'ນາງ ນິດສະດາ ແກ້ວປະເສີດ', position: 'ນັກພັດທະນາຊອບແວ', date: '05/06/2025', checkIn: '09:05', checkOut: '18:00', status: 'late' },
    { name: 'ທ້າວ ວິໄລພອນ ສົມສັກດາ', position: 'ເຈົ້າໜ້າທີ່ການຕະຫຼາດ', date: '05/06/2025', checkIn: '08:15', checkOut: '17:30', status: 'normal' },
    { name: 'ນາງ ສຸດາ ສີວິໄລ', position: 'ຜູ້ຈັດການຝ່າຍການເງິນ', date: '05/06/2025', checkIn: '08:45', checkOut: '-', status: 'working' },
    { name: 'ທ້າວ ສຸລິນທອນ ພົມມະຈັນ', position: 'ເຈົ້າໜ້າທີ່ປະຊາສຳພັນ', date: '05/06/2025', checkIn: '-', checkOut: '-', status: 'absent' },
  ];

  // การกระจายตัวของพนักงานตามแผนก
  const departmentDistribution = [
    { department: 'การตลาด', count: 6 },
    { department: 'ไอที', count: 4 },
    { department: 'การเงิน', count: 3 },
    { department: 'ฝ่ายบุคคล', count: 3 },
    { department: 'ปฏิบัติการ', count: 5 },
    { department: 'ขาย', count: 3 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCircle className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{greeting}, {user?.displayName || 'ຜູ້ໃຊ້ງານ'}</h1>
                  <p className="text-gray-500">
                    {new Date().toLocaleDateString('lo-LA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">ການແຈ້ງເຕືອນ</span>
              </Button>
              <Button 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => router.push('/clock')}
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">ລົງເວລາ</span>
              </Button>
            </div>
          </div>
      
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-3 lg:justify-start">
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center justify-center py-3 gap-2 flex-1 max-w-[160px]"
              onClick={() => router.push('/leaves/new')}
            >
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-xs">ຂໍລາພັກ</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center justify-center py-3 gap-2 flex-1 max-w-[160px]"
              onClick={() => router.push('/attendance')}
            >
              <FileCheck className="h-5 w-5 text-green-600" />
              <span className="text-xs">ປະຫວັດການລົງເວລາ</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center justify-center py-3 gap-2 flex-1 max-w-[160px]"
              onClick={() => router.push('/payroll')}
            >
              <Layers className="h-5 w-5 text-purple-600" />
              <span className="text-xs">ເງິນເດືອນ</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center justify-center py-3 gap-2 flex-1 max-w-[160px]"
              onClick={() => router.push('/directory')}
            >
              <PieChart className="h-5 w-5 text-amber-600" />
              <span className="text-xs">ສະຖິຕິຂອງຂ້ອຍ</span>
            </Button>
          </div>
      
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-xs text-slate-500 flex items-center">
                        {stat.trendUp !== null && (
                          <span className={`mr-1 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                            {stat.trendUp ? '↑' : '↓'}
                          </span>
                        )}
                        {stat.trend}
                      </p>
                    </div>
                    <div className={`p-3 ${stat.bgColor} rounded-full`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      
          {/* Attendance Analytics and Leave Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Analytics */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">ສະຖິຕິການມາເຮັດວຽກ</CardTitle>
                    <CardDescription>ຍ້ອນຫຼັງ 7 ວັນ</CardDescription>
                  </div>
                  <Badge variant="secondary">75% ອັດຕາການມາເຮັດວຽກ</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex flex-col justify-between">
                  {/* ส่วนกราฟแท่งด้วยกราฟแท่งอย่างง่าย */}
                  <div className="flex items-end space-x-2 h-48 mb-4">
                    {attendanceData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 group relative">
                        <div className="w-full flex flex-col items-center space-y-1 h-40">
                          {data.late > 0 && (
                            <div 
                              className="w-full bg-amber-400 rounded-t-sm" 
                              style={{ height: `${(data.late / 24) * 160}px` }}
                            />
                          )}
                          {data.absent > 0 && (
                            <div 
                              className="w-full bg-red-400 rounded-t-sm" 
                              style={{ height: `${(data.absent / 24) * 160}px` }}
                            />
                          )}
                          {data.present > 0 && (
                            <div 
                              className="w-full bg-green-400 rounded-t-sm" 
                              style={{ height: `${(data.present / 24) * 160}px` }}
                            />
                          )}
                        </div>
                        <div className="text-xs font-medium mt-2">{data.day}</div>
                        <div className="text-[10px] text-gray-500">{data.date}</div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          มาทำงาน: {data.present} คน<br />
                          ขาดงาน: {data.absent} คน<br />
                          มาสาย: {data.late} คน
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-sm mr-2"></div>
                      <span className="text-xs">ມາເຮັດວຽກ</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-sm mr-2"></div>
                      <span className="text-xs">ຂາດເຮັດວຽກ</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-amber-400 rounded-sm mr-2"></div>
                      <span className="text-xs">ມາຊ້າ</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Leave Requests */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">ຄຳຂໍລາພັກລ່າສຸດ</CardTitle>
                    <CardDescription>ລໍຖ້າການອະນຸມັດ</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/leaves')}
                  >
                    ເບິ່ງທັງໝົດ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaveRequests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          {request.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <div className="flex items-center text-sm text-slate-500">
                            <span className="mr-2">{request.type}</span>
                            <span>•</span>
                            <span className="ml-2">{request.dates}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {request.status === 'pending' ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            ລໍຖ້າອະນຸມັດ
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            ອະນຸມັດແລ້ວ
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {insightsData.map((insight, index) => (
              <Card key={index} className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${insight.bgColor} rounded-full`}>
                      {insight.icon}
                    </div>
                    <h3 className="font-medium text-sm text-gray-700">{insight.title}</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{insight.value}</p>
                    <p className="text-xs text-slate-500 flex items-center">
                      {insight.trendUp !== null && (
                        <span className={`mr-1 ${insight.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                          {insight.trendUp ? '↑' : '↓'}
                        </span>
                      )}
                      {insight.trend}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Recent Attendance Table */}
          <div className="mt-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">ການລົງເວລາລ່າສຸດ</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/attendance')}
                  >
                    ເບິ່ງທັງໝົດ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ຊື່-ນາມສະກຸນ</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ຕໍາແໜ່ງ</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ວັນທີ</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ເວລາເຂົ້າ</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ເວລາອອກ</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ສະຖານະ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttendance.map((record, index) => (
                        <tr key={index} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">{record.name}</td>
                          <td className="py-3 px-4">{record.position}</td>
                          <td className="py-3 px-4">{record.date}</td>
                          <td className="py-3 px-4">{record.checkIn}</td>
                          <td className="py-3 px-4">{record.checkOut}</td>
                          <td className="py-3 px-4">
                            {record.status === 'normal' && <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">ປົກກະຕິ</Badge>}
                            {record.status === 'late' && <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">ມາຊ້າ</Badge>}
                            {record.status === 'working' && <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">ກຳລັງເຮັດວຽກ</Badge>}
                            {record.status === 'absent' && <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">ບໍ່ມາເຮັດວຽກ</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}