import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SitesModule } from 'src/site/sites.module';
import { TrucksModule } from 'src/truck/trucks.module';
import { TicketsModule } from 'src/tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        migrationsTableName: 'typeorm_migrations',
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    SitesModule,
    TrucksModule,
    TicketsModule,
  ],
  providers: [SeederService],
})
export class DatabaseModule {}
