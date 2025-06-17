'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase/context';
import { useRouter } from 'next/navigation';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  MapPin, 
  Wifi, 
  Plus,
  Trash,
  Save,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getCurrentPosition } from '@/utils/geofencing';

// ฟังก์ชันสำหรับดึงข้อมูล WiFi ปัจจุบัน
const getCurrentWiFiInfo = async () => {
  try {
    const response = await fetch('/api/network-info');
    if (!response.ok) {
      throw new Error('ບໍ່ສາມາດດຶງຂໍ້ມູນເຄືອຂ່າຍໄດ້');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting WiFi info:', error);
    return null;
  }
};

export default function LocationSettingsPage() {
  const { user, loading: authLoading, db } = useFirebase();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [locations, setLocations] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [newLocation, setNewLocation] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: 500,
    isDefault: false
  });
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    ssid: '',
    bssid: '',
    isDefault: false
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGettingNetwork, setIsGettingNetwork] = useState(false);

  // ตรวจสอบการเข้าสู่ระบบและสิทธิ์ผู้ดูแลระบบ
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        // โหลดข้อมูลตำแหน่งและเครือข่ายจากฐานข้อมูล
        loadLocationsAndNetworks();
      }
    }
  }, [user, router, authLoading, db]);

  // โหลดข้อมูลตำแหน่งและเครือข่ายจากฐานข้อมูล
  const loadLocationsAndNetworks = async () => {
    try {
      setLoading(true);
      
      if (!db) {
        console.error('Firestore instance not available');
        setError('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບຖານຂໍ້ມູນໄດ້');
        return;
      }
      
      // ดึงข้อมูลจาก collection "locations"
      const locationsRef = collection(db, "locations");
      const locationsSnapshot = await getDocs(locationsRef);
      const locationsList = locationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // แปลงค่าเป็นตัวเลขเพื่อให้แน่ใจว่าจะทำงานได้ถูกต้อง
        latitude: parseFloat(doc.data().latitude),
        longitude: parseFloat(doc.data().longitude),
        radius: parseInt(doc.data().radius)
      }));
      
      setLocations(locationsList);
      
      // ดึงข้อมูลจาก collection "networks" (ถ้ามี)
      const networksRef = collection(db, "networks");
      const networksSnapshot = await getDocs(networksRef);
      const networksList = networksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (networksList.length > 0) {
        setNetworks(networksList);
      } else {
        // ถ้ายังไม่มีข้อมูลเครือข่าย ให้ใช้ข้อมูลจำลองไปก่อน
        // สร้าง BSSID ที่แตกต่างกันสำหรับแต่ละเครือข่าย
        const timestamp = Date.now();
        
        setNetworks([
          {
            id: '1',
            name: 'ສຳນັກງານໃຫຍ່',
            ssid: 'OFFICE_WIFI',
            bssid: `00:11:22:33:44:${timestamp % 100}`,
            isDefault: true
          },
          {
            id: '2',
            name: 'ສາຂາ 1',
            ssid: 'BRANCH1_WIFI',
            bssid: `00:11:22:33:55:${(timestamp + 10) % 100}`,
            isDefault: false
          }
        ]);
      }
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  // บันทึกข้อมูลตำแหน่งและเครือข่าย
  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      if (!db) {
        console.error('Firestore instance not available');
        setError('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບຖານຂໍ້ມູນໄດ້');
        return;
      }
      
      // บันทึกข้อมูลตำแหน่งลง Firestore
      for (const location of locations) {
        if (location.id.startsWith('new-')) {
          // เป็นข้อมูลใหม่ ให้สร้าง document ใหม่
          const newLocationRef = doc(collection(db, "locations"));
          await setDoc(newLocationRef, {
            name: location.name,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            radius: location.radius.toString(),
            isDefault: location.isDefault,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          // เป็นข้อมูลเดิม ให้อัปเดต document
          const locationRef = doc(db, "locations", location.id);
          await updateDoc(locationRef, {
            name: location.name,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            radius: location.radius.toString(),
            isDefault: location.isDefault,
            updatedAt: serverTimestamp()
          });
        }
      }
      
      // บันทึกข้อมูลเครือข่ายลง Firestore (ถ้ามี)
      for (const network of networks) {
        if (network.id.startsWith('new-')) {
          // เป็นข้อมูลใหม่ ให้สร้าง document ใหม่
          const newNetworkRef = doc(collection(db, "networks"));
          await setDoc(newNetworkRef, {
            name: network.name,
            ssid: network.ssid,
            bssid: network.bssid,
            isDefault: network.isDefault,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else if (!network.id.startsWith('1')) { // ข้าม id '1' ซึ่งเป็นข้อมูลจำลอง
          // เป็นข้อมูลเดิม ให้อัปเดต document
          const networkRef = doc(db, "networks", network.id);
          await updateDoc(networkRef, {
            name: network.name,
            ssid: network.ssid,
            bssid: network.bssid,
            isDefault: network.isDefault,
            updatedAt: serverTimestamp()
          });
        }
      }
      
      setSuccess('ບັນທຶກຂໍ້ມູນຮຽບຮ້ອຍແລ້ວ');
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      // โหลดข้อมูลใหม่อีกครั้ง
      loadLocationsAndNetworks();
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  // ดึงตำแหน่ง GPS ปัจจุบัน
  const getLocation = async () => {
    try {
      setIsGettingLocation(true);
      setError(null);
      
      // ตรวจสอบว่า browser รองรับ geolocation หรือไม่
      if (!navigator.geolocation) {
        throw new Error('Browser ของคุณไม่รองรับการระบุตำแหน่ง');
      }
      
      // ตรวจสอบ permission ก่อน
      try {
        const permission = await navigator.permissions.query({name: 'geolocation'});
        console.log('Geolocation permission state:', permission.state);
        
        if (permission.state === 'denied') {
          throw new Error('การเข้าถึงตำแหน่งถูกปฏิเสธ กรุณาเปิดใช้งานในการตั้งค่า browser');
        }
      } catch (permissionError) {
        console.log('Permission API not supported, trying direct geolocation');
      }
      
      // ใช้ Promise wrapper ที่ปรับปรุงแล้ว
      const position = await new Promise((resolve, reject) => {
        const options = {
          enableHighAccuracy: true,
          timeout: 30000, // เพิ่ม timeout เป็น 30 วินาที
          maximumAge: 60000 // อนุญาตให้ใช้ข้อมูลเก่าที่มีอายุไม่เกิน 1 นาที
        };
        
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('Location obtained:', pos.coords.latitude, pos.coords.longitude);
            resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy
              },
              timestamp: pos.timestamp,
              source: 'gps'
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          options
        );
      });
      
      setNewLocation({
        ...newLocation,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      
      // แสดงข้อความสำเร็จ
      setSuccess(`ດຶງຕຳແໜ່ງສຳເລັດ: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)} (ຄວາມແມ່ນຍຳ: ${Math.round(position.coords.accuracy)}ມ)`);
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err) {
      console.error('Error getting location:', err);
      
      // จัดการข้อผิดพลาดแต่ละประเภท
      if (err.code === 1 || err.message.includes('denied') || err.message.includes('permission') || err.message.includes('secure origins')) {
        // PERMISSION_DENIED or SECURE ORIGIN REQUIRED
        if (err.message.includes('secure origins')) {
          setError('⚠️ ຕ້ອງໃຊ້ HTTPS ເພື່ອເຂົ້າເຖິງຕຳແໜ່ງ\n\nວິທີແກ້ໄຂ:\n• ໃຊ້ http://localhost:3001 ແທນ IP address\n• ຫຼືໃສ່ຕຳແໜ່ງດ້ວຍມື:\n  - ໄປ Google Maps\n  - ຄຳ້ຫາສະຖານທີ່\n  - ຄລິກຂວາ → Copy coordinates\n  - ນຳມາໃສ່ໃນຟອມ');
        } else {
          setError('ບໍ່ໄດ້ຮັບອະນຸຍາດໃຫ້ເຂົ້າເຖິງຕຳແໜ່ງ. ວິທີແກ້ໄຂ:\n\n1. ກົດໄອຄອນ 🔒 ຫຼື ℹ️ ຂ້າງ URL\n2. ເລືອກ "Allow" ສຳລັບ Location\n3. Refresh ຫນ້າເວັບ\n4. ລອງກົດປຸ່ມອີກຄັ້ງ');
        }
      } else if (err.code === 2) {
        // POSITION_UNAVAILABLE
        setError('ບໍ່ສາມາດລະບຸຕຳແໜ່ງໄດ້. ກະລຸນາກວດສອບ:\n• GPS ເປີດຢູ່ຫຼືບໍ່\n• ເຊື່ອມຕໍ່ອິນເຕີເນັດ\n• ຢູ່ໃນຕຶກຫຼືບໍ່ (GPS ອາດບໍ່ທຳງານ)');
      } else if (err.code === 3) {
        // TIMEOUT
        setError('ໝົດເວລາລະບຸຕຳແໜ່ງ (30 ວິນາທີ):\n• ກວດສອບ GPS\n• ຢູ່ໃນບ່ອນເປີດໂລ່ງ\n• ລອງໃໝ່ອີກຄັ້ງ');
      } else {
        // ข้อผิดพลาดอื่นๆ
        setError(`ບໍ່ສາມາດດຶງຕຳແໜ່ງໄດ້: ${err.message || 'ເກີດຂໍ້ຜິດພາດ'}\n\nແນະນຳ:\n• Refresh ຫນ້າເວັບ\n• ກວດສອບການຕັ້ງຄ່າ Browser\n• ໃຊ້ HTTPS ແທນ HTTP`);
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  // ดึงข้อมูล WiFi ปัจจุบัน
  const getWiFiInfo = async () => {
    try {
      setIsGettingNetwork(true);
      setError(null);
      
      const networkInfo = await getCurrentWiFiInfo();
      
      if (networkInfo) {
        setNewNetwork({
          ...newNetwork,
          ssid: networkInfo.ssid || '',
          bssid: networkInfo.bssid || ''
        });
      } else {
        setError('ไม่สามารถดึงข้อมูล WiFi ได้');
      }
    } catch (err) {
      console.error('Error getting WiFi info:', err);
      setError('ไม่สามารถดึงข้อมูล WiFi ได้');
    } finally {
      setIsGettingNetwork(false);
    }
  };

  // เพิ่มตำแหน่งใหม่
  const addLocation = () => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
      setError('ກະລຸນາກຳນົດຂໍ້ມູນໃຫ້ຄົບຖ້ວນ');
      return;
    }
    
    const id = `new-${Date.now()}`; // ใช้ prefix "new-" เพื่อระบุว่าเป็นข้อมูลใหม่ที่ยังไม่ได้บันทึกลง Firestore
    
    setLocations([
      ...locations,
      {
        id,
        name: newLocation.name,
        latitude: parseFloat(newLocation.latitude),
        longitude: parseFloat(newLocation.longitude),
        radius: parseInt(newLocation.radius) || 500,
        isDefault: newLocation.isDefault
      }
    ]);
    
    setNewLocation({
      name: '',
      latitude: '',
      longitude: '',
      radius: 500,
      isDefault: false
    });
    
    setSuccess('ເພີ່ມຕຳແໜ່ງຮຽບຮ້ອຍແລ້ວ');
    setTimeout(() => setSuccess(null), 3000);
  };

  // เพิ่มเครือข่ายใหม่
  const addNetwork = () => {
    if (!newNetwork.name || !newNetwork.ssid) {
      setError('ກະລຸນາກຳນົດຂໍ້ມູນໃຫ້ຄົບຖ້ວນ');
      return;
    }
    
    const id = `new-${Date.now()}`; // ใช้ prefix "new-" เพื่อระบุว่าเป็นข้อมูลใหม่ที่ยังไม่ได้บันทึกลง Firestore
    
    setNetworks([
      ...networks,
      {
        id,
        name: newNetwork.name,
        ssid: newNetwork.ssid,
        bssid: newNetwork.bssid,
        isDefault: newNetwork.isDefault
      }
    ]);
    
    setNewNetwork({
      name: '',
      ssid: '',
      bssid: '',
      isDefault: false
    });
    
    setSuccess('ເພີ່ມເຄືອຂ່າຍຮຽບຮ້ອຍແລ້ວ');
    setTimeout(() => setSuccess(null), 3000);
  };

  // ลบตำแหน่ง
  const deleteLocation = async (id) => {
    try {
      if (!id.startsWith('new-')) {
        // ถ้าเป็นข้อมูลที่บันทึกลง Firestore แล้ว ให้ลบจาก Firestore ด้วย
        await deleteDoc(doc(db, "locations", id));
      }
      
      setLocations(locations.filter(location => location.id !== id));
      setSuccess('ລົບຕຳແໜ່ງຮຽບຮ້ອຍແລ້ວ');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting location:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການລົບຕຳແໜ່ງ');
    }
  };

  // ลบเครือข่าย
  const deleteNetwork = async (id) => {
    try {
      if (!id.startsWith('new-') && id !== '1') { // ข้าม id '1' ซึ่งเป็นข้อมูลจำลอง
        // ถ้าเป็นข้อมูลที่บันทึกลง Firestore แล้ว ให้ลบจาก Firestore ด้วย
        await deleteDoc(doc(db, "networks", id));
      }
      
      setNetworks(networks.filter(network => network.id !== id));
      setSuccess('ລົບເຄືອຂ່າຍຮຽບຮ້ອຍແລ້ວ');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting network:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການລົບເຄືອຂ່າຍ');
    }
  };

  // แสดงหน้าโหลดขณะกำลังดึงข้อมูลหรือตรวจสอบ auth
  if (authLoading || (loading && !locations)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ຕັ້ງຄ່າຕຳແໜ່ງແລະເຄືອຂ່າຍ</h1>
        <Button onClick={() => router.push('/admin/settings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          ກັບຄືນ
        </Button>
      </div>
      
      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>ຜິດພລາດ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800 mb-6">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">ສຳເລັດ</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}
      
      {/* ตำแหน่งที่อนุญาต */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            ຕຳແໜ່ງທີ່ອະນຸຍາດ
          </CardTitle>
          <CardDescription>
            ກຳໜົດຕຳແໜ່ງ GPS ທີ່ອະນຸຍາດໃຫ້ລົງເວລາໄດ້
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">ຊື່ສະຖານທີ່</TableHead>
                  <TableHead className="whitespace-nowrap">latitude</TableHead>
                  <TableHead className="whitespace-nowrap">longtitude</TableHead>
                  <TableHead className="whitespace-nowrap">ລັດສະໝີ (ແມັດ)</TableHead>
                  <TableHead className="whitespace-nowrap">ຄ່າເລີ່ມຕົ້ນ</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{location.latitude}</TableCell>
                    <TableCell className="whitespace-nowrap">{location.longitude}</TableCell>
                    <TableCell className="whitespace-nowrap">{location.radius}</TableCell>
                    <TableCell>
                      {location.isDefault ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          ຄ່າເລີ່ມຕົ້ນ
                        </Badge>
                      ) : (
                        <Badge variant="outline">ບໍ່ແມ່ນ</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteLocation(location.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-medium mb-3">ເພີ່ມຕຳແໜ່ງໃຫມ່</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="location-name">ຊື່ສະຖານທີ່</Label>
                <Input 
                  id="location-name" 
                  placeholder="ເຊັ່ນ ສຳນັກງານໃຫຍ່"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location-radius">ລັດສະໝີ (ແມັດ)</Label>
                <Input 
                  id="location-radius" 
                  type="number"
                  placeholder="500"
                  value={newLocation.radius}
                  onChange={(e) => setNewLocation({...newLocation, radius: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location-lat">latitude</Label>
                <Input 
                  id="location-lat" 
                  placeholder="ເຊັ່ນ 17.966667"
                  value={newLocation.latitude}
                  onChange={(e) => setNewLocation({...newLocation, latitude: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location-lng">longitude</Label>
                <Input 
                  id="location-lng" 
                  placeholder="ເຊັ່ນ 102.6"
                  value={newLocation.longitude}
                  onChange={(e) => setNewLocation({...newLocation, longitude: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2 col-span-1 sm:col-span-2">
                <input 
                  type="checkbox" 
                  id="location-default"
                  checked={newLocation.isDefault}
                  onChange={(e) => setNewLocation({...newLocation, isDefault: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="location-default">ຕັ້ງເປັນຄ່າເລີ່ມຕົ້ນ</Label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={getLocation}
                disabled={isGettingLocation}
                className="flex-grow sm:flex-grow-0"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                ໃຊ້ຕຳແໜ່ງປັດຈຸບັນ
              </Button>
              <Button 
                onClick={addLocation}
                className="flex-grow sm:flex-grow-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                ເພີ່ມຕຳແໜ່ງ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* เครือข่ายที่อนุญาต */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wifi className="h-5 w-5 mr-2" />
            ເຄືອຂ່າຍທີ່ອະນຸຍາດ
          </CardTitle>
          <CardDescription>
            ກຳໜົດເຄືອຂ່າຍ WiFi ທີ່ອະນຸຍາດໃຫ້ລົງເວລາໄດ້
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">ຊື່ເຄືອຂ່າຍ</TableHead>
                  <TableHead className="whitespace-nowrap">SSID</TableHead>
                  <TableHead className="whitespace-nowrap">BSSID (MAC Address)</TableHead>
                  <TableHead className="whitespace-nowrap">ຄ່າເລີ່ມຕົ້ນ</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networks.map((network) => (
                  <TableRow key={network.id}>
                    <TableCell className="font-medium">{network.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{network.ssid}</TableCell>
                    <TableCell className="whitespace-nowrap">{network.bssid}</TableCell>
                    <TableCell>
                      {network.isDefault ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          ຄ່າເລີ່ມຕົ້ນ
                        </Badge>
                      ) : (
                        <Badge variant="outline">ບໍ່ແມ່ນ</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteNetwork(network.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-medium mb-3">ເພີ່ມເຄືອຂ່າຍໃຫມ່</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="network-name">ຊື່ເຄືອຂ່າຍ</Label>
                <Input 
                  id="network-name" 
                  placeholder="ເຊັ່ນ ສຳນັກງານໃຫຍ່"
                  value={newNetwork.name}
                  onChange={(e) => setNewNetwork({...newNetwork, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="network-ssid">SSID</Label>
                <Input 
                  id="network-ssid" 
                  placeholder="ເຊັ່ນ OFFICE_WIFI"
                  value={newNetwork.ssid}
                  onChange={(e) => setNewNetwork({...newNetwork, ssid: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="network-bssid">BSSID (MAC Address)</Label>
                <Input 
                  id="network-bssid" 
                  placeholder="ເຊັ່ນ 00:11:22:33:44:55"
                  value={newNetwork.bssid}
                  onChange={(e) => setNewNetwork({...newNetwork, bssid: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="network-default"
                  checked={newNetwork.isDefault}
                  onChange={(e) => setNewNetwork({...newNetwork, isDefault: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="network-default">ຕັ້ງເປັນຄ່າເລີ່ມຕົ້ນ</Label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={getWiFiInfo}
                disabled={isGettingNetwork}
                className="flex-grow sm:flex-grow-0"
              >
                {isGettingNetwork ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wifi className="h-4 w-4 mr-2" />
                )}
                ໃຊ້ເຄືອຂ່າຍປັດຈຸບັນ
              </Button>
              <Button 
                onClick={addNetwork}
                className="flex-grow sm:flex-grow-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                ເພີ່ມເຄືອຂ່າຍ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* ปุ่มบันทึก */}
      <div className="flex justify-center sm:justify-end">
        <Button 
          size="lg" 
          onClick={saveSettings}
          disabled={loading}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          ບັນທຶກການຕັ້ງຄ່າ
        </Button>
      </div>
    </div>
  );
} 