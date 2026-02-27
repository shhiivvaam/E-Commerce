import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });

        if (!user) throw new NotFoundException('User not found');

        // exclude password
        const { password, ...result } = user;
        return result;
    }

    async update(id: string, data: UpdateUserDto) {
        // Check if user exists first
        await this.findOne(id);

        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.avatar && { avatar: data.avatar }),
            },
            include: { role: true },
        });

        // exclude password
        const { password, ...result } = updated;
        return result;
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.user.delete({ where: { id } });
    }
}
