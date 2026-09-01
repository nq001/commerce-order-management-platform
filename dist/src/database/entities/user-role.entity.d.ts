import { User } from './user.entity';
import { Role } from './role.entity';
export declare class UserRole {
    user_id: string;
    role_id: string;
    user: User;
    role: Role;
}
