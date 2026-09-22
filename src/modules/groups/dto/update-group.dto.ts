import { IsInt, IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpdateGroupDto {
    @MinLength(2)
    @IsString()
    @IsNotEmpty()
    name?: string

    @IsInt()
    @IsNotEmpty()
    teacherId?: number
}