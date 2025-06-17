import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * ฟังก์ชันรวม className ด้วย clsx และ tailwind-merge
 * ช่วยให้การรวม className จาก props และ default values ทำงานได้อย่างถูกต้อง
 * 
 * @param  {...any} inputs - รายการ className ที่ต้องการรวม
 * @returns {string} - className ที่รวมแล้ว
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
