import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { Request } from 'express';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
    };
}
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    checkout(req: AuthenticatedRequest, dto: CheckoutDto): Promise<import("../database/entities/order.entity").Order>;
}
export {};
