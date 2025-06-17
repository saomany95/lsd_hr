import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Building2, Tag, ClipboardList, Users, FileText, CircleDollarSign } from 'lucide-react';
import { getAllOrganizations } from '@/firebase/organizations';

export default function DepartmentDetailsModal({ isOpen, onClose, department }) {
  const [organizations, setOrganizations] = useState([]);
  
  // โหลดข้อมูลองค์กร
  useEffect(() => {
    if (isOpen && department) {
      const fetchOrganizations = async () => {
        try {
          const orgs = await getAllOrganizations(false);
          setOrganizations(orgs);
        } catch (error) {
          console.error('Error fetching organizations:', error);
        }
      };
      
      fetchOrganizations();
    }
  }, [isOpen, department]);
  
  if (!department) return null;
  
  // สร้าง map ของ ID องค์กรและข้อมูลองค์กร เพื่อความสะดวกในการเข้าถึง
  const organizationsMap = organizations.reduce((map, org) => {
    map[org.id] = org;
    return map;
  }, {});
  
  // หาข้อมูลองค์กรหลัก
  const mainOrganization = department.organizationId ? organizationsMap[department.organizationId] : null;
  
  // หาข้อมูลองค์กรที่เกี่ยวข้อง
  const relatedOrganizations = department.relatedOrganizationIds?.map(id => organizationsMap[id]).filter(Boolean) || [];

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
                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                    ລາຍລະອຽດພະແນກ
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
                            ຊື່ພະແນກ (ລາວ)
                          </h5>
                          <p className="text-sm text-gray-900">{department.name_lo || '-'}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            ຊື່ພະແນກ (ອັງກິດ)
                          </h5>
                          <p className="text-sm text-gray-900">{department.name_en || '-'}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <ClipboardList className="h-3 w-3 mr-1" />
                            ລະຫັດ
                          </h5>
                          <p className="text-sm text-gray-900">{department.code || '-'}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            ລາຍລະອຽດ
                          </h5>
                          <p className="text-sm text-gray-900 whitespace-pre-line">
                            {department.description || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-3 pb-1 border-b border-gray-100">
                        ຂໍ້ມູນໂຄງສ້າງ ແລະ ການເງິນ
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            ອົງກອນຫຼັກ
                          </h5>
                          <p className="text-sm text-gray-900">
                            {mainOrganization 
                              ? (mainOrganization.name_lo || mainOrganization.name || mainOrganization.code)
                              : '-'}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            ອົງກອນທີ່ກ່ຽວຂ້ອງ
                          </h5>
                          {relatedOrganizations.length > 0 ? (
                            <ul className="text-sm text-gray-900 pl-4 list-disc">
                              {relatedOrganizations.map(org => (
                                <li key={org.id}>
                                  {org.name_lo || org.name || org.code}
                                  {org.id === department.organizationId && (
                                    <span className="ml-1 text-xs text-blue-600">(ຫຼັກ)</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-900">-</p>
                          )}
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            ສະຖານະ
                          </h5>
                          <p className="text-sm">
                            {department.isActive ? (
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
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <CircleDollarSign className="h-3 w-3 mr-1" />
                            ລະຫັດງົບປະມານ
                          </h5>
                          <p className="text-sm text-gray-900">{department.budgetCode || '-'}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <CircleDollarSign className="h-3 w-3 mr-1" />
                            ສູນຕົ້ນທຶນ
                          </h5>
                          <p className="text-sm text-gray-900">{department.costCenter || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
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