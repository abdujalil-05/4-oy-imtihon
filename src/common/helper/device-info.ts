// Qurilmani user-agent orqali aniqlaydigan paket
import DeviceDetector from 'device-detector-js';
// Express so'rovining turi
import type { Request } from 'express';

// So'rovdan qurilma haqidagi ma'lumotni olamiz
export function getDeviceInfo(req: Request) {
  // Aniqlovchi obyektni yaratamiz
  const detector = new DeviceDetector();
  // So'rov sarlavhasidan user-agent qiymatini olamiz
  const userAgent = req.headers['user-agent'] ?? '';
  // User-agent ni tahlil qilib natijani qaytaramiz
  return detector.parse(userAgent);
}
