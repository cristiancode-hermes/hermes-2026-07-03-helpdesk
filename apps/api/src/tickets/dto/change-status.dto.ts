import { IsString, IsIn } from 'class-validator';

export class ChangeStatusDto {
  @IsString()
  @IsIn(['new', 'open', 'in_progress', 'resolved', 'closed'])
  status: string;
}
