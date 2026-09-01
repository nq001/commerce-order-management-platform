import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    create(createCouponDto: CreateCouponDto): Promise<import("../database/entities/coupon.entity").Coupon>;
    findAll(): Promise<import("../database/entities/coupon.entity").Coupon[]>;
    findOne(id: string): Promise<import("../database/entities/coupon.entity").Coupon>;
    update(id: string, updateCouponDto: UpdateCouponDto): Promise<import("../database/entities/coupon.entity").Coupon>;
    remove(id: string): Promise<void>;
}
