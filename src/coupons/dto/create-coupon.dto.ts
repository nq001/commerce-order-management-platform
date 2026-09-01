import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsIn,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(1)
  discount_amount: number;

  @IsString()
  @IsIn(['PERCENTAGE', 'FIXED'])
  discount_type: 'PERCENTAGE' | 'FIXED';

  @IsOptional()
  @IsInt()
  @Min(1)
  usage_limit?: number;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
