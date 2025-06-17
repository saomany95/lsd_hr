import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Briefcase, Tag, ClipboardList, Building2, FileText, GraduationCap, Clock, BookOpen, Zap } from 'lucide-react';
import { getAllDepartments } from '@/firebase/departments';

export default function PositionDetailsModal({ isOpen, onClose, position }) {
  const [departments, setDepartments] = useState([]);
  
  // โหลดข้อมูลแผนก
  useEffect(() => {
    if (isOpen && position) {
      const fetchDepartments = async () => {
        try {
          const depts = await getAllDepartments(false);
          setDepartments(depts);
        } catch (error) {
          console.error('Error fetching departments:', error);
        }
      };
      
      fetchDepartments();
    }
  }, [isOpen, position]);
  
  if (!position) return null;
  
  // สร้าง map ของ ID แผนกและข้อมูลแผนก เพื่อความสะดวกในการเข้าถึง
  const departmentsMap = departments.reduce((map, dept) => {
    map[dept.id] = dept;
    return map;
  }, {});
  
  // หาข้อมูลแผนก
  const department = position.departmentId ? departmentsMap[position.departmentId] : null;
  
  // แปลงระดับตำแหน่งเป็นข้อความ
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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                <div className="bg-blue-50 px-6 py-3 flex justify-between items-center border-b border-blue-100">
                  <Dialog.Title as="h3" className="text-lg font-medium text-blue-900 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                    ລາຍລະອຽດຕຳແໜ່ງ
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-3 pb-1 border-b border-gray-100">
                        ຂໍ້ມູນພື້ນຖານ
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            ຊື່ຕຳແໜ່ງ (ລາວ)
                          </h5>
                          <p className="text-sm text-gray-900">{position.title_lo || '-'}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            ຊື່ຕຳແໜ່ງ (ອັງກິດ)
                          </h5>
                          <p className="text-sm text-gray-900">{position.title_en || '-'}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <ClipboardList className="h-3 w-3 mr-1" />
                            ລະຫັດ
                          </h5>
                          <p className="text-sm text-gray-900">{position.code || '-'}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            ພະແນກ
                          </h5>
                          <p className="text-sm text-gray-900">
                            {department 
                              ? (department.name_lo || department.name || department.code)
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-3 pb-1 border-b border-gray-100">
                        ຂໍ້ມູນຕຳແໜ່ງ
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            ລະດັບ
                          </h5>
                          <p className="text-sm text-gray-900">
                            {getLevelText(position.level)}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            ເກຣດ
                          </h5>
                          <p className="text-sm text-gray-900">{position.grade || '-'}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            ລາຍລະອຽດ
                          </h5>
                          <p className="text-sm text-gray-900 whitespace-pre-line">
                            {position.description || '-'}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <span className={`inline-flex h-2 w-2 mr-1 rounded-full ${position.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            ສະຖານະ
                          </h5>
                          <p className="text-sm">
                            {position.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ເປີດໃຊ້ງານ
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ປິດໃຊ້ງານ
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {position.requirements && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-blue-800 mb-3 pb-1 border-b border-gray-100">
                        ຄຸນສົມບັດທີ່ຕ້ອງການ
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            ການສຶກສາ
                          </h5>
                          <p className="text-sm text-gray-900 whitespace-pre-line">
                            {position.requirements.education || '-'}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            ປະສົບການ
                          </h5>
                          <p className="text-sm text-gray-900 whitespace-pre-line">
                            {position.requirements.experience || '-'}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            ທັກສະ
                          </h5>
                          <p className="text-sm text-gray-900 whitespace-pre-line">
                            {position.requirements.skills || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    ປິດ
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 