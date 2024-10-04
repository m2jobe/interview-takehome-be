import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Material } from 'src/tickets/enums/material.enum';
import { TicketRepository } from 'src/tickets/repositories/ticket.repository';
import { AppModule } from 'src/app.module';

describe('Tickets - Filter (e2e)', () => {
  let app: INestApplication;
  let ticketRepository: TicketRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    ticketRepository = moduleFixture.get<TicketRepository>(TicketRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await ticketRepository.clear();
    // Seed some test data
    await ticketRepository.save([
      {
        siteId: 1,
        truckId: 1,
        dispatchedAt: new Date('2023-05-01T10:00:00Z'),
        material: Material.SOIL,
        ticketNumber: '1-000001',
      },
      {
        siteId: 2,
        truckId: 2,
        dispatchedAt: new Date('2023-05-02T11:00:00Z'),
        material: Material.SOIL,
        ticketNumber: '2-000001',
      },
      {
        siteId: 1,
        truckId: 3,
        dispatchedAt: new Date('2023-05-03T12:00:00Z'),
        material: Material.SOIL,
        ticketNumber: '1-000002',
      },
    ]);
  });

  it('/tickets (GET) should filter tickets by siteIds', async () => {
    const response = await request(app.getHttpServer())
      .get('/tickets')
      .query({ siteIds: ['1'] })
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].siteId).toBe(1);
    expect(response.body[1].siteId).toBe(1);
  });

  it('/tickets (GET) should filter tickets by date range', async () => {
    const response = await request(app.getHttpServer())
      .get('/tickets')
      .query({
        startDate: '2023-05-01T00:00:00.000Z',
        endDate: '2023-05-02T23:59:59.999Z',
      })
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(new Date(response.body[0].dispatchedAt)).toBeInstanceOf(Date);
    expect(new Date(response.body[1].dispatchedAt)).toBeInstanceOf(Date);
  });

  it('/tickets (GET) should handle invalid filter parameters', async () => {
    const response = await request(app.getHttpServer())
      .get('/tickets')
      .query({ startDate: 'invalid-date' })
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message[0]).toContain(
      'startDate must be a valid ISO 8601 date string',
    );
  });
});
