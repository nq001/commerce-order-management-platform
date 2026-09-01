"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const redis_service_1 = require("../redis/redis.service");
const user_role_entity_1 = require("../database/entities/user-role.entity");
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    redisService;
    userRoleRepository;
    constructor(usersService, jwtService, configService, redisService, userRoleRepository) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.redisService = redisService;
        this.userRoleRepository = userRoleRepository;
    }
    async register(registerDto) {
        const { email, password, first_name, last_name } = registerDto;
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        const user = await this.usersService.create({
            email,
            password_hash,
            first_name,
            last_name,
            is_active: true,
        });
        const defaultRole = await this.usersService.getDefaultRole();
        await this.userRoleRepository.save(this.userRoleRepository.create({
            user: user,
            role: defaultRole,
        }));
        return {
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
            },
        };
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.is_active) {
            throw new common_1.UnauthorizedException('Account is disabled');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user);
        return {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
            },
            ...tokens,
        };
    }
    async refreshTokens(userId, refreshToken) {
        const storedToken = await this.redisService.get(`refresh_token:${userId}`);
        if (!storedToken || storedToken !== refreshToken) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = await this.usersService.findById(userId);
        if (!user || !user.is_active) {
            throw new common_1.UnauthorizedException('User no longer valid');
        }
        const tokens = await this.generateTokens(user);
        return tokens;
    }
    async logout(userId) {
        await this.redisService.del(`refresh_token:${userId}`);
    }
    async generateTokens(user) {
        const roles = [];
        const permissions = [];
        if (user.userRoles) {
            for (const ur of user.userRoles) {
                if (ur.role) {
                    roles.push(ur.role.name);
                    if (ur.role.rolePermissions) {
                        for (const rp of ur.role.rolePermissions) {
                            if (rp.permission) {
                                permissions.push(rp.permission.action);
                            }
                        }
                    }
                }
            }
        }
        const payload = {
            sub: user.id,
            email: user.email,
            roles: Array.from(new Set(roles)),
            permissions: Array.from(new Set(permissions)),
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign({ sub: user.id }, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
        });
        const refreshExpStr = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');
        let refreshExpSeconds = 7 * 24 * 60 * 60;
        if (refreshExpStr.endsWith('d')) {
            refreshExpSeconds = parseInt(refreshExpStr) * 24 * 60 * 60;
        }
        else if (refreshExpStr.endsWith('h')) {
            refreshExpSeconds = parseInt(refreshExpStr) * 60 * 60;
        }
        await this.redisService.set(`refresh_token:${user.id}`, refreshToken, refreshExpSeconds);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map