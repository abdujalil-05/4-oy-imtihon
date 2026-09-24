import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    type: String,
    example: '204-xona',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    type: Number,
    example: 24,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  capacity!: number;
}
