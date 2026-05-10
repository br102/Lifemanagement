import { Module } from '@nestjs/common';
import { GroceriesController } from './groceries.controller';
import { GroceriesService } from './groceries.service';

@Module({ controllers: [GroceriesController], providers: [GroceriesService] })
export class GroceriesModule {}
