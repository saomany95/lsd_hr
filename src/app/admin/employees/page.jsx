'use client';

import { useState, useEffect } from 'react';
import { getAllEmployees, deleteEmployee } from '@/firebase/employees';
import { getAllDepartments } from '@/firebase/departments';
import { getAllUsers } from '@/firebase/users';
import { User, UserPlus, Edit, Trash2, Search, Eye, Filter, X, UserCheck, Mail, Phone, Briefcase, Clock, Shield, PlusCircle, UserCircle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmployeesManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsMap, setDepartmentsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [positionsMap, setPositionsMap] = useState({});

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const employeesData = await getAllEmployees();
        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const deptData = await getAllDepartments(false);
        setDepartments(deptData);
        
        // สร้าง Map ของ ID แผนกกับชื่อแผนก เพื่อให้ง่ายต่อการค้นหา
        const deptMap = {};
        deptData.forEach(dept => {
          deptMap[dept.id] = dept.name_lo || dept.name || dept.code || `Department ${dept.id}`;
        });
        setDepartmentsMap(deptMap);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        
        // สร้าง Map ของ userId กับข้อมูล user เพื่อให้ง่ายต่อการค้นหา
        const userMap = {};
        usersData.forEach(user => {
          userMap[user.id] = user;
        });
        setUsersMap(userMap);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchPositions = async () => {
      try {
        const { getAllPositions } = await import('@/firebase/positions');
        const positions = await getAllPositions(false);
        
        // สร้าง Map ของ position ID กับชื่อตำแหน่ง
        const posMap = {};
        positions.forEach(pos => {
          posMap[pos.id] = pos.name_lo || pos.title_lo || pos.name || pos.title || pos.id;
        });
        
        console.log('Positions map created:', posMap);
        setPositionsMap(posMap);
      } catch (error) {
        console.error('Error fetching positions:', error);
      }
    };

    fetchEmployees();
    fetchDepartments();
    fetchUsers();
    fetchPositions();
  }, []);

  useEffect(() => {
    let results = employees;
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(employee => {
        // สนับสนุนทั้งรูปแบบข้อมูลเก่าและใหม่
        const firstName = employee.firstName || employee.personalInfo?.firstName || '';
        const lastName = employee.lastName || employee.personalInfo?.lastName || '';
        const firstName_lo = employee.firstName_lo || employee.personalInfo?.firstName_lo || '';
        const lastName_lo = employee.lastName_lo || employee.personalInfo?.lastName_lo || '';
        const phoneNumber = employee.phoneNumber || employee.personalInfo?.contactPhone || '';
        const employeeId = employee.employeeId || employee.employmentInfo?.employeeId || '';
        const departmentName = employee.departmentName || employee.employmentInfo?.departmentName || '';
        const departmentId = employee.departmentId || employee.employmentInfo?.departmentId || '';
        const positionName = employee.positionName || employee.employmentInfo?.positionName || '';
        
        const searchLower = searchTerm.toLowerCase();
        
        return (
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower) ||
          firstName_lo.toLowerCase().includes(searchLower) ||
          lastName_lo.toLowerCase().includes(searchLower) ||
          phoneNumber.includes(searchTerm) ||
          employeeId.toLowerCase().includes(searchLower) ||
          departmentName.toLowerCase().includes(searchLower) ||
          departmentId.toLowerCase().includes(searchLower) ||
          positionName.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      results = results.filter(employee => {
        const status = employee.status || employee.employmentInfo?.status;
        return status === filterStatus;
      });
    }
    
    setFilteredEmployees(results);
  }, [searchTerm, employees, filterStatus]);

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        setIsDeleting(true);
        await deleteEmployee(employeeToDelete.id);
        setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== employeeToDelete.id));
        toast.success('ລຶບຂໍ້ມູນພະນັກງານສຳເລັດແລ້ວ');
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນພະນັກງານ');
      } finally {
        setShowDeleteDialog(false);
        setEmployeeToDelete(null);
        setIsDeleting(false);
      }
    }
  };

  const viewEmployeeDetails = (employee) => {
    console.log('Employee details (complete object):', employee);
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
    toast.success(`ກຳລັງສະແດງຂໍ້ມູນຂອງ ${employee.personalInfo?.firstName || 'ພະນັກງານ'}`, {
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

  // แปลง departmentId เป็นชื่อแผนก
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return '-';
    return departmentsMap[departmentId] || departmentId;
  };

  // ฟังก์ชันสำหรับดึงชื่อตำแหน่งจาก positionId
  const getPositionName = (positionId) => {
    if (!positionId) return '-';
    return positionsMap[positionId] || '-';
  };

  // ดึงข้อมูล user สำหรับ employee
  const getUserInfo = (employee) => {
    if (employee.userId && usersMap[employee.userId]) {
      return usersMap[employee.userId];
    }
    return null;
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">ຈັດການຂໍ້ມູນພະນັກງານ</h1>
          <p className="text-gray-500">ເພີ່ມ, ແກ້ໄຂ ແລະ ຈັດການຂໍ້ມູນພະນັກງານທັງໝົດໃນລະບົບ</p>
        </div>
        <Link href="/admin/employees/create" className="mt-4 sm:mt-0">
          <Button className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            ເພີ່ມພະນັກງານໃໝ່
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>ລາຍຊື່ພະນັກງານ</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 justify-between w-full">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ຄົ້ນຫາພະນັກງານ..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="flex items-center h-10"
                >
                  <X className="mr-2 h-4 w-4" />
                  ລ້າງການຄົ້ນຫາ
                </Button>
              )}
              <Link href="/admin/employees/create">
                <Button size="sm" className="flex items-center h-10">
                  <UserPlus className="mr-2 h-4 w-4" />
                  ເພີ່ມພະນັກງານ
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>ລະຫັດພະນັກງານ</TableHead>
                  <TableHead>ຊື່-ນາມສະກຸນ</TableHead>
                  <TableHead>ຕຳແໜ່ງ</TableHead>
                  <TableHead>ຜະແນກ</TableHead>
                  <TableHead>ສະຖານະ</TableHead>
                  <TableHead className="text-right">ຈັດການ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        {employee.profileImage ? (
                          <img 
                            src={employee.profileImage} 
                            alt={`${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`}
                            className="h-10 w-10 rounded-full object-cover" 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-blue-500" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{employee.employmentInfo?.employeeId || employee.employeeId || "-"}</TableCell>
                      <TableCell>
                        <div>
                          {employee.personalInfo?.firstName_lo || employee.firstName_lo || ""} {employee.personalInfo?.lastName_lo || employee.lastName_lo || ""}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.personalInfo?.firstName || employee.firstName || ""} {employee.personalInfo?.lastName || employee.lastName || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          console.log(`Position data for ${employee.id}:`, {
                            positionName: employee.employmentInfo?.positionName,
                            positionId: employee.employmentInfo?.positionId,
                            oldPositionName: employee.positionName
                          });
                          
                          // ใช้ positionName ถ้ามี หรือดึงจาก positionId ถ้าไม่มี
                          const positionId = employee.employmentInfo?.positionId || employee.positionId;
                          const storedPositionName = employee.employmentInfo?.positionName || employee.positionName;
                          
                          if (storedPositionName && storedPositionName !== '-') {
                            return storedPositionName;
                          } else if (positionId) {
                            return getPositionName(positionId);
                          } else {
                            return "-";
                          }
                        })()}
                      </TableCell>
                      <TableCell>{getDepartmentName(employee.employmentInfo?.departmentId || employee.departmentId) || "-"}</TableCell>
                      <TableCell>
                        {(() => {
                          const status = employee.employmentInfo?.status || employee.isActive === undefined ? true : employee.isActive;
                          if (status === 'active' || status === true) {
                            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ພະນັກງານປະຈຸບັນ</Badge>;
                          } else if (status === 'on-leave') {
                            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">ລາພັກ</Badge>;
                          } else if (status === 'terminated' || status === false) {
                            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">ພົ້ນສະພາບ</Badge>;
                          } else {
                            return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">ບໍ່ມີຂໍ້ມູນ</Badge>;
                          }
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => viewEmployeeDetails(employee)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">ເບິ່ງຂໍ້ມູນ</span>
                          </Button>
                          <Link href={`/admin/employees/edit/${employee.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">ແກ້ໄຂ</span>
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">ລຶບ</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <UserPlus className="h-10 w-10 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-500 mb-1">ຍັງບໍ່ມີຂໍ້ມູນພະນັກງານ</h3>
                        <p className="text-sm text-gray-400 mb-4">ທ່ານສາມາດເພີ່ມພະນັກງານໃໝ່ເພື່ອເລີ່ມຕົ້ນ</p>
                        <Link href="/admin/employees/create">
                          <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            ເພີ່ມພະນັກງານໃໝ່
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Search className="h-10 w-10 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-500 mb-1">ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ</h3>
                        <p className="text-sm text-gray-400 mb-4">ກະລຸນາລອງຄົ້ນຫາດ້ວຍຄຳອື່ນ ຫຼື ລ້າງການຄົ້ນຫາ</p>
                        <Button variant="outline" onClick={() => setSearchTerm('')}>
                          <X className="mr-2 h-4 w-4" />
                          ລ້າງການຄົ້ນຫາ
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Employee Details Modal */}
      {showEmployeeDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center rounded-t-xl">
              <h2 className="text-2xl font-bold flex items-center text-gray-800">
                <UserCircle className="h-6 w-6 mr-3 text-blue-600" />
                ລາຍລະອຽດພະນັກງານ
              </h2>
              <button 
                onClick={() => setShowEmployeeDetails(false)}
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
                    {selectedEmployee.profileImage ? (
                      <img 
                        src={selectedEmployee.profileImage} 
                        alt={`${selectedEmployee.personalInfo?.firstName || selectedEmployee.firstName} ${selectedEmployee.personalInfo?.lastName || selectedEmployee.lastName}`}
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <UserCircle className="h-24 w-24 text-blue-500" />
                    )}
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-center text-gray-800">
                    {selectedEmployee.personalInfo?.firstName || selectedEmployee.firstName || ''} {selectedEmployee.personalInfo?.lastName || selectedEmployee.lastName || ''}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {selectedEmployee.employmentInfo?.employeeId || selectedEmployee.employeeId || '-'}
                  </p>
                  <div className={`mt-4 px-5 py-2 rounded-full text-sm font-medium ${
                    (selectedEmployee.employmentInfo?.status || selectedEmployee.status) === 'active' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : (selectedEmployee.employmentInfo?.status || selectedEmployee.status) === 'on-leave'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {(() => {
                      const status = selectedEmployee.employmentInfo?.status || selectedEmployee.status || 'active';
                      if (status === 'active') return '✓ ພະນັກງານປະຈຸບັນ';
                      if (status === 'on-leave') return '⏸ ລາພັກ';
                      if (status === 'terminated') return '✗ ພົ້ນສະພາບ';
                      return '? ບໍ່ມີຂໍ້ມູນ';
                    })()}
                  </div>
                </div>
                
                {/* Main Info Grid */}
                <div className="flex-1 space-y-6">
                  {/* ຂໍ້ມູນສ່ວນຕົວ */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-blue-800 flex items-center">
                        <UserCheck className="h-5 w-5 mr-2" />
                        ຂໍ້ມູນສ່ວນຕົວ
                      </h4>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ຊື່ (ລາວ)</label>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.firstName || selectedEmployee.firstName || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ນາມສະກຸນ (ລາວ)</label>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.lastName || selectedEmployee.lastName || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ຊື່ (ອັງກິດ)</label>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.firstName_lo || selectedEmployee.firstName_lo || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ນາມສະກຸນ (ອັງກິດ)</label>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.lastName_lo || selectedEmployee.lastName_lo || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ເບີໂທລະສັບ</label>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.phoneNumber || selectedEmployee.personalInfo?.contactPhone || selectedEmployee.phoneNumber || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ອີເມລ</label>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.email || selectedEmployee.personalInfo?.contactEmail || selectedEmployee.personalInfo?.email || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ວັນເດືອນປີເກີດ</label>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.dateOfBirth || selectedEmployee.dateOfBirth || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ເພດ</label>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.gender === 'male' ? 'ຊາຍ' : 
                               selectedEmployee.personalInfo?.gender === 'female' ? 'ຍິງ' : 
                               selectedEmployee.gender === 'male' ? 'ຊາຍ' : 
                               selectedEmployee.gender === 'female' ? 'ຍິງ' : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ສະຖານະພາບການແຕ່ງງານ</label>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.maritalStatus === 'single' ? 'ໂສດ' : 
                               selectedEmployee.personalInfo?.maritalStatus === 'married' ? 'ແຕ່ງງານແລ້ວ' : 
                               selectedEmployee.maritalStatus === 'single' ? 'ໂສດ' : 
                               selectedEmployee.maritalStatus === 'married' ? 'ແຕ່ງງານແລ້ວ' : '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ສັນຊາດ</label>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.nationality || selectedEmployee.nationality || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ເລກບັດປະຈຳຕົວ</label>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.nationalId || selectedEmployee.nationalId || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ຂໍ້ມູນການເຮັດວຽກ */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-purple-800 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2" />
                        ຂໍ້ມູນການເຮັດວຽກ
                      </h4>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ລະຫັດພະນັກງານ</label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.employeeId || selectedEmployee.employeeId || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ອົງກອນ</label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.organizationId || selectedEmployee.organizationId || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ພະແນກ</label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {getDepartmentName(selectedEmployee.employmentInfo?.departmentId || selectedEmployee.departmentId) || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ຊື່ພະແນກ</label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.departmentName || selectedEmployee.departmentName || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ລະຫັດຕຳແໜ່ງ</label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.positionId || selectedEmployee.positionId || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ຕຳແໜ່ງ</label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.positionName || selectedEmployee.positionName || getPositionName(selectedEmployee.employmentInfo?.positionId || selectedEmployee.positionId) || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ປະເພດການຈ້າງ</label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.employmentType === 'full-time' ? 'ເຕັມເວລາ' :
                               selectedEmployee.employmentInfo?.employmentType === 'part-time' ? 'ບາງເວລາ' :
                               selectedEmployee.employmentType === 'full-time' ? 'ເຕັມເວລາ' :
                               selectedEmployee.employmentType === 'part-time' ? 'ບາງເວລາ' : '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ສະຖານະ</label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.status === 'active' ? 'ເຮັດວຽກຢູ່' :
                               selectedEmployee.employmentInfo?.status === 'on-leave' ? 'ລາພັກ' :
                               selectedEmployee.employmentInfo?.status === 'terminated' ? 'ພົ້ນສະພາບ' :
                               selectedEmployee.status === 'active' ? 'ເຮັດວຽກຢູ່' :
                               selectedEmployee.status === 'on-leave' ? 'ລາພັກ' :
                               selectedEmployee.status === 'terminated' ? 'ພົ້ນສະພາບ' : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ວັນທີເລີ່ມວຽກ</label>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.hireDate || selectedEmployee.hireDate || selectedEmployee.employmentInfo?.startDate || selectedEmployee.startDate || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ວັນທີສິ້ນສຸດ</label>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.endDate || selectedEmployee.endDate || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ຜູ້ຄວບຄຸມ</label>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.supervisor || selectedEmployee.supervisor || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ສະຖານທີ່ເຮັດວຽກ</label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {selectedEmployee.employmentInfo?.workLocation || selectedEmployee.workLocation || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ທີ່ຢູ່ */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-green-800 flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        ທີ່ຢູ່
                      </h4>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ບ້ານ</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.address?.village || 
                               selectedEmployee.address?.village || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ເມືອງ</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.address?.district || 
                               selectedEmployee.address?.district || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ແຂວງ</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="text-gray-900">
                              {selectedEmployee.personalInfo?.address?.province || 
                               selectedEmployee.address?.province || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ຂໍ້ມູນເງິນເດືອນ */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-amber-800 flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ຂໍ້ມູນເງິນເດືອນ ແລະ ບັນຊີ
                      </h4>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ເງິນເດືອນ</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-900">
                              {selectedEmployee.payrollInfo?.salary ? 
                                `${selectedEmployee.payrollInfo.salary.toLocaleString()} ກີບ` : 
                                selectedEmployee.salary ? 
                                `${selectedEmployee.salary.toLocaleString()} ກີບ` : '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ເລກປະກັນສັງຄົມ</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-gray-900">
                              {selectedEmployee.payrollInfo?.socialSecurityNumber || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ເລກປະຈຳຕົວຜູ້ເສຍພາສີ</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-gray-900">
                              {selectedEmployee.payrollInfo?.taxId || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <h5 className="text-md font-medium text-gray-700 mb-3">ຂໍ້ມູນບັນຊີທະນາຄານ</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-600">ຊື່ທະນາຄານ</label>
                            <div className="flex items-center">
                              <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                              </svg>
                              <span className="text-gray-900">
                                {selectedEmployee.payrollInfo?.bankAccount?.bankName || '-'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-600">ເລກບັນຊີ</label>
                            <div className="flex items-center">
                              <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              <span className="text-gray-900">
                                {selectedEmployee.payrollInfo?.bankAccount?.accountNumber || '-'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-600">ຊື່ບັນຊີ</label>
                            <div className="flex items-center">
                              <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-gray-900">
                                {selectedEmployee.payrollInfo?.bankAccount?.accountName || '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ຂໍ້ມູນລະບົບ */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-slate-800 flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        ຂໍ້ມູນລະບົບ
                      </h4>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ລະຫັດ ID</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            <span className="text-gray-900 font-mono text-sm">
                              {selectedEmployee.id || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ລະຫັດຜູ້ໃຊ້</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-gray-900 font-mono text-sm">
                              {selectedEmployee.userId || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ວັນທີສ້າງ</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-900">
                              {formatDateTime(selectedEmployee.createdAt) || '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ວັນທີປັບປຸງລ່າສຸດ</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-900">
                              {formatDateTime(selectedEmployee.updatedAt) || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-600">ສະຖານະການໃຊ້ງານ</label>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-gray-900">
                              {selectedEmployee.isActive === true ? 'ເປີດໃຊ້ງານ' : 
                               selectedEmployee.isActive === false ? 'ປິດໃຊ້ງານ' : '-'}
                            </span>
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
                href={`/admin/employees/edit/${selectedEmployee.id}`}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 inline-flex items-center shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Edit className="h-5 w-5 mr-2" />
                ແກ້ໄຂຂໍ້ມູນ
              </Link>
              <button
                onClick={() => setShowEmployeeDetails(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-lg transition-all duration-200"
              >
                ປິດ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>ຢືນຢັນການລຶບຂໍ້ມູນພະນັກງານ</DialogTitle>
              <DialogDescription>
                ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບພະນັກງານນີ້? ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white flex items-center"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ກຳລັງລຶບ...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    ລຶບ
                  </>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
} 