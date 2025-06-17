'use client';

/**
 * Utility functions for geofencing and location verification
 */

/**
 * คำนวณระยะทางระหว่างสองจุดบนพื้นโลก (หน่วยเป็นเมตร)
 * @param {number} lat1 - ละติจูดของจุดที่ 1
 * @param {number} lon1 - ลองจิจูดของจุดที่ 1
 * @param {number} lat2 - ละติจูดของจุดที่ 2
 * @param {number} lon2 - ลองจิจูดของจุดที่ 2
 * @returns {number} ระยะทางในหน่วยเมตร
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // รัศมีของโลกในหน่วยเมตร
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // ระยะทางในหน่วยเมตร
};

/**
 * ตรวจสอบว่าตำแหน่งอยู่ในรัศมีที่กำหนดหรือไม่
 * @param {number} lat - ละติจูดของตำแหน่งที่ต้องการตรวจสอบ
 * @param {number} lon - ลองจิจูดของตำแหน่งที่ต้องการตรวจสอบ
 * @param {number} centerLat - ละติจูดของจุดศูนย์กลาง
 * @param {number} centerLon - ลองจิจูดของจุดศูนย์กลาง
 * @param {number} radiusInMeters - รัศมีในหน่วยเมตร
 * @returns {boolean} true ถ้าอยู่ในรัศมี, false ถ้าไม่อยู่ในรัศมี
 */
export const isWithinGeofence = (lat, lon, centerLat, centerLon, radiusInMeters) => {
  const distance = calculateDistance(lat, lon, centerLat, centerLon);
  return distance <= radiusInMeters;
};

/**
 * ดึงตำแหน่งปัจจุบันจาก Geolocation API
 * @returns {Promise<{coords: {latitude: number, longitude: number, accuracy: number}, timestamp: number, source: string}>} ข้อมูลตำแหน่ง
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          timestamp: position.timestamp,
          source: 'gps'
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

/**
 * ดึงที่อยู่จากตำแหน่ง (Reverse Geocoding)
 * @param {number} latitude - ละติจูด
 * @param {number} longitude - ลองจิจูด
 * @returns {Promise<string>} ที่อยู่
 */
export const getAddressFromPosition = async (latitude, longitude) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return 'ไม่สามารถระบุที่อยู่ได้';
  } catch (error) {
    console.error('Error getting address:', error);
    return 'ไม่สามารถระบุที่อยู่ได้';
  }
};

/**
 * จำลองการดึงข้อมูลเครือข่าย WiFi
 * @returns {Promise<{ssid: string, bssid: string}>} ข้อมูลเครือข่าย WiFi
 */
export const getWiFiInfo = async () => {
  try {
    // เรียกใช้ API ที่เราสร้างขึ้นเพื่อดึงข้อมูล WiFi
    const response = await fetch('/api/network-info');
    
    if (!response.ok) {
      throw new Error('ไม่สามารถดึงข้อมูลเครือข่ายได้');
    }
    
    const data = await response.json();
    
    return {
      ssid: data.ssid,
      bssid: data.bssid
    };
  } catch (error) {
    console.error('Error fetching WiFi info:', error);
    // กรณีมีข้อผิดพลาด ให้ส่งค่าเริ่มต้น
    return {
      ssid: 'UNKNOWN_NETWORK',
      bssid: '00:00:00:00:00:00'
    };
  }
};

/**
 * ตรวจสอบว่าตำแหน่งปัจจุบันอยู่ในพื้นที่ที่อนุญาตหรือไม่
 * @param {Array<{latitude: number, longitude: number, radius: number}>} allowedLocations - รายการตำแหน่งที่อนุญาต
 * @param {Object} options - ตัวเลือกในการตรวจสอบ
 * @returns {Promise<{isCompliant: boolean, currentPosition: Object, address: string, error: string}>} ผลการตรวจสอบ
 */
