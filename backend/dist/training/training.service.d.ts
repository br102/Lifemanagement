import { PrismaService } from '../database/prisma.service';
import { CreateTrainingExerciseDto } from './dto/create-training-exercise.dto';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateTrainingExerciseDto } from './dto/update-training-exercise.dto';
import { UpsertTrainingDayDto } from './dto/upsert-training-day.dto';
export declare class TrainingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findExercises(userId: string, search?: string): Promise<{
        id: any;
        name: any;
        category: any;
        muscleGroups: any;
        equipment: any;
        difficulty: any;
        instructions: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    createExercise(userId: string, dto: CreateTrainingExerciseDto): Promise<{
        id: any;
        name: any;
        category: any;
        muscleGroups: any;
        equipment: any;
        difficulty: any;
        instructions: any;
        createdAt: any;
        updatedAt: any;
    }>;
    updateExercise(userId: string, id: string, dto: UpdateTrainingExerciseDto): Promise<{
        id: any;
        name: any;
        category: any;
        muscleGroups: any;
        equipment: any;
        difficulty: any;
        instructions: any;
        createdAt: any;
        updatedAt: any;
    }>;
    removeExercise(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    getSchedule(userId: string, from?: string, to?: string): Promise<{
        id: any;
        date: any;
        status: any;
        notes: any;
        exercises: any;
    }[]>;
    upsertTrainingDay(userId: string, dto: UpsertTrainingDayDto): Promise<{
        id: any;
        date: any;
        status: any;
        notes: any;
        exercises: any;
    }>;
    removeTrainingDay(userId: string, date: string): Promise<{
        success: boolean;
    }>;
    getSessions(userId: string, from?: string, to?: string): Promise<{
        id: any;
        trainingDayId: any;
        date: any;
        status: any;
        durationMin: any;
        notes: any;
        exercises: any;
        createdAt: any;
    }[]>;
    createSession(userId: string, dto: CreateWorkoutSessionDto): Promise<{
        id: any;
        trainingDayId: any;
        date: any;
        status: any;
        durationMin: any;
        notes: any;
        exercises: any;
        createdAt: any;
    }>;
    getBalance(userId: string, from?: string, to?: string): Promise<{
        from: string | undefined;
        to: string | undefined;
        plannedWorkouts: number;
        completedWorkouts: number;
        skippedWorkouts: number;
        totalLoggedMinutes: number;
        plannedMuscleGroups: {
            [k: string]: number;
        };
        completedMuscleGroups: {
            [k: string]: number;
        };
        categoryDistribution: {
            [k: string]: number;
        };
        warnings: string[];
    }>;
    private assertExerciseOwnership;
    private dateRange;
    private readonly trainingDayInclude;
    private readonly workoutSessionInclude;
    private toExercise;
    private toTrainingDay;
    private toWorkoutSession;
}
