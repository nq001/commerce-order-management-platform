import { User } from './user.entity';
export declare class IdempotencyKey {
    user_id: string;
    key: string;
    request_path: string;
    response_body: Record<string, unknown>;
    created_at: Date;
    user: User;
}
