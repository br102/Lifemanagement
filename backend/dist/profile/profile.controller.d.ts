import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getMe(user: {
        userId: string;
    }): import(".prisma/client").Prisma.Prisma__UserClient<{
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
    updateMe(user: {
        userId: string;
    }, dto: UpdateProfileDto): import(".prisma/client").Prisma.Prisma__UserClient<{
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
