import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateTrainingExerciseDto } from './dto/create-training-exercise.dto';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateTrainingExerciseDto } from './dto/update-training-exercise.dto';
import { UpsertTrainingDayDto } from './dto/upsert-training-day.dto';
import { TrainingService } from './training.service';

@ApiTags('training')
@ApiBearerAuth()
@Controller('training')
export class TrainingController {
  constructor(private readonly training: TrainingService) {}

  @Get('exercises')
  findExercises(@CurrentUser() user: { userId: string }, @Query('search') search?: string) {
    return this.training.findExercises(user.userId, search);
  }

  @Post('exercises')
  createExercise(@CurrentUser() user: { userId: string }, @Body() dto: CreateTrainingExerciseDto) {
    return this.training.createExercise(user.userId, dto);
  }

  @Patch('exercises/:id')
  updateExercise(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: UpdateTrainingExerciseDto) {
    return this.training.updateExercise(user.userId, id, dto);
  }

  @Delete('exercises/:id')
  removeExercise(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.training.removeExercise(user.userId, id);
  }

  @Get('schedule')
  getSchedule(@CurrentUser() user: { userId: string }, @Query('from') from?: string, @Query('to') to?: string) {
    return this.training.getSchedule(user.userId, from, to);
  }

  @Post('schedule')
  upsertTrainingDay(@CurrentUser() user: { userId: string }, @Body() dto: UpsertTrainingDayDto) {
    return this.training.upsertTrainingDay(user.userId, dto);
  }

  @Delete('schedule/:date')
  removeTrainingDay(@CurrentUser() user: { userId: string }, @Param('date') date: string) {
    return this.training.removeTrainingDay(user.userId, date);
  }

  @Get('sessions')
  getSessions(@CurrentUser() user: { userId: string }, @Query('from') from?: string, @Query('to') to?: string) {
    return this.training.getSessions(user.userId, from, to);
  }

  @Post('sessions')
  createSession(@CurrentUser() user: { userId: string }, @Body() dto: CreateWorkoutSessionDto) {
    return this.training.createSession(user.userId, dto);
  }

  @Get('balance')
  getBalance(@CurrentUser() user: { userId: string }, @Query('from') from?: string, @Query('to') to?: string) {
    return this.training.getBalance(user.userId, from, to);
  }
}
