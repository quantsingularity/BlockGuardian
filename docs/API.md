# API Reference

Complete REST API documentation for BlockGuardian backend services.

## Table of Contents

- [Base Information](#base-information)
- [Authentication](#authentication)
- [User Management](#user-management)
- [Portfolio Management](#portfolio-management)
- [Transaction Operations](#transaction-operations)
- [Compliance](#compliance)
- [Monitoring & Metrics](#monitoring--metrics)
- [Error Handling](#error-handling)

## Base Information

**Base URL:** `http://localhost:5000` (development)  
**Production URL:** `https://api.blockguardian.example.com`  
**API Version:** v1  
**Content-Type:** `application/json`

### Rate Limits

| User Type       | Requests/Minute | Burst |
| --------------- | --------------- | ----- |
| Unauthenticated | 20              | 30    |
| Authenticated   | 100             | 150   |
| Premium         | 500             | 750   |

### Response Headers

All responses include standard headers:

| Header                  | Description                 | Example      |
| ----------------------- | --------------------------- | ------------ |
| `X-RateLimit-Limit`     | Maximum requests per period | `100`        |
| `X-RateLimit-Remaining` | Remaining requests          | `95`         |
| `X-RateLimit-Reset`     | Reset timestamp (Unix)      | `1735564800` |
| `X-API-Version`         | API version                 | `1.0.0`      |

## Authentication

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**

| Name         | Type   | Required | Description                                            | Example              |
| ------------ | ------ | -------- | ------------------------------------------------------ | -------------------- |
| `email`      | string | Yes      | Valid email address                                    | `"user@example.com"` |
| `password`   | string | Yes      | Min 8 chars, must include uppercase, lowercase, number | `"SecurePass123!"`   |
| `first_name` | string | Yes      | User's first name                                      | `"John"`             |
| `last_name`  | string | Yes      | User's last name                                       | `"Doe"`              |
| `phone`      | string | No       | Phone number                                           | `"+1234567890"`      |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Response (201 Created):**

```json
{
    "user_id": "usr_123abc",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2025-12-30T10:00:00Z",
    "status": "active"
}
```

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**

| Name       | Type   | Required | Description                   | Example              |
| ---------- | ------ | -------- | ----------------------------- | -------------------- |
| `email`    | string | Yes      | User's email                  | `"user@example.com"` |
| `password` | string | Yes      | User's password               | `"SecurePass123!"`   |
| `mfa_code` | string | No       | 6-digit MFA code (if enabled) | `"123456"`           |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (200 OK):**

```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400,
    "refresh_token": "rt_abc123...",
    "user": {
        "user_id": "usr_123abc",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
}
```

### Refresh Token

Obtain a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**

| Name            | Type   | Required | Description         | Example          |
| --------------- | ------ | -------- | ------------------- | ---------------- |
| `refresh_token` | string | Yes      | Valid refresh token | `"rt_abc123..."` |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "rt_abc123..."}'
```

**Response (200 OK):**

```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400
}
```

### Logout

Invalidate current session tokens.

**Endpoint:** `POST /api/auth/logout`

**Headers Required:**

| Header          | Value                   |
| --------------- | ----------------------- |
| `Authorization` | `Bearer <access_token>` |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200 OK):**

```json
{
    "message": "Successfully logged out"
}
```

### Enable MFA

Enable multi-factor authentication for user account.

**Endpoint:** `POST /api/auth/mfa/enable`

**Headers Required:** `Authorization: Bearer <token>`

**Response (200 OK):**

```json
{
    "secret": "JBSWY3DPEHPK3PXP",
    "qr_code_url": "data:image/png;base64,iVBORw0KG...",
    "backup_codes": ["12345678", "87654321", "11223344"]
}
```

### Verify MFA

Verify and activate MFA with code.

**Endpoint:** `POST /api/auth/mfa/verify`

**Headers Required:** `Authorization: Bearer <token>`

**Request Body:**

| Name   | Type   | Required | Description       | Example    |
| ------ | ------ | -------- | ----------------- | ---------- |
| `code` | string | Yes      | 6-digit TOTP code | `"123456"` |

**Response (200 OK):**

```json
{
    "message": "MFA enabled successfully",
    "mfa_enabled": true
}
```

## User Management

### Get Current User

Retrieve authenticated user's profile.

**Endpoint:** `GET /api/users/me`

**Headers Required:** `Authorization: Bearer <token>`

**Example Request:**

```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200 OK):**

```json
{
    "user_id": "usr_123abc",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "kyc_verified": true,
    "mfa_enabled": true,
    "created_at": "2025-01-01T00:00:00Z",
    "last_login": "2025-12-30T10:00:00Z"
}
```

### Update User Profile

Update user information.

**Endpoint:** `PATCH /api/users/me`

**Headers Required:** `Authorization: Bearer <token>`

**Request Body:**

| Name         | Type   | Required | Description        | Example         |
| ------------ | ------ | -------- | ------------------ | --------------- |
| `first_name` | string | No       | Updated first name | `"Jane"`        |
| `last_name`  | string | No       | Updated last name  | `"Smith"`       |
| `phone`      | string | No       | Updated phone      | `"+9876543210"` |

**Example Request:**

```bash
curl -X PATCH http://localhost:5000/api/users/me \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Jane"}'
```

**Response (200 OK):**

```json
{
    "user_id": "usr_123abc",
    "email": "user@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "updated_at": "2025-12-30T10:05:00Z"
}
```

## Portfolio Management

### List Portfolios

Get all portfolios for authenticated user.

**Endpoint:** `GET /api/portfolios`

**Headers Required:** `Authorization: Bearer <token>`

**Query Parameters:**

| Name       | Type    | Required | Default      | Description              | Example               |
| ---------- | ------- | -------- | ------------ | ------------------------ | --------------------- |
| `page`     | integer | No       | 1            | Page number              | `1`                   |
| `per_page` | integer | No       | 10           | Items per page (max 100) | `20`                  |
| `sort_by`  | string  | No       | `created_at` | Sort field               | `name`, `total_value` |
| `order`    | string  | No       | `desc`       | Sort order               | `asc`, `desc`         |

**Example Request:**

```bash
curl "http://localhost:5000/api/portfolios?page=1&per_page=10" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200 OK):**

```json
{
    "portfolios": [
        {
            "id": "pf_123",
            "name": "Crypto Growth Portfolio",
            "description": "Aggressive growth strategy",
            "total_value": 50000.0,
            "risk_tolerance": "high",
            "created_at": "2025-01-01T00:00:00Z",
            "last_updated": "2025-12-30T10:00:00Z",
            "asset_count": 5,
            "performance_7d": 5.2,
            "performance_30d": 12.8
        }
    ],
    "pagination": {
        "page": 1,
        "per_page": 10,
        "total": 3,
        "pages": 1
    }
}
```

### Create Portfolio

Create a new investment portfolio.

**Endpoint:** `POST /api/portfolios`

**Headers Required:** `Authorization: Bearer <token>`

**Request Body:**

| Name             | Type   | Required | Description                    | Example                         |
| ---------------- | ------ | -------- | ------------------------------ | ------------------------------- |
| `name`           | string | Yes      | Portfolio name (max 100 chars) | `"Crypto Growth"`               |
| `description`    | string | No       | Portfolio description          | `"Long-term crypto holdings"`   |
| `risk_tolerance` | string | Yes      | Risk level                     | `"low"`, `"moderate"`, `"high"` |
| `target_return`  | number | No       | Annual target return (%)       | `15.0`                          |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/portfolios \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Crypto Growth Portfolio",
    "description": "Aggressive growth strategy",
    "risk_tolerance": "high",
    "target_return": 20.0
  }'
```

**Response (201 Created):**

```json
{
    "id": "pf_123",
    "name": "Crypto Growth Portfolio",
    "description": "Aggressive growth strategy",
    "risk_tolerance": "high",
    "target_return": 20.0,
    "total_value": 0.0,
    "created_at": "2025-12-30T10:00:00Z",
    "owner_id": "usr_123abc"
}
```

### Get Portfolio Details

Retrieve detailed portfolio information.

**Endpoint:** `GET /api/portfolios/{portfolio_id}`

**Headers Required:** `Authorization: Bearer <token>`

**Path Parameters:**

| Name           | Type   | Description          | Example    |
| -------------- | ------ | -------------------- | ---------- |
| `portfolio_id` | string | Portfolio identifier | `"pf_123"` |

**Example Request:**

```bash
curl http://localhost:5000/api/portfolios/pf_123 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200 OK):**

```json
{
    "id": "pf_123",
    "name": "Crypto Growth Portfolio",
    "description": "Aggressive growth strategy",
    "risk_tolerance": "high",
    "target_return": 20.0,
    "total_value": 50000.0,
    "created_at": "2025-01-01T00:00:00Z",
    "last_updated": "2025-12-30T10:00:00Z",
    "assets": [
        {
            "id": "asset_001",
            "symbol": "BTC",
            "name": "Bitcoin",
            "amount": 0.5,
            "current_price": 45000.0,
            "total_value": 22500.0,
            "allocation": 45.0,
            "target_allocation": 40.0,
            "change_24h": 2.5
        },
        {
            "id": "asset_002",
            "symbol": "ETH",
            "name": "Ethereum",
            "amount": 5.0,
            "current_price": 3000.0,
            "total_value": 15000.0,
            "allocation": 30.0,
            "target_allocation": 30.0,
            "change_24h": 1.8
        }
    ],
    "performance": {
        "24h": 2.1,
        "7d": 5.2,
        "30d": 12.8,
        "ytd": 45.3,
        "all_time": 98.7
    }
}
```

### Update Portfolio

Update portfolio information.

**Endpoint:** `PATCH /api/portfolios/{portfolio_id}`

**Headers Required:** `Authorization: Bearer <token>`

**Request Body:**

| Name             | Type   | Required | Description           | Example              |
| ---------------- | ------ | -------- | --------------------- | -------------------- |
| `name`           | string | No       | Updated name          | `"New Name"`         |
| `description`    | string | No       | Updated description   | `"Updated strategy"` |
| `risk_tolerance` | string | No       | Updated risk level    | `"moderate"`         |
| `target_return`  | number | No       | Updated target return | `18.0`               |

**Response (200 OK):**

```json
{
    "id": "pf_123",
    "name": "Updated Portfolio Name",
    "description": "Updated strategy",
    "updated_at": "2025-12-30T10:05:00Z"
}
```

### Delete Portfolio

Delete a portfolio.

**Endpoint:** `DELETE /api/portfolios/{portfolio_id}`

**Headers Required:** `Authorization: Bearer <token>`

**Response (204 No Content)**

### Add Asset to Portfolio

Add a new asset to portfolio.

**Endpoint:** `POST /api/portfolios/{portfolio_id}/assets`

**Headers Required:** `Authorization: Bearer <token>`

**Request Body:**

| Name                | Type   | Required | Description             | Example    |
| ------------------- | ------ | -------- | ----------------------- | ---------- |
| `symbol`            | string | Yes      | Asset symbol            | `"BTC"`    |
| `amount`            | number | Yes      | Quantity to add         | `0.5`      |
| `target_allocation` | number | No       | Target % (0-100)        | `40.0`     |
| `purchase_price`    | number | No       | Purchase price per unit | `45000.00` |

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/portfolios/pf_123/assets \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "amount": 0.5,
    "target_allocation": 40.0,
    "purchase_price": 45000.00
  }'
```

**Response (201 Created):**

```json
{
    "id": "asset_001",
    "portfolio_id": "pf_123",
    "symbol": "BTC",
    "amount": 0.5,
    "current_price": 45000.0,
    "total_value": 22500.0,
    "target_allocation": 40.0,
    "added_at": "2025-12-30T10:00:00Z"
}
```

## Transaction Operations

### Record Transaction

Record a portfolio transaction.

**Endpoint:** `POST /api/portfolios/{portfolio_id}/transactions`

**Headers Required:** `Authorization: Bearer <token>`

**Request Body:**

| Name     | Type   | Required | Description        | Example                         |
| -------- | ------ | -------- | ------------------ | ------------------------------- |
| `type`   | string | Yes      | Transaction type   | `"buy"`, `"sell"`, `"transfer"` |
| `symbol` | string | Yes      | Asset symbol       | `"BTC"`                         |
| `amount` | number | Yes      | Transaction amount | `0.1`                           |
| `price`  | number | Yes      | Price per unit     | `45000.00`                      |
| `fee`    | number | No       | Transaction fee    | `50.00`                         |
| `notes`  | string | No       | Additional notes   | `"DCA purchase"`                |

**Response (201 Created):**

```json
{
    "id": "tx_abc123",
    "portfolio_id": "pf_123",
    "type": "buy",
    "symbol": "BTC",
    "amount": 0.1,
    "price": 45000.0,
    "total": 4500.0,
    "fee": 50.0,
    "timestamp": "2025-12-30T10:00:00Z"
}
```

### Get Transaction History

Retrieve portfolio transaction history.

**Endpoint:** `GET /api/portfolios/{portfolio_id}/transactions`

**Headers Required:** `Authorization: Bearer <token>`

**Query Parameters:**

| Name         | Type    | Required | Default | Description           | Example           |
| ------------ | ------- | -------- | ------- | --------------------- | ----------------- |
| `type`       | string  | No       | all     | Filter by type        | `"buy"`, `"sell"` |
| `symbol`     | string  | No       | all     | Filter by symbol      | `"BTC"`           |
| `start_date` | string  | No       | null    | Start date (ISO 8601) | `"2025-01-01"`    |
| `end_date`   | string  | No       | null    | End date (ISO 8601)   | `"2025-12-31"`    |
| `page`       | integer | No       | 1       | Page number           | `1`               |
| `per_page`   | integer | No       | 20      | Items per page        | `50`              |

**Response (200 OK):**

```json
{
    "transactions": [
        {
            "id": "tx_abc123",
            "type": "buy",
            "symbol": "BTC",
            "amount": 0.1,
            "price": 45000.0,
            "total": 4500.0,
            "fee": 50.0,
            "timestamp": "2025-12-30T10:00:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 150,
        "pages": 8
    }
}
```

## Compliance

### Submit KYC Documents

Submit Know Your Customer verification documents.

**Endpoint:** `POST /api/compliance/kyc`

**Headers Required:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**

| Name              | Type   | Required | Description                | Example                           |
| ----------------- | ------ | -------- | -------------------------- | --------------------------------- |
| `document_type`   | string | Yes      | Document type              | `"passport"`, `"drivers_license"` |
| `document_number` | string | Yes      | Document number            | `"AB123456"`                      |
| `country`         | string | Yes      | Issuing country (ISO 3166) | `"US"`                            |
| `document_front`  | file   | Yes      | Front image (max 5MB)      | Binary file                       |
| `document_back`   | file   | No       | Back image (max 5MB)       | Binary file                       |
| `selfie`          | file   | Yes      | Selfie photo (max 5MB)     | Binary file                       |

**Response (202 Accepted):**

```json
{
    "submission_id": "kyc_sub_123",
    "status": "pending_review",
    "submitted_at": "2025-12-30T10:00:00Z",
    "estimated_review_time": "24-48 hours"
}
```

### Get KYC Status

Check KYC verification status.

**Endpoint:** `GET /api/compliance/kyc/status`

**Headers Required:** `Authorization: Bearer <token>`

**Response (200 OK):**

```json
{
    "status": "verified",
    "verified_at": "2025-12-28T15:30:00Z",
    "tier": "tier_2",
    "limits": {
        "daily_withdrawal": 50000.0,
        "monthly_withdrawal": 500000.0
    }
}
```

## Monitoring & Metrics

### Health Check

Check API health status.

**Endpoint:** `GET /health`

**No authentication required**

**Response (200 OK):**

```json
{
    "status": "healthy",
    "timestamp": "2025-12-30T10:00:00Z",
    "version": "1.0.0",
    "environment": "production",
    "services": {
        "database": "healthy",
        "redis": "healthy",
        "blockchain": "healthy"
    }
}
```

### Get API Info

Get API information and available endpoints.

**Endpoint:** `GET /api/info`

**No authentication required**

**Response (200 OK):**

```json
{
    "name": "BlockGuardian Backend API",
    "version": "1.0.0",
    "description": "Enterprise-grade blockchain security platform",
    "environment": "production",
    "features": [
        "User Authentication & Authorization",
        "Multi-Factor Authentication",
        "Portfolio Management",
        "Asset Trading",
        "KYC/AML Compliance",
        "Audit Logging",
        "Rate Limiting",
        "Data Encryption"
    ],
    "endpoints": {
        "auth": "/api/auth",
        "portfolios": "/api/portfolios",
        "health": "/health",
        "docs": "/api/docs"
    }
}
```

## Error Handling

All errors follow a consistent format:

**Error Response Structure:**

```json
{
    "error": "Error Type",
    "message": "Human-readable error message",
    "status_code": 400,
    "details": {
        "field": "Specific field error"
    },
    "timestamp": "2025-12-30T10:00:00Z",
    "request_id": "req_abc123"
}
```

### HTTP Status Codes

| Code | Name                  | Description              | Example Use Case           |
| ---- | --------------------- | ------------------------ | -------------------------- |
| 200  | OK                    | Success                  | GET request successful     |
| 201  | Created               | Resource created         | POST successful            |
| 204  | No Content            | Success, no data         | DELETE successful          |
| 400  | Bad Request           | Invalid request data     | Missing required field     |
| 401  | Unauthorized          | Missing/invalid auth     | No token provided          |
| 403  | Forbidden             | Insufficient permissions | Accessing others' data     |
| 404  | Not Found             | Resource doesn't exist   | Invalid portfolio ID       |
| 409  | Conflict              | Resource conflict        | Email already exists       |
| 422  | Unprocessable Entity  | Validation failed        | Invalid email format       |
| 429  | Too Many Requests     | Rate limit exceeded      | Too many API calls         |
| 500  | Internal Server Error | Server error             | Unexpected error           |
| 503  | Service Unavailable   | Service down             | Database connection failed |

### Common Error Examples

**401 Unauthorized:**

```json
{
    "error": "Unauthorized",
    "message": "Authentication is required to access this resource",
    "status_code": 401
}
```

**400 Bad Request:**

```json
{
    "error": "Bad Request",
    "message": "Validation failed",
    "status_code": 400,
    "details": {
        "email": "Invalid email format",
        "password": "Password must be at least 8 characters"
    }
}
```

**429 Rate Limit:**

```json
{
    "error": "Rate Limit Exceeded",
    "message": "Too many requests. Please try again later.",
    "status_code": 429,
    "retry_after": 60
}
```

## Best Practices

1. **Authentication**: Always include valid JWT token in Authorization header
2. **Rate Limiting**: Implement exponential backoff when rate limited
3. **Error Handling**: Check status codes and parse error messages
4. **Pagination**: Use pagination for large datasets
5. **Filtering**: Apply filters to reduce response size
6. **Caching**: Cache responses where appropriate
7. **Timeouts**: Set reasonable request timeouts (30s recommended)
8. **HTTPS**: Always use HTTPS in production
9. **Logging**: Log all API requests and responses for debugging
10. **Versioning**: Include API version in requests for stability
