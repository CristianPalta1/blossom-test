/**
 * Módulo principal de la aplicación.
 *
 * Configura y ensambla todos los componentes clave de la aplicación NestJS,
 * incluyendo la configuración global, el caché, la base de datos, GraphQL y
 * los módulos de funcionalidades específicas como `CharactersModule`.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { DatabaseModule } from './database/database.module';
import { CharactersModule } from './characters/characters.module';
import { DatabaseSeederService } from './database/seeder.service';

@Module({
  imports: [
    // Carga y provee acceso a variables de entorno de forma global.
    ConfigModule.forRoot({ isGlobal: true }),

    // Configura un sistema de caché global utilizando Redis.
    // Las opciones de conexión (host, puerto) se obtienen de la configuración.
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get<number>('REDIS_PORT'),
        ttl: 300, // Tiempo de vida (TTL) de 5 minutos por defecto para las entradas de caché.
      }),
      inject: [ConfigService],
    }),

    // Importa el módulo que gestiona la conexión con la base de datos.
    DatabaseModule,

    // Configura el servidor GraphQL.
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Genera automáticamente el esquema GraphQL a partir de los resolvers y entidades.
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // Habilita el playground de GraphQL en el navegador.
      playground: true,
      // Define la ruta de acceso al endpoint de GraphQL.
      path: '/graphql',
    }),

    // Importa el módulo que contiene toda la lógica relacionada con los personajes.
    CharactersModule,
  ],
  // Proveedores disponibles en este módulo.
  providers: [DatabaseSeederService],
})
export class AppModule {}
