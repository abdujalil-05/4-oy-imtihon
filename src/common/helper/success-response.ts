import { ISuccess } from '../interface/ISuccess.interface'; // Format

// Barcha muvaffaqiyatli javoblar shu orqali qaytadi
export async function successRes(
  data: object,
  statusCode: number = 200,
): Promise<ISuccess> {
  return {
    statusCode, // Kod
    data, // Ma'lumot
  };
}
