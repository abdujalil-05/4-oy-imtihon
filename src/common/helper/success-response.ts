// Javob ko'rinishini tavsiflovchi interfeys
import { ISuccess } from '../interface/ISuccess.interface';

// Barcha muvaffaqiyatli javoblarni bir xil ko'rinishga keltiruvchi funksiya
export async function successRes(
  data: object,
  statusCode: number = 200,
): Promise<ISuccess> {
  // Status va ma'lumotni birga qaytaramiz
  return {
    statusCode,
    data,
  };
}
