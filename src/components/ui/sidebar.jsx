'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  CalendarDays, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Building2,
  FileText,
  UserCircle,
  AlertCircle,
  User,
  Briefcase,
  Building,
  Bookmark,
  ChevronRight,
  ChevronDown,
  FileCheck,
  CheckCircle
} from 'lucide-react';
import { useFirebase } from '@/firebase/context';
import { cn } from '@/lib/utils';

export function Sidebar({ className }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useFirebase();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    admin: true,
  });

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check user role/permissions (placeholder - replace with actual role checking)
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@company.com';
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  // Get pending leave requests count (placeholder - replace with actual data)
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState(0);
  
  // Fetch pending leave requests count for managers
  useEffect(() => {
    const fetchPendingLeaves = async () => {
      if (isManager && user) {
        try {
          // TODO: Replace with actual Firebase query
          // const count = await getPendingLeaveRequestsCount(user.id);
          // setPendingLeaveRequests(count);
          
          // Mock data for demo
          setPendingLeaveRequests(3);
        } catch (error) {
          console.error('Error fetching pending leave requests:', error);
        }
      }
    };
    
    fetchPendingLeaves();
  }, [isManager, user]);
  
  // Categorized menu items with role-based visibility
  const menuCategories = [
    {
      id: 'main',
      title: 'ໜ້າຫຼັກ',
      items: [
        {
          title: 'ແຜງຄວບຄຸມ',
          icon: <LayoutDashboard className="h-5 w-5" />,
          path: '/dashboard',
          badge: null,
          visible: true
        }
      ]
    },
    {
      id: 'attendance',
      title: 'ລົງເວລາງານ',
      items: [
        {
          title: 'ລົງເວລາ',
          icon: <Clock className="h-5 w-5" />,
          path: '/clock',
          badge: null,
          visible: true
        },
        {
          title: 'ປະຫວັດການລົງເວລາ',
          icon: <FileCheck className="h-5 w-5" />,
          path: '/attendance',
          badge: null,
          visible: true
        }
      ]
    },
    {
      id: 'employees',
      title: 'ການຈັດການພະນັກງານ',
      items: [
        {
          title: 'ຂໍ້ມູນພະນັກງານ',
          icon: <Users className="h-5 w-5" />,
          path: '/employees',
          badge: null,
          visible: true // Everyone can view employee directory
        },
        {
          title: 'ໂຄງສ້າງອົງກອນ',
          icon: <Building2 className="h-5 w-5" />,
          path: '/organization',
          badge: null,
          visible: true
        }
      ]
    },
    {
      id: 'leaves',
      title: 'ການລາພັກຜ່ອນ',
      items: [
        {
          title: 'ຂໍລາພັກ',
          icon: <CalendarDays className="h-5 w-5" />,
          path: '/leaves/create',
          badge: null,
          visible: true
        },
        {
          title: 'ປະຫວັດການລາ',
          icon: <FileText className="h-5 w-5" />,
          path: '/leaves',
          badge: null,
          visible: true
        },
        {
          title: 'ອະນຸມັດການລາ',
          icon: <CheckCircle className="h-5 w-5" />,
          path: '/leaves/approvals',
          badge: pendingLeaveRequests > 0 ? pendingLeaveRequests : null,
          visible: isManager // Only managers can approve leaves
        }
      ]
    },
    {
      id: 'reports',
      title: 'ລາຍງານ',
      items: [
        {
          title: 'ລາຍງານການລົງເວລາ',
          icon: <FileText className="h-5 w-5" />,
          path: '/reports/attendance',
          badge: null,
          visible: isManager
        },
        {
          title: 'ລາຍງານການລາ',
          icon: <CalendarDays className="h-5 w-5" />,
          path: '/reports/leaves',
          badge: null,
          visible: isManager
        },
        {
          title: 'ລາຍງານພະນັກງານ',
          icon: <Users className="h-5 w-5" />,
          path: '/reports/employees',
          badge: null,
          visible: isManager
        }
      ]
    },
    {
      id: 'personal',
      title: 'ສ່ວນຕົວ',
      items: [
        {
          title: 'ໂປຣໄຟລ່ຂອງຂ້ອຍ',
          icon: <User className="h-5 w-5" />,
          path: '/profile',
          badge: null,
          visible: true
        },
        {
          title: 'ຕັ້ງຄ່າ',
          icon: <Settings className="h-5 w-5" />,
          path: '/settings',
          badge: null,
          visible: true
        }
      ]
    }
  ];

  // Admin menu section - only visible to admins
  const adminMenuSection = {
    id: 'admin',
    title: 'ຈັດການລະບົບ',
    visible: isAdmin,
    items: [
      {
        title: 'ອົງກອນ & ແຜນກ',
        icon: <Building className="h-5 w-5" />,
        path: '/admin/organizations',
        badge: null,
        visible: true
      },
      {
        title: 'ຈັດການແຜນກ',
        icon: <Briefcase className="h-5 w-5" />,
        path: '/admin/departments',
        badge: null,
        visible: true
      },
      {
        title: 'ຕຳແໜ່ງງານ',
        icon: <Bookmark className="h-5 w-5" />,
        path: '/admin/positions',
        badge: null,
        visible: true
      },
      {
        title: 'ຜູ້ໃຊ້ລະບົບ',
        icon: <UserCircle className="h-5 w-5" />,
        path: '/admin/users',
        badge: null,
        visible: true
      },
      {
        title: 'ຂໍ້ມູນພະນັກງານ',
        icon: <Users className="h-5 w-5" />,
        path: '/admin/employees',
        badge: null,
        visible: true
      },
      {
        title: 'ການຕັ້ງຄ່າລະບົບ',
        icon: <Settings className="h-5 w-5" />,
        path: '/admin/settings',
        badge: null,
        visible: true
      }
    ]
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ฟังก์ชันตรวจสอบว่า path ปัจจุบันเป็น active path หรือไม่
  const isPathActive = (itemPath) => {
    // ถ้า path ตรงกันพอดี
    if (pathname === itemPath) return true;
    
    // ถ้าเป็น path ย่อยของ item path
    if (itemPath !== '/' && pathname.startsWith(itemPath)) return true;
    
    return false;
  };

  const handleNavigation = (path) => {
    router.push(path);
    // Auto-collapse on mobile after navigation
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div className={cn(
        "fixed md:relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50",
        collapsed ? "w-[70px]" : "w-[240px]",
        "md:translate-x-0",
        collapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 min-h-[64px]">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">HR System</h2>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || user?.phoneNumber || ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {/* Render categorized menu items with visibility check */}
            {menuCategories.map((category) => {
              // Filter visible items
              const visibleItems = category.items.filter(item => item.visible);
              
              // Don't render category if no visible items
              if (visibleItems.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-4">
                  {!collapsed && (
                    <li className="pb-1">
                      <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category.title}
                      </div>
                    </li>
                  )}
                  
                  {visibleItems.map((item) => {
                    const isActive = isPathActive(item.path);
                    return (
                      <li key={item.path}>
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className={cn(
                            "flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 group relative",
                            isActive 
                              ? "bg-blue-50 text-blue-700 shadow-sm" 
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                            collapsed ? "justify-center" : "justify-start"
                          )}
                          title={collapsed ? item.title : undefined}
                        >
                          <span className={cn(
                            "flex items-center",
                            collapsed ? "" : "mr-3",
                            isActive ? "text-blue-600" : ""
                          )}>
                            {item.icon}
                          </span>
                          
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left text-sm">{item.title}</span>
                              {item.badge && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full min-w-[20px] text-center">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}

                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                          )}

                          {/* Tooltip for collapsed state */}
                          {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              {item.title}
                              {item.badge && (
                                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </div>
              );
            })}

            {/* Admin Section with collapsible functionality - only show if user is admin */}
            {adminMenuSection.visible && (
              <>
                {!collapsed ? (
                  <div className="mb-2">
                    <li className="pb-1">
                      <button 
                        onClick={() => toggleSection('admin')}
                        className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        {adminMenuSection.title}
                        {expandedSections.admin ? 
                          <ChevronDown className="h-3 w-3" /> : 
                          <ChevronRight className="h-3 w-3" />
                        }
                      </button>
                    </li>
                    
                    {expandedSections.admin && adminMenuSection.items
                      .filter(item => item.visible)
                      .map((item) => {
                        const isActive = isPathActive(item.path);
                        return (
                          <li key={item.path}>
                            <button
                              onClick={() => handleNavigation(item.path)}
                              className={cn(
                                "flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 group relative",
                                isActive 
                                  ? "bg-blue-50 text-blue-700 shadow-sm" 
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              )}
                            >
                              <span className={cn(
                                "flex items-center mr-3",
                                isActive ? "text-blue-600" : ""
                              )}>
                                {item.icon}
                              </span>
                              <span className="flex-1 text-left text-sm">{item.title}</span>

                              {/* Active indicator */}
                              {isActive && (
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                  </div>
                ) : (
                  // Collapsed admin section
                  <>
                    {adminMenuSection.items
                      .filter(item => item.visible)
                      .map((item) => {
                        const isActive = isPathActive(item.path);
                        return (
                          <li key={item.path} className="mb-1">
                            <button
                              onClick={() => handleNavigation(item.path)}
                              className={cn(
                                "flex items-center justify-center w-full px-3 py-2 rounded-lg transition-all duration-200 group relative",
                                isActive 
                                  ? "bg-blue-50 text-blue-700 shadow-sm" 
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              )}
                              title={item.title}
                            >
                              <span className={cn(
                                "flex items-center",
                                isActive ? "text-blue-600" : ""
                              )}>
                                {item.icon}
                              </span>

                              {/* Active indicator */}
                              {isActive && (
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                              )}

                              {/* Tooltip for collapsed state */}
                              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {item.title}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                  </>
                )}
              </>
            )}
          </ul>
        </nav>

        {/* Footer with logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
              "text-gray-700 hover:bg-red-50 hover:text-red-600",
              collapsed ? "justify-center" : "justify-start",
              isLoggingOut && "opacity-50 cursor-not-allowed"
            )}
            title={collapsed ? "ອອກຈາກລະບົບ" : undefined}
          >
            <span className={cn(
              "flex items-center",
              collapsed ? "" : "mr-3"
            )}>
              <LogOut className={cn(
                "h-5 w-5 transition-transform duration-200",
                isLoggingOut && "animate-spin"
              )} />
            </span>
            {!collapsed && (
              <span className="text-sm">
                {isLoggingOut ? 'ກຳລັງອອກ...' : 'ອອກຈາກລະບົບ'}
              </span>
            )}

            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                ອອກຈາກລະບົບ
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
