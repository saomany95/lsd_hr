'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import { getAllUsers } from '@/firebase/users';

export default function UserSelector({ onSelectUser, preselectedUserId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);

  // โหลดข้อมูลผู้ใช้ทั้งหมด
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await getAllUsers(false); // รวมผู้ใช้ที่ไม่ active ด้วย
        setUsers(allUsers);
        
        // ถ้ามี preselectedUserId ให้ค้นหาและเลือกผู้ใช้นั้น
        if (preselectedUserId) {
          const preselected = allUsers.find(user => user.id === preselectedUserId);
          if (preselected) {
            setSelectedUser(preselected);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [preselectedUserId]);

  // กรองผู้ใช้ตามคำค้นหา
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers([]);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const fullNameLo = `${user.firstName_lo || ''} ${user.lastName_lo || ''}`.toLowerCase();
      const phone = (user.phoneNumber || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      
      return fullName.includes(lowercasedSearch) || 
             fullNameLo.includes(lowercasedSearch) || 
             phone.includes(lowercasedSearch) || 
             email.includes(lowercasedSearch);
    });
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // จัดการการคลิกนอก dropdown เพื่อปิด
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // เลือกผู้ใช้
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchTerm('');
    setIsOpen(false);
    if (onSelectUser) {
      onSelectUser(user);
    }
  };

  // ยกเลิกการเลือกผู้ใช้
  const handleClearSelection = () => {
    setSelectedUser(null);
    if (onSelectUser) {
      onSelectUser(null);
    }
  };

  // แสดงชื่อผู้ใช้
  const getUserDisplayName = (user) => {
    if (!user) return '';
    
    const nameLo = `${user.firstName_lo || ''} ${user.lastName_lo || ''}`.trim();
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    
    if (nameLo) {
      return name ? `${nameLo} (${name})` : nameLo;
    }
    
    return name;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {selectedUser ? (
        <div className="flex items-center p-2 border rounded-md bg-blue-50">
          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            {selectedUser.avatar ? (
              <img 
                src={selectedUser.avatar} 
                alt={getUserDisplayName(selectedUser)}
                className="h-8 w-8 rounded-full object-cover" 
              />
            ) : (
              <User className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="ml-3 flex-grow">
            <div className="text-sm font-medium">{getUserDisplayName(selectedUser)}</div>
            <div className="text-xs text-gray-500">
              {selectedUser.phoneNumber || selectedUser.email || ''}
            </div>
          </div>
          <button 
            className="text-gray-400 hover:text-red-500 p-1"
            onClick={handleClearSelection}
            title="ລຶບການເລືອກ"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ຄົ້ນຫາຜູ້ໃຊ້..."
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="inline-block animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                  ກຳລັງໂຫຼດຂໍ້ມູນ...
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={getUserDisplayName(user)}
                          className="h-8 w-8 rounded-full object-cover" 
                        />
                      ) : (
                        <User className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">{getUserDisplayName(user)}</div>
                      <div className="text-xs text-gray-500">
                        {user.phoneNumber || user.email || ''}
                      </div>
                    </div>
                  </div>
                ))
              ) : searchTerm ? (
                <div className="p-4 text-center text-gray-500">
                  ບໍ່ພົບຜູ້ໃຊ້ທີ່ກົງກັບການຄົ້ນຫາ
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  ພິມເພື່ອຄົ້ນຫາຜູ້ໃຊ້
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 