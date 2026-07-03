import { IsString, IsOptional, IsBoolean, IsIn, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['agent', 'customer', 'system'])
  authorType?: string;
}
