import { User } from './user.entity';
export declare class Address {
    id: string;
    user_id: string;
    full_name: string;
    phone: string;
    country: string;
    city: string;
    street: string;
    postal_code: string;
    is_default: boolean;
    user: User;
}
