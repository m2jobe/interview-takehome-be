import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { CreateBulkTicketsDto } from 'src/tickets/dto/create-bulk-tickets.dto';
import { Material } from 'src/tickets/enums/material.enum';
import { format } from 'date-fns';

describe('Tickets - Create Bulk (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/tickets (POST) should create bulk tickets', async () => {
    const createBulkTicketsDto: CreateBulkTicketsDto = {
      tickets: [
        {
          siteId: 33,
          truckId: 1,
          dispatchedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          material: Material.SOIL,
        },
        {
          siteId: 32,
          truckId: 11,
          dispatchedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          material: Material.SOIL,
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/tickets/bulk')
      .send(createBulkTicketsDto)
      .expect(201);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('ticketNumber');
    expect(response.body[1]).toHaveProperty('id');
    expect(response.body[1]).toHaveProperty('ticketNumber');
  });

  it('/tickets (POST) should handle validation errors', async () => {
    const invalidDto = {
      tickets: [
        {
          siteId: 'invalid', // should be a number
          truckId: 1,
          dispatchedAt: new Date(),
          material: Material.SOIL,
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/tickets/bulk')
      .send(invalidDto)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain(
      'Failed to create bulk tickets: invalid input syntax for type integer: "invalid"',
    );
  });
});
