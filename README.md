# SoilFLO Interview Takehome - NestJS Docker Project

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

This project is a NestJS application containerized with Docker, developed as a takehome assignment for SoilFLO. It implements a RESTful API for managing construction sites, trucks, and material dispatch tickets.

## Prerequisites

- Docker
- Docker Compose
- Git
- Postman or similar API testing tool

## Project Setup

1. Clone the repository:

   ```bash
   $ git clone https://github.com/m2jobe/interview-takehome-be
   $ cd interview-takehome-be
   ```

2. Copy the example environment file and configure it:
   ```bash
   $ cp .env.example .env
   ```
   Open the `.env` file for confirmation. You shouldn't need to adjust the values here.

## Running the Application

Use the following Docker Compose commands to build and run the application:

```bash
# Build and start the containers
$ docker-compose up -d

# View logs
$ docker-compose logs -f
```

## API Endpoints

### Create Tickets in Bulk

- **POST** `localhost:3000/tickets/bulk`
  - Creates multiple tickets for a truck
  - Validates that tickets are not dispatched at the same time or in the future
  - Expected request body:
    ```json
    {
      "tickets": [
        {
          "siteId": 2,
          "truckId": 4,
          "dispatchedAt": "2024-10-03 00:00:00"
        }
        // ... more ticket objects
      ]
    }
    ```

### Fetch Tickets

- **GET** `localhost:3000/tickets`
  - Retrieves all tickets
  - Can be filtered by:
    - Sites
    - Date range
  - Expected request query params with filters:
    ```
    localhost:3000/tickets?startDate=2020-01-01&endDate=2024-10-04&siteIds=3&siteIds=1
    ```

## Testing the API

To test the API endpoints, you can use Postman or any similar API testing tool. Import the provided API collection (if available) or create new requests based on the endpoint descriptions above.

1. Open Postman or your preferred API testing tool.
2. Create a new request for each endpoint (POST `/tickets/bulk` and GET `/tickets`).
3. Set the appropriate HTTP method, URL and request body/params as described in the API Endpoints section.
4. Send the requests and observe the responses.

## Data Models

### Sites

```
{
  id: number,
  name: string,
  address: string,
  description: string
}
```

### Trucks

```
{
  id: number,
  license: string,
  siteId: number
}
```

### Tickets

```
{
  id: number,
  truckId: number,
  siteId: number,
  dispatchTime: Date,
  ticketNumber: number,
  material: string
}
```

## Running Tests

Use the following commands to run tests:

```bash
# Run unit tests
$ docker-compose exec app npm run test

# Run e2e tests
$ docker-compose exec app npm run test:e2e
```

## Stopping the Application

To stop and remove the containers, networks, and volumes:

```bash
$ docker-compose down
```

## Project Context

- The application manages ~100,000 construction sites and ~1,000 trucks.
- Sites are locations that send or receive materials (e.g., Soil).
- Trucks transport materials between sites.
- The API allows creation and retrieval of dispatch tickets for material loads.

## Technical Details

- Built with NestJS and TypeScript
- Uses Postgres
- Follows RESTful API structure
- Containerized with Docker for easy setup and deployment
