import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SiteRepository } from 'src/site/repositories/site.repository';
import { Site } from 'src/site/entities/site.entity';
import { TruckRepository } from 'src/truck/repositories/truck.repository';
import { Truck } from 'src/truck/entities/truck.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    private readonly siteRepository: SiteRepository,
    private readonly truckRepository: TruckRepository,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    await this.seedSites();
    await this.seedTrucks();
  }

  private async seedSites() {
    const sites = await this.loadSitesFromFile();
    if (sites.length > 0) {
      this.logger.log('Total sites to upsert:', sites.length);
      await this.batchUpsert(sites, this.siteRepository, 'id');
      this.logger.log('Sites have been upserted in the database.');
    } else {
      this.logger.warn('No site data found in the JSON file.');
    }
  }

  private async seedTrucks() {
    const trucks = await this.loadTrucksFromFile();
    if (trucks.length > 0) {
      this.logger.log('Total trucks to upsert:', trucks.length);
      await this.batchUpsert(trucks, this.truckRepository, 'id');
      this.logger.log('Trucks have been upserted in the database.');
    } else {
      this.logger.warn('No truck data found in the JSON file.');
    }
  }

  private async batchUpsert<T>(
    entities: T[],
    repository: any,
    primaryKey: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (let i = 0; i < entities.length; i += this.BATCH_SIZE) {
        const chunk = entities.slice(i, i + this.BATCH_SIZE);
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(repository.target)
          .values(chunk)
          .orUpdate([...Object.keys(repository.target.prototype)], [primaryKey])
          .execute();
        this.logger.log(`Upserted batch ${i / this.BATCH_SIZE + 1}`);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error(`Error upserting batch:`, error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async loadSitesFromFile(): Promise<Site[]> {
    const filePath = path.join(__dirname, '..', '..', 'data', 'sites.json');
    return this.loadEntitiesFromFile<Site>(filePath, Site);
  }

  private async loadTrucksFromFile(): Promise<Truck[]> {
    const filePath = path.join(__dirname, '..', '..', 'data', 'trucks.json');
    return this.loadEntitiesFromFile<Truck>(filePath, Truck);
  }

  private async loadEntitiesFromFile<T>(
    filePath: string,
    entityClass: new () => T,
  ): Promise<T[]> {
    try {
      const fileData = await fs.promises.readFile(filePath, 'utf-8');
      const entities = JSON.parse(fileData);
      return entities.map((entityData: T) => {
        const entity = new entityClass();
        Object.assign(entity, entityData);
        return entity;
      });
    } catch (error) {
      this.logger.error(
        `Error reading entities from JSON file: ${filePath}`,
        error,
      );
      return [];
    }
  }
}
