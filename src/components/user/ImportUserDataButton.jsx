'use client';

import { useState } from 'react';
import { Download, Check } from 'lucide-react';

export default function ImportUserDataButton({ user, onImport, disabled = false }) {
  const [isImporting, setIsImporting] = useState(false);
  const [imported, setImported] = useState(false);
  
  // ตรวจสอบว่ามี user หรือไม่
  const hasUser = !!user && user.id;
  
  // ฟังก์ชันนำเข้าข้อมูล
  const handleImport = () => {
    if (!hasUser || disabled) return;
    
    setIsImporting(true);
    
    // เตรียมข้อมูลที่จะนำเข้า
    const userData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      firstName_lo: user.firstName_lo || '',
      lastName_lo: user.lastName_lo || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      avatar: user.avatar || '',
      userId: user.id
    };
    
    // จำลองการโหลดสักครู่
    setTimeout(() => {
      setIsImporting(false);
      setImported(true);
      
      // รีเซ็ตสถานะ imported หลังจาก 2 วินาที
      setTimeout(() => {
        setImported(false);
      }, 2000);
      
      // ส่งข้อมูลกลับไป
      if (onImport) {
        onImport(userData);
      }
    }, 500);
  };
  
  // กำหนดสถานะของปุ่ม
  let buttonClass = "flex items-center px-3 py-2 rounded text-sm font-medium ";
  let buttonText = "ນຳເຂົ້າຂໍ້ມູນຜູ້ໃຊ້";
  
  if (!hasUser || disabled) {
    buttonClass += "bg-gray-100 text-gray-400 cursor-not-allowed";
  } else if (imported) {
    buttonClass += "bg-green-100 text-green-600";
    buttonText = "ນຳເຂົ້າຂໍ້ມູນແລ້ວ";
  } else {
    buttonClass += "bg-blue-50 text-blue-600 hover:bg-blue-100";
  }
  
  return (
    <button
      className={buttonClass}
      onClick={handleImport}
      disabled={!hasUser || disabled || isImporting}
      title={!hasUser ? "ກະລຸນາເລືອກຜູ້ໃຊ້ກ່ອນ" : "ນຳເຂົ້າຂໍ້ມູນຈາກຜູ້ໃຊ້"}
    >
      {isImporting ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
          ກຳລັງນຳເຂົ້າຂໍ້ມູນ...
        </>
      ) : imported ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          {buttonText}
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          {buttonText}
        </>
      )}
    </button>
  );
} 