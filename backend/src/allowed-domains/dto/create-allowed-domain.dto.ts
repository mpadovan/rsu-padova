import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAllowedDomainDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;
}
