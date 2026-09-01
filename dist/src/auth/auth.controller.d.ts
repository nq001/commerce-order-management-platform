import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
    }>;
    refresh(refreshToken: string, userId: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(req: Request): Promise<{
        message: string;
    }>;
}
