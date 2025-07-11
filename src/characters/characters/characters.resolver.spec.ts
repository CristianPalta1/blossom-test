import { Test, TestingModule } from '@nestjs/testing';
import { CharactersResolver } from './characters.resolver';

describe('CharactersResolver', () => {
  let resolver: CharactersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CharactersResolver],
    }).compile();

    resolver = module.get<CharactersResolver>(CharactersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
