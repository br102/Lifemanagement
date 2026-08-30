import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        weightKg: true,
        heightCm: true,
        age: true,
        sex: true,
        activityLevel: true,
        fitnessGoal: true,
        goalNotes: true,
        dietaryPreferences: true,
        allergies: true,
        dislikes: true,
        targetCalories: true,
        targetProtein: true,
        targetCarbs: true,
        targetFat: true,
        mealsPerDay: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        displayName: true,
        weightKg: true,
        heightCm: true,
        age: true,
        sex: true,
        activityLevel: true,
        fitnessGoal: true,
        goalNotes: true,
        dietaryPreferences: true,
        allergies: true,
        dislikes: true,
        targetCalories: true,
        targetProtein: true,
        targetCarbs: true,
        targetFat: true,
        mealsPerDay: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
