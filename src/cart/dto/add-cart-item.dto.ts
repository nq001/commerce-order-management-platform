import { IsUUID, IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID('4')
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
