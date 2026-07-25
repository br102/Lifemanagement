"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.singleUserEmail = process.env.SINGLE_USER_EMAIL ?? 'borja@lifemanagement.local';
        this.singleUserPassword = process.env.SINGLE_USER_PASSWORD ?? '22Comida79';
    }
    async register(dto) {
        if (dto.email !== this.singleUserEmail) {
            throw new common_1.UnauthorizedException('Only the configured app user can register');
        }
        if (dto.password !== this.singleUserPassword) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            return this.issueTokens(existing.id, existing.email);
        }
        const passwordHash = await bcrypt.hash(this.singleUserPassword, 10);
        const user = await this.prisma.user.create({ data: { email: dto.email, passwordHash } });
        return this.issueTokens(user.id, user.email);
    }
    async login(dto) {
        if (dto.email !== this.singleUserEmail) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (dto.password !== this.singleUserPassword) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.ensureSingleUser();
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(this.singleUserPassword, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.issueTokens(user.id, user.email);
    }
    async refresh(userId, refreshToken) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.refreshTokenHash)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        return this.issueTokens(user.id, user.email);
    }
    async issueTokens(userId, email) {
        const accessToken = await this.jwt.signAsync({ sub: userId, email }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m' });
        const refreshToken = await this.jwt.signAsync({ sub: userId, email }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d' });
        await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) } });
        return { accessToken, refreshToken };
    }
    async ensureSingleUser() {
        const existing = await this.prisma.user.findUnique({ where: { email: this.singleUserEmail } });
        if (existing) {
            const alreadyMatches = await bcrypt.compare(this.singleUserPassword, existing.passwordHash);
            if (alreadyMatches)
                return existing;
            const passwordHash = await bcrypt.hash(this.singleUserPassword, 10);
            return this.prisma.user.update({
                where: { id: existing.id },
                data: { passwordHash },
            });
        }
        const passwordHash = await bcrypt.hash(this.singleUserPassword, 10);
        return this.prisma.user.create({ data: { email: this.singleUserEmail, passwordHash } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map