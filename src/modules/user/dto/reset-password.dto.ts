import { IsPassword } from '../../../common/decorator/is-password.decorator'; // Parol qoidasi

// PATCH /users/:id/password tanasi
export class ResetPasswordDto {
  @IsPassword('yangi1234')
  newPassword!: string; // Yangi parol
}
