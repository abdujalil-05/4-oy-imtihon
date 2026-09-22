import DeviceDetector from 'device-detector-js'; // User-Agent tahlil kutubxonasi
import type { Request } from 'express'; // So'rov tipi

// So'rovdan qurilma ma'lumotini olish (TZ 6.2)
export function getDeviceInfo(req: Request, deviceName?: string) {
  const userAgent = req.headers['user-agent'] ?? ''; // Xom UA
  const ip = req.ip; // Klient IP (trust proxy yoqilgan)

  // Klient o'zi nom bergan bo'lsa — o'sha (maks 50 belgi)
  if (deviceName?.trim()) {
    return { device: deviceName.trim().slice(0, 50), userAgent, ip };
  }
  if (!userAgent) return { device: "Noma'lum qurilma", userAgent, ip }; // UA yo'q

  const { client, os } = new DeviceDetector().parse(userAgent); // Tahlil
  const name = [client?.name, client?.version?.split('.')[0]]
    .filter(Boolean)
    .join(' '); // "Chrome 128"
  const osName = [os?.name, os?.version].filter(Boolean).join(' '); // "Windows 10"
  const device =
    [name, osName].filter(Boolean).join(' · ') || userAgent.slice(0, 100); // "Chrome 128 · Windows 10"

  return { device, userAgent, ip };
}
