export declare class CreateCouponDto {
    code: string;
    discount_amount: number;
    discount_type: 'PERCENTAGE' | 'FIXED';
    usage_limit?: number;
    expires_at?: string;
}
