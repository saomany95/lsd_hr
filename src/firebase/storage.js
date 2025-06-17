import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * อัพโหลดไฟล์ไปยัง Firebase Storage
 * @param {File} file - ไฟล์ที่ต้องการอัพโหลด
 * @param {string} path - พาธที่ต้องการเก็บไฟล์ใน Storage (เช่น 'users/123/profile.jpg')
 * @returns {Promise<string>} - URL ของไฟล์ที่อัพโหลด
 */
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * อัพโหลดรูปโปรไฟล์ของผู้ใช้
 * @param {File} file - ไฟล์รูปภาพ
 * @param {string} userId - ID ของผู้ใช้
 * @returns {Promise<string>} - URL ของรูปโปรไฟล์
 */
export const uploadProfileImage = async (file, userId) => {
  // สร้างชื่อไฟล์ที่ไม่ซ้ำกันโดยใช้ timestamp
  const timestamp = new Date().getTime();
  const fileExtension = file.name.split('.').pop();
  const path = `users/${userId}/profile_${timestamp}.${fileExtension}`;
  
  return await uploadFile(file, path);
};

/**
 * ลบไฟล์จาก Firebase Storage
 * @param {string} fileUrl - URL ของไฟล์ที่ต้องการลบ
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileUrl) => {
  try {
    // แปลง URL เป็น storage reference
    // fileUrl มีรูปแบบเช่น: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/users%2F123%2Fprofile.jpg?alt=media&token=...
    const fileRef = ref(storage, decodeURIComponent(fileUrl.split('/o/')[1].split('?')[0]));
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}; 