import { UserRole } from './user-role.entity';
import { Address } from './address.entity';
import { Cart } from './cart.entity';
import { Order } from './order.entity';
import { IdempotencyKey } from './idempotency-key.entity';
export declare class User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    userRoles: UserRole[];
    addresses: Address[];
    cart: Cart;
    orders: Order[];
    idempotencyKeys: IdempotencyKey[];
}
