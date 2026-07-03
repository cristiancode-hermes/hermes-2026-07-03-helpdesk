import { IsNumber } from 'class-validator';

export class AssignDto {
  @IsNumber()
  assignedToId: number;
}
