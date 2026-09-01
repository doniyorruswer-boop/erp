import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCrmNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;
}

export class UpdateCrmNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
