import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RoleType } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role?.name };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        };
    }

    async register(data: any) {
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) throw new BadRequestException('Email already in use');

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Ensure we have a default role CUSTOMER
        let role = await this.prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
        if (!role) {
            role = await this.prisma.role.create({ data: { name: 'CUSTOMER' } });
        }

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                roleId: role.id
            },
            include: { role: true }
        });

        return this.login(user);
    }
}
