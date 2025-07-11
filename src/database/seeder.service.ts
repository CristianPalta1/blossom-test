import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CharactersService } from '../characters/characters/characters.service';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(private readonly charsService: CharactersService) {}

  async onApplicationBootstrap() {
    const count = await this.charsService.count();
    if (count === 0) {
      this.logger.log('Seeding initial 15 Rick & Morty characters...');
      await this.charsService.seedInitial();
    } else {
      this.logger.log(`Skipping seed; table already has ${count} records.`);
    }
  }
}
