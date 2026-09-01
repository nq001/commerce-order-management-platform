import { UserRole } from './user-role.entity';
import { RolePermission } from './role-permission.entity';
export declare class Role {
    id: string;
    name: string;
    description: string;
    userRoles: UserRole[];
    rolePermissions: RolePermission[];
}
