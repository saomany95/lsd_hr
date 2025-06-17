import { NextResponse } from 'next/server';

/**
 * API endpoint สำหรับดึงข้อมูลเครือข่าย
 * หมายเหตุ: ในสภาพแวดล้อมจริง ควรใช้ middleware หรือ library ที่เหมาะสม
 * เพื่อดึงข้อมูลเครือข่ายที่ถูกต้องและปลอดภัย
 */
export async function GET(request) {
  try {
    // ดึง IP Address จาก request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // สร้าง BSSID จาก IP address หรือ timestamp เพื่อให้มีความแตกต่างกัน
    // ในสภาพแวดล้อมจริง ควรใช้ library หรือ service ที่เหมาะสม
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // สร้าง BSSID ที่แตกต่างกันตาม timestamp และค่าสุ่ม
    // รูปแบบ MAC address: XX:XX:XX:XX:XX:XX
    const bssid = `00:${timestamp.toString().slice(-2)}:${timestamp.toString().slice(-4, -2)}:${randomPart.slice(0, 2)}:${randomPart.slice(-1)}${timestamp.toString().slice(-1)}:55`;
    
    // สร้าง SSID ที่อาจแตกต่างกันตาม timestamp
    const networks = ['OFFICE_WIFI', 'GUEST_WIFI', 'STAFF_WIFI'];
    const ssid = networks[timestamp % networks.length];
    
    return NextResponse.json({
      ipAddress,
      ssid,
      bssid,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting network info:', error);
    return NextResponse.json(
      { error: 'Failed to get network information' },
      { status: 500 }
    );
  }
} 