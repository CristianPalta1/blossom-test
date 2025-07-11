import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SequelizeModule } from '@nestjs/sequelize';
import { Character } from './characters/entities/character.entity';
import { CharactersService } from './characters/characters.service';
import { CharactersResolver } from './characters/characters.resolver';
import { CharactersRepository } from './characters/repositories/characters.repository';

@Module({
  imports: [SequelizeModule.forFeature([Character]), HttpModule],
  providers: [CharactersService, CharactersResolver, CharactersRepository],
  exports: [CharactersService, CharactersRepository],
})
export class CharactersModule {}
