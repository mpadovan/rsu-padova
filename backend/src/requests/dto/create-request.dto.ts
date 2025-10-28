import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text!: string;
}