export const checkLocationCompliance = async (allowedLocations, options = {}) => {
  try {
    // ตรวจสอบว่ามีการกำหนดตำแหน่งที่อนุญาตหรือไม่
    if (!allowedLocations || allowedLocations.length === 0) {
      return {
        isCompliant: false,
        error: 'ไม่มีการกำหนดพื้นที่ที่อนุญาต',
        currentPosition: null,
        address: null
      };
    }
    
    // ตัวเลือกเริ่มต้น
    const defaultOptions = {
      useIP: false,
      useWiFi: false,
      allowedNetworks: []
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // ลองใช้ GPS ก่อน
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // ตรวจสอบว่าอยู่ในพื้นที่ที่อนุญาตหรือไม่
      for (const location of allowedLocations) {
        if (isWithinGeofence(latitude, longitude, location.latitude, location.longitude, location.radius)) {
          // ดึงที่อยู่
          const address = await getAddressFromPosition(latitude, longitude);
          
          return {
            isCompliant: true,
            currentPosition: position,
            address,
            locationName: location.name
          };
        }
      }
      
      // ถ้าไม่อยู่ในพื้นที่ที่อนุญาต
      const address = await getAddressFromPosition(latitude, longitude);
      
      return {
        isCompliant: false,
        error: 'คุณไม่ได้อยู่ในพื้นที่ที่อนุญาต',
        currentPosition: position,
        address
      };
    } catch (error) {
      console.error('GPS error:', error);
      
      // ถ้าใช้ GPS ไม่ได้ และมีตัวเลือกให้ใช้ WiFi
      if (mergedOptions.useWiFi) {
        try {
          const networkInfo = await getWiFiInfo();
          
          // ตรวจสอบว่าเครือข่าย WiFi อยู่ในรายการที่อนุญาตหรือไม่
          const isNetworkAllowed = mergedOptions.allowedNetworks.some(
            network => {
              // ถ้าระบุทั้ง SSID และ BSSID ให้ตรวจสอบทั้งคู่
              if (network.ssid && network.bssid) {
                return network.ssid === networkInfo.ssid && network.bssid === networkInfo.bssid;
              }
              // ถ้าระบุเฉพาะ SSID ให้ตรวจสอบเฉพาะ SSID
              else if (network.ssid && !network.bssid) {
                return network.ssid === networkInfo.ssid;
              }
              // ถ้าระบุเฉพาะ BSSID ให้ตรวจสอบเฉพาะ BSSID
              else if (!network.ssid && network.bssid) {
                return network.bssid === networkInfo.bssid;
              }
              return false;
            }
          );
          
          if (isNetworkAllowed) {
            return {
              isCompliant: true,
              isCompliantByNetwork: true,
              networkInfo,
              currentPosition: null,
              address: 'ยืนยันตำแหน่งด้วยเครือข่าย WiFi'
            };
          }
        } catch (wifiError) {
          console.error('WiFi error:', wifiError);
        }
      }
      
      // ถ้าใช้ GPS และ WiFi ไม่ได้ และมีตัวเลือกให้ใช้ IP
      if (mergedOptions.useIP) {
        try {
          // ในสภาพแวดล้อมจริง ควรใช้บริการ IP Geolocation
          // สำหรับตัวอย่างนี้ จำลองว่าไม่อยู่ในพื้นที่ที่อนุญาต
          return {
            isCompliant: false,
            error: 'ไม่สามารถยืนยันตำแหน่งด้วย GPS ได้',
            currentPosition: {
              coords: { latitude: 0, longitude: 0 },
              source: 'ip'
            },
            address: 'ไม่สามารถระบุที่อยู่ได้'
          };
        } catch (ipError) {
          console.error('IP geolocation error:', ipError);
        }
      }
      
      // ถ้าไม่สามารถตรวจสอบตำแหน่งได้ด้วยวิธีใดๆ
      return {
        isCompliant: false,
        error: 'ไม่สามารถตรวจสอบตำแหน่งได้',
        currentPosition: null,
        address: null
      };
    }
  } catch (error) {
    console.error('Location compliance check error:', error);
    
    return {
      isCompliant: false,
      error: 'เกิดข้อผิดพลาดในการตรวจสอบตำแหน่ง',
      currentPosition: null,
      address: null
    };
  }
};