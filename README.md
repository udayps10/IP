# IP (Industry Practice) – Real Estate Property Listing System

A full-stack real estate listing app where users can browse, search and list properties with photos. The backend is a layered Spring Boot REST API (MySQL for data, MinIO for property images, JWT for auth) and the frontend consumes it.

## Repository Structure

```
IP/
├── realestatepropertylistingsystem/   # Spring Boot backend (REST API)
├── frontend/                          # Frontend client
├── .gitignore
└── README.md
```

## Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Backend   | Java 17, Spring Boot 3, Spring Data JPA, Spring Security (JWT) |
| Database  | MySQL                                                   |
| Storage   | MinIO (S3-compatible object storage for property photos)|
| Frontend  | See `frontend/` (Node.js + npm)                         |
| Tools     | Git, IntelliJ IDEA, Maven                               |

## Backend Architecture

Standard layered design:

- **Entities** – JPA models mapped to MySQL tables
- **Repositories** – Spring Data JPA interfaces
- **Services** – business logic
- **DTOs** – request/response objects (entities are never returned directly)
- **Controllers** – REST endpoints
- **Security** – JWT-based login and request authorization

Base package: `com.example.realestatepropertylistingsystem`

## Features

- User registration and JWT login
- Create, read, update and delete property listings
- Property photo upload and storage via MinIO
- DTO-based API responses
- Relational schema managed through JPA/Hibernate

## Getting Started

### Prerequisites

- JDK 17+
- Maven (or use the included `mvnw` wrapper)
- MySQL 8+
- MinIO server
- Node.js 18+ and npm (for the frontend)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/udayps10/IP.git
cd IP
```

### 2. Set up MySQL

```sql
CREATE DATABASE realestate_db;
```

### 3. Start MinIO

```bash
docker run -d --name minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ":9001"
```

Open `http://localhost:9001` and create a bucket for property photos (e.g. `property-photos`).

### 4. Configure the backend

Edit `realestatepropertylistingsystem/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/realestate_db
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
spring.jpa.hibernate.ddl-auto=update

minio.url=http://localhost:9000
minio.access-key=minioadmin
minio.secret-key=minioadmin
minio.bucket=property-photos

jwt.secret=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
```

> Match the property names above to the ones actually used in your code. Never commit real credentials.

### 5. Run the backend

```bash
cd realestatepropertylistingsystem
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`.

### 6. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Notes

- Keep secrets (DB password, JWT secret, MinIO keys) out of Git; use environment variables or a local, git-ignored config.
- `ddl-auto=update` is for development only.

## Author

**Udaypratap** – [@udayps10](https://github.com/udayps10)
