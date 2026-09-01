import { RolePermission } from './role-permission.entity';
export declare class Permission {
    id: string;
    action: string;
    rolePermissions: RolePermission[];
}
