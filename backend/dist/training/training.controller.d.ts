import { CreateTrainingExerciseDto } from './dto/create-training-exercise.dto';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateTrainingExerciseDto } from './dto/update-training-exercise.dto';
import { UpsertTrainingDayDto } from './dto/upsert-training-day.dto';
import { TrainingService } from './training.service';
export declare class TrainingController {
    private readonly training;
    constructor(training: TrainingService);
    findExercises(user: {
        userId: string;
    }, search?: string): Promise<{
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
    createExercise(user: {
        userId: string;
    }, dto: CreateTrainingExerciseDto): Promise<{
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
    updateExercise(user: {
        userId: string;
    }, id: string, dto: UpdateTrainingExerciseDto): Promise<{
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
    removeExercise(user: {
        userId: string;
    }, id: string): Promise<{
        success: boolean;
    }>;
    getSchedule(user: {
        userId: string;
    }, from?: string, to?: string): Promise<{
        id: any;
        date: any;
        status: any;
        notes: any;
        exercises: any;
    }[]>;
    upsertTrainingDay(user: {
        userId: string;
    }, dto: UpsertTrainingDayDto): Promise<{
        id: any;
        date: any;
        status: any;
        notes: any;
        exercises: any;
    }>;
    removeTrainingDay(user: {
        userId: string;
    }, date: string): Promise<{
        success: boolean;
    }>;
    getSessions(user: {
        userId: string;
    }, from?: string, to?: string): Promise<{
        id: any;
        trainingDayId: any;
        date: any;
        status: any;
        durationMin: any;
        notes: any;
        exercises: any;
        createdAt: any;
    }[]>;
    createSession(user: {
        userId: string;
    }, dto: CreateWorkoutSessionDto): Promise<{
        id: any;
        trainingDayId: any;
        date: any;
        status: any;
        durationMin: any;
        notes: any;
        exercises: any;
        createdAt: any;
    }>;
    getBalance(user: {
        userId: string;
    }, from?: string, to?: string): Promise<{
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
}
