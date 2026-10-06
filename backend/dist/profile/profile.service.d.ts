import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        displayName: string | null;
        weightKg: number | null;
        heightCm: number | null;
        age: number | null;
        sex: string | null;
        targetCalories: number | null;
        targetProtein: number | null;
        targetCarbs: number | null;
        targetFat: number | null;
        mealsPerDay: number | null;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    updateProfile(userId: string, dto: UpdateProfileDto): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        displayName: string | null;
        weightKg: number | null;
        heightCm: number | null;
        age: number | null;
        sex: string | null;
        targetCalories: number | null;
        targetProtein: number | null;
        targetCarbs: number | null;
        targetFat: number | null;
        mealsPerDay: number | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
