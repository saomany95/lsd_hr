'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Building2, Users, FileText, ArrowLeft, Briefcase, Calendar, Menu, X, Database, ChevronDown, ChevronUp, LayoutDashboard, UserCircle, Settings, MapPin, CheckCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState({ userManagement: false, settings: false });
  
  const menuItems = [
    {
      name: 'ຈັດການອົງກອນ',
      path: '/admin/organizations',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      name: 'ຈັດການຜະແນກ',
      path: '/admin/departments',
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      name: 'ຈັດການຕຳແໜ່ງ',
      path: '/admin/positions',
      icon: <Users className="w-5 h-5" />
    },
    {
      name: 'ຈັດການວັນພັກ',
      path: '/admin/leaves',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      name: 'ຈັດການສຳນັກງານ',
      path: '/admin/offices',
      icon: <MapPin className="w-5 h-5" />
    }
  ];
  
  // เมนูสำหรับการจัดการผู้ใช้และพนักงาน
  const userManagementItems = [
    {
      name: 'ບັນຊີຜູ້ໃຊ້',
      path: '/admin/users',
      icon: <UserCircle className="w-5 h-5" />
    },
    {
      name: 'ຂໍ້ມູນພະນັກງານ',
      path: '/admin/employees',
      icon: <Briefcase className="w-5 h-5" />
    }
  ];

  // เมนูสำหรับการตั้งค่าระบบ
  const settingsItems = [
    {
      name: 'ຕັ້ງຄ່າຕໍາແໜ່ງ',
      path: '/admin/settings',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // ฟังก์ชันตรวจสอบว่า path ปัจจุบันเป็น active path หรือไม่
  const isPathActive = (itemPath) => {
    // ถ้า path ตรงกันพอดี
    if (pathname === itemPath) return true;
    
    // ถ้าเป็น path ย่อยของ item path
    if (itemPath !== '/' && pathname.startsWith(itemPath)) return true;
    
    return false;
  };

  const toggleCategory = (category) => {
    setOpenCategories({ ...openCategories, [category]: !openCategories[category] });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:block flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">ຈັດການລະບົບ</h2>
        </div>
        <nav className="p-4">
          <Link 
            href="/dashboard" 
            className="flex items-center text-gray-700 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>ກັບໄປໜ້າຫຼັກ</span>
          </Link>
          
          <div className="space-y-1">
            {menuItems.map(item => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg transition-colors",
                  isPathActive(item.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* หมวดหมู่การจัดการผู้ใช้ */}
          <div className="mt-6">
            <button 
              onClick={() => toggleCategory('userManagement')} 
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-left rounded-lg transition-colors",
                isPathActive('/admin/users') || isPathActive('/admin/employees')
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                ຈັດການຜູ້ໃຊ້
              </span>
              {openCategories.userManagement ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {openCategories.userManagement && (
              <div className="pl-8 mt-2 space-y-1">
                {userManagementItems.map(item => (
                  <Link 
                    key={item.path}
                    href={item.path} 
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg transition-colors",
                      isPathActive(item.path)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* หมวดหมู่การตั้งค่าระบบ */}
          <div className="mt-6">
            <button 
              onClick={() => toggleCategory('settings')} 
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-left rounded-lg transition-colors",
                isPathActive('/admin/settings')
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <span className="flex items-center">
                <Settings className="w-5 h-5 mr-3" />
                ຕັ້ງຄ່າລະບົບ
              </span>
              {openCategories.settings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {openCategories.settings && (
              <div className="pl-8 mt-2 space-y-1">
                {settingsItems.map(item => (
                  <Link 
                    key={item.path}
                    href={item.path} 
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg transition-colors",
                      isPathActive(item.path)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
      
      {/* Mobile Header and Navigation */}
      <div className="md:hidden">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                onClick={toggleMobileMenu}
                className="text-gray-500 focus:outline-none focus:text-gray-700 mr-3"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <h2 className="text-lg font-semibold text-gray-800">ຈັດການລະບົບ</h2>
            </div>
            <Link 
              href="/dashboard" 
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>ກັບໄປໜ້າຫຼັກ</span>
            </Link>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="bg-white border-b border-gray-200 animate-slideIn shadow-md">
              <div className="p-4 space-y-2">
                <Link 
                  href="/dashboard" 
                  className="flex items-center text-gray-700 hover:text-blue-600 mb-4 pb-4 border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span>ກັບໄປໜ້າຫຼັກ</span>
                </Link>

                {menuItems.map((item, index) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center px-3 py-3 rounded-lg transition-colors",
                      isPathActive(item.path)
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100",
                      "transform transition-transform hover:translate-x-1"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      opacity: 0,
                      animation: 'fadeIn 0.3s ease-out forwards'
                    }}
                  >
                    <span className="mr-3 text-blue-500">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {/* หมวดหมู่การจัดการผู้ใช้สำหรับโมบาย */}
                <div className="pt-2">
                  <button 
                    onClick={() => toggleCategory('userManagement')} 
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-3 text-left rounded-lg transition-colors",
                      isPathActive('/admin/users') || isPathActive('/admin/employees')
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100",
                      "transform transition-transform hover:translate-x-1"
                    )}
                    style={{ 
                      animationDelay: `${menuItems.length * 0.05}s`,
                      opacity: 0,
                      animation: 'fadeIn 0.3s ease-out forwards'
                    }}
                  >
                    <span className="flex items-center">
                      <Users className="w-5 h-5 mr-3 text-blue-500" />
                      <span>ຈັດການຜູ້ໃຊ້</span>
                    </span>
                    {openCategories.userManagement ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {openCategories.userManagement && (
                    <div className="pl-6 mt-2 space-y-2">
                      {userManagementItems.map((item, idx) => (
                        <Link 
                          key={item.path}
                          href={item.path} 
                          className={cn(
                            "flex items-center px-3 py-3 rounded-lg transition-colors",
                            isPathActive(item.path)
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-100",
                            "transform transition-transform hover:translate-x-1"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                          style={{ 
                            animationDelay: `${(menuItems.length + 1 + idx) * 0.05}s`,
                            opacity: 0,
                            animation: 'fadeIn 0.3s ease-out forwards'
                          }}
                        >
                          <span className="mr-3 text-blue-500">{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* หมวดหมู่การตั้งค่าระบบสำหรับโมบาย */}
                <div className="pt-2">
                  <button 
                    onClick={() => toggleCategory('settings')} 
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-3 text-left rounded-lg transition-colors",
                      isPathActive('/admin/settings')
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100",
                      "transform transition-transform hover:translate-x-1"
                    )}
                    style={{ 
                      animationDelay: `${(menuItems.length + userManagementItems.length + 1) * 0.05}s`,
                      opacity: 0,
                      animation: 'fadeIn 0.3s ease-out forwards'
                    }}
                  >
                    <span className="flex items-center">
                      <Settings className="w-5 h-5 mr-3 text-blue-500" />
                      <span>ຕັ້ງຄ່າລະບົບ</span>
                    </span>
                    {openCategories.settings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {openCategories.settings && (
                    <div className="pl-6 mt-2 space-y-2">
                      {settingsItems.map((item, idx) => (
                        <Link 
                          key={item.path}
                          href={item.path} 
                          className={cn(
                            "flex items-center px-3 py-3 rounded-lg transition-colors",
                            isPathActive(item.path)
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-100",
                            "transform transition-transform hover:translate-x-1"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                          style={{ 
                            animationDelay: `${(menuItems.length + userManagementItems.length + 2 + idx) * 0.05}s`,
                            opacity: 0,
                            animation: 'fadeIn 0.3s ease-out forwards'
                          }}
                        >
                          <span className="mr-3 text-blue-500">{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {children}
      </div>
    </div>
  );
} 