# INSA Intern Management System - API Specification

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000`  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Universities](#3-universities)
4. [Departments](#4-departments)
5. [Applications](#5-applications)
6. [Students](#6-students)
7. [Interns](#7-interns)
8. [Submissions](#8-submissions)
9. [Documents](#9-documents)
10. [Dashboard](#10-dashboard)
11. [Common Response Formats](#11-common-response-formats)
12. [Error Codes](#12-error-codes)
13. [Database Schema](#13-database-schema)
14. [Enumerations](#14-enumerations)

---

## Authentication Header

All protected endpoints require the following header:

```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication

### 1.1 Login

**POST** `/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "ADMIN | UNIVERSITY | SUPERVISOR | INTERN",
      "isFirstLogin": "boolean",
      "isActive": "boolean"
    },
    "token": "string (JWT)",
    "expiresIn": "86400"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "details": null
  }
}
```

---

### 1.2 Logout

**POST** `/auth/logout`

**Access:** All authenticated users

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

### 1.3 Get Current User

**GET** `/auth/me`

**Access:** All authenticated users

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "ADMIN | UNIVERSITY | SUPERVISOR | INTERN",
    "isFirstLogin": "boolean",
    "isActive": "boolean",
    "createdAt": "ISO 8601 datetime",
    "university": {
      "id": "uuid",
      "name": "string"
    },
    "department": {
      "id": "uuid",
      "name": "string",
      "type": "string"
    },
    "intern": {
      "id": "uuid",
      "internId": "string"
    }
  }
}
```

---

### 1.4 Change Password

**POST** `/auth/change-password`

**Access:** All authenticated users

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 characters)",
  "confirmPassword": "string (required, must match newPassword)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "error": {
    "code": "AUTH_INVALID_PASSWORD",
    "details": null
  }
}
```

---

### 1.5 Forgot Password

**POST** `/auth/forgot-password`

**Access:** Public

**Request Body:**
```json
{
  "email": "string (required, valid email)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset instructions sent to email",
  "data": null
}
```

---

### 1.6 Reset Password

**POST** `/auth/reset-password`

**Access:** Public

**Request Body:**
```json
{
  "token": "string (required, from email link)",
  "newPassword": "string (required, min 8 characters)",
  "confirmPassword": "string (required, must match newPassword)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

---

## 2. Users

### 2.1 List Users

**GET** `/users`

**Access:** ADMIN

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| role | string | No | Filter by role: ADMIN, UNIVERSITY, SUPERVISOR, INTERN |
| search | string | No | Search by name or email |
| isActive | boolean | No | Filter by active status |
| departmentId | uuid | No | Filter by department |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "role": "string",
        "isActive": "boolean",
        "isFirstLogin": "boolean",
        "department": {
          "id": "uuid",
          "name": "string"
        },
        "university": {
          "id": "uuid",
          "name": "string"
        },
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 50,
      "totalPages": 5
    }
  }
}
```

---

### 2.2 Get User by ID

**GET** `/users/:id`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | User ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "isActive": "boolean",
    "isFirstLogin": "boolean",
    "department": {
      "id": "uuid",
      "name": "string",
      "type": "string"
    },
    "university": {
      "id": "uuid",
      "name": "string"
    },
    "intern": {
      "id": "uuid",
      "internId": "string"
    },
    "supervisedInterns": [
      {
        "id": "uuid",
        "internId": "string"
      }
    ],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 2.3 Create User

**POST** `/users`

**Access:** ADMIN

**Request Body:**
```json
{
  "email": "string (required, valid email, unique)",
  "firstName": "string (required, max 100)",
  "lastName": "string (required, max 100)",
  "role": "string (required): ADMIN | UNIVERSITY | SUPERVISOR",
  "departmentId": "uuid (required if role is SUPERVISOR)",
  "universityId": "uuid (required if role is UNIVERSITY)"
}
```

 

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully. Temporary password sent to email.",
  "data": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "isActive": true,
    "isFirstLogin": true,
    "createdAt": "ISO 8601 datetime"
  }
}
```

---

### 2.4 Update User

**PATCH** `/users/:id`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | User ID |

**Request Body:**
```json
{
  "firstName": "string (optional, max 100)",
  "lastName": "string (optional, max 100)",
  "isActive": "boolean (optional)",
  "departmentId": "uuid (optional)",
  "universityId": "uuid (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "isActive": "boolean",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 2.5 Deactivate User

**DELETE** `/users/:id`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | User ID |

 

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": null
}
```

---

## 3. Universities

### 3.1 List Universities

**GET** `/universities`

**Access:** ADMIN

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| search | string | No | Search by name |
| isActive | boolean | No | Filter by active status |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Universities retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "address": "string",
        "contactEmail": "string",
        "contactPhone": "string",
        "isActive": "boolean",
        "coordinator": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string",
          "email": "string"
        },
        "applicationCount": "number",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 25,
      "totalPages": 3
    }
  }
}
```

---

### 3.2 Get University by ID

**GET** `/universities/:id`

**Access:** ADMIN, UNIVERSITY (own university only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | University ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "University retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "address": "string",
    "contactEmail": "string",
    "contactPhone": "string",
    "isActive": "boolean",
    "coordinator": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "applications": [
      {
        "id": "uuid",
        "academicYear": "string",
        "status": "string",
        "studentCount": "number",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 3.3 Create University

**POST** `/universities`

**Access:** ADMIN

**Request Body:**
```json
{
  "name": "string (required, unique, max 200)",
  "address": "string (optional, max 500)",
  "contactEmail": "string (optional, valid email)",
  "contactPhone": "string (optional, max 20)",
  "coordinator": {
    "email": "string (required, valid email, unique)",
    "firstName": "string (required, max 100)",
    "lastName": "string (required, max 100)"
  }
}
```

 

**Success Response (201):**
```json
{
  "success": true,
  "message": "University created successfully. Coordinator account created and credentials sent via email.",
  "data": {
    "id": "uuid",
    "name": "string",
    "address": "string",
    "contactEmail": "string",
    "contactPhone": "string",
    "isActive": true,
    "coordinator": {
      "id": "uuid",
      "email": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "createdAt": "ISO 8601 datetime"
  }
}
```

---

### 3.4 Update University

**PATCH** `/universities/:id`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | University ID |

**Request Body:**
```json
{
  "name": "string (optional, unique, max 200)",
  "address": "string (optional, max 500)",
  "contactEmail": "string (optional, valid email)",
  "contactPhone": "string (optional, max 20)",
  "isActive": "boolean (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "University updated successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "address": "string",
    "contactEmail": "string",
    "contactPhone": "string",
    "isActive": "boolean",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 3.5 Deactivate University

**DELETE** `/universities/:id`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | University ID |

 

**Success Response (200):**
```json
{
  "success": true,
  "message": "University deactivated successfully",
  "data": null
}
```

---

## 4. Departments

### 4.1 List Departments

**GET** `/departments`

**Access:** ADMIN, SUPERVISOR

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| type | string | No | Filter by type: NETWORKING, CYBERSECURITY, SOFTWARE_DEVELOPMENT |
| search | string | No | Search by name |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "type": "NETWORKING | CYBERSECURITY | SOFTWARE_DEVELOPMENT",
        "description": "string",
        "supervisorCount": "number",
        "internCount": "number",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 3,
      "totalPages": 1
    }
  }
}
```

---

### 4.2 Get Department by ID

**GET** `/departments/:id`

**Access:** ADMIN, SUPERVISOR

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Department ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Department retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "type": "NETWORKING | CYBERSECURITY | SOFTWARE_DEVELOPMENT",
    "description": "string",
    "supervisors": [
      {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "supervisedInternCount": "number"
      }
    ],
    "interns": [
      {
        "id": "uuid",
        "internId": "string",
        "firstName": "string",
        "lastName": "string",
        "status": "string"
      }
    ],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 4.3 Create Department

**POST** `/departments`

**Access:** ADMIN

**Request Body:**
```json
{
  "name": "string (required, unique, max 100)",
  "type": "string (required): NETWORKING | CYBERSECURITY | SOFTWARE_DEVELOPMENT",
  "description": "string (optional, max 500)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "type": "string",
    "description": "string",
    "createdAt": "ISO 8601 datetime"
  }
}
```

---

### 4.4 Update Department

**PATCH** `/departments/:id`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Department ID |

**Request Body:**
```json
{
  "name": "string (optional, unique, max 100)",
  "description": "string (optional, max 500)"
}
```

 

**Success Response (200):**
```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "type": "string",
    "description": "string",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 4.5 Get Department Interns

**GET** `/departments/:id/interns`

**Access:** ADMIN, SUPERVISOR (own department only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Department ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status: ACTIVE, COMPLETED, TERMINATED |
| supervisorId | uuid | No | Filter by supervisor |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Department interns retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "internId": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "status": "string",
        "startDate": "ISO 8601 date",
        "endDate": "ISO 8601 date",
        "supervisor": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 15,
      "totalPages": 2
    }
  }
}
```

---

### 4.6 Get Department Supervisors

**GET** `/departments/:id/supervisors`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Department ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Department supervisors retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "isActive": "boolean",
        "supervisedInternCount": "number"
      }
    ]
  }
}
```

---

## 5. Applications

### 5.1 List Applications

**GET** `/applications`

**Access:** ADMIN (all), UNIVERSITY (own only)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| status | string | No | Filter by status: PENDING, UNDER_REVIEW, APPROVED, REJECTED |
| universityId | uuid | No | Filter by university (ADMIN only) |
| academicYear | string | No | Filter by academic year (e.g., "2024/2025") |
| startDate | date | No | Filter by created date (from) |
| endDate | date | No | Filter by created date (to) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "academicYear": "string",
        "status": "PENDING | UNDER_REVIEW | APPROVED | REJECTED",
        "officialLetterUrl": "string",
        "rejectionReason": "string | null",
        "studentCount": "number",
        "acceptedStudentCount": "number",
        "university": {
          "id": "uuid",
          "name": "string"
        },
        "reviewedBy": "string | null",
        "reviewedAt": "ISO 8601 datetime | null",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 50,
      "totalPages": 5
    }
  }
}
```

---

### 5.2 Get Application by ID

**GET** `/applications/:id`

**Access:** ADMIN, UNIVERSITY (own only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Application ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "id": "uuid",
    "academicYear": "string",
    "status": "PENDING | UNDER_REVIEW | APPROVED | REJECTED",
    "officialLetterUrl": "string",
    "rejectionReason": "string | null",
    "university": {
      "id": "uuid",
      "name": "string",
      "contactEmail": "string",
      "contactPhone": "string"
    },
    "students": [
      {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "studentId": "string",
        "fieldOfStudy": "string",
        "academicYear": "string",
        "email": "string",
        "phone": "string",
        "status": "string",
        "rejectionReason": "string | null",
        "cvUrl": "string | null",
        "transcriptUrl": "string | null"
      }
    ],
    "reviewedBy": "string | null",
    "reviewedAt": "ISO 8601 datetime | null",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 5.3 Create Application

**POST** `/applications`

**Access:** UNIVERSITY

**Request Body:**
```json
{
  "academicYear": "string (required, format: YYYY/YYYY)",
  "officialLetterUrl": "string (required, valid URL - uploaded via /documents/upload)",
  "students": [
    {
      "firstName": "string (required, max 100)",
      "lastName": "string (required, max 100)",
      "studentId": "string (required, unique)",
      "fieldOfStudy": "string (required, max 200)",
      "academicYear": "string (required, e.g., '3rd Year')",
      "email": "string (optional, valid email)",
      "phone": "string (optional, max 20)",
      "cvUrl": "string (optional, valid URL)",
      "transcriptUrl": "string (optional, valid URL)"
    }
  ]
}
```

**Validation Rules:**
- At least 1 student required
- studentId must be unique across all applications
- Academic year format: YYYY/YYYY (e.g., "2024/2025")

**Success Response (201):**
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "id": "uuid",
    "academicYear": "string",
    "status": "PENDING",
    "officialLetterUrl": "string",
    "studentCount": "number",
    "university": {
      "id": "uuid",
      "name": "string"
    },
    "createdAt": "ISO 8601 datetime"
  }
}
```

---

### 5.4 Update Application

**PATCH** `/applications/:id`

**Access:** UNIVERSITY (own only, status must be PENDING or REJECTED)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Application ID |

**Request Body:**
```json
{
  "academicYear": "string (optional, format: YYYY/YYYY)",
  "officialLetterUrl": "string (optional, valid URL)"
}
```

 

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": {
    "id": "uuid",
    "academicYear": "string",
    "status": "string",
    "officialLetterUrl": "string",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 5.5 Submit Application for Review

**POST** `/applications/:id/submit`

**Access:** UNIVERSITY (own only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Application ID |

 

**Validation:**
- Application must have at least 1 student
- Official letter must be uploaded
- Status must be PENDING

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application submitted for review",
  "data": {
    "id": "uuid",
    "status": "UNDER_REVIEW",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 5.6 Review Application (Admin)

**POST** `/applications/:id/review`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Application ID |

**Request Body:**
```json
{
  "decision": "string (required): APPROVED | REJECTED",
  "rejectionReason": "string (required if decision is REJECTED, max 500)"
}
```

 

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application reviewed successfully",
  "data": {
    "id": "uuid",
    "status": "APPROVED | REJECTED",
    "rejectionReason": "string | null",
    "reviewedBy": "string",
    "reviewedAt": "ISO 8601 datetime"
  }
}
```

---

### 5.7 Archive Application

**DELETE** `/applications/:id`

**Access:** UNIVERSITY (own application only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Application ID |

**Validation:**
- Application must be owned by the requesting university
- Application must be in an archivable state

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application archived successfully",
  "data": null
}
```

---

## 6. Students

### 6.1 List Students in Application

**GET** `/applications/:appId/students`

**Access:** ADMIN, UNIVERSITY (own application only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| appId | uuid | Application ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status |
| search | string | No | Search by name or studentId |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "studentId": "string",
        "fieldOfStudy": "string",
        "academicYear": "string",
        "email": "string",
        "phone": "string",
        "status": "PENDING_REVIEW | ACCEPTED | REJECTED | AWAITING_ARRIVAL | ARRIVED | ACCOUNT_CREATED",
        "rejectionReason": "string | null",
        "cvUrl": "string | null",
        "transcriptUrl": "string | null",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 20,
      "totalPages": 2
    }
  }
}
```

---

### 6.2 Get Student by ID

**GET** `/students/:id`

**Access:** ADMIN, UNIVERSITY (own student only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Student ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "studentId": "string",
    "fieldOfStudy": "string",
    "academicYear": "string",
    "email": "string",
    "phone": "string",
    "status": "string",
    "rejectionReason": "string | null",
    "cvUrl": "string | null",
    "transcriptUrl": "string | null",
    "application": {
      "id": "uuid",
      "academicYear": "string",
      "university": {
        "id": "uuid",
        "name": "string"
      }
    },
    "intern": {
      "id": "uuid",
      "internId": "string"
    },
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 6.3 Add Student to Application

**POST** `/applications/:appId/students`

**Access:** UNIVERSITY (own application only, status must be PENDING or REJECTED)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| appId | uuid | Application ID |

**Request Body:**
```json
{
  "firstName": "string (required, max 100)",
  "lastName": "string (required, max 100)",
  "studentId": "string (required, unique across system)",
  "fieldOfStudy": "string (required, max 200)",
  "academicYear": "string (required, e.g., '3rd Year')",
  "email": "string (optional, valid email)",
  "phone": "string (optional, max 20)",
  "cvUrl": "string (optional, valid URL)",
  "transcriptUrl": "string (optional, valid URL)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Student added successfully",
  "data": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "studentId": "string",
    "fieldOfStudy": "string",
    "academicYear": "string",
    "status": "PENDING_REVIEW",
    "createdAt": "ISO 8601 datetime"
  }
}
```

---

### 6.4 Update Student

**PATCH** `/applications/:appId/students/:id`

**Access:** UNIVERSITY (own application only, status must be PENDING or REJECTED)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| appId | uuid | Application ID |
| id | uuid | Student ID |

**Request Body:**
```json
{
  "firstName": "string (optional, max 100)",
  "lastName": "string (optional, max 100)",
  "fieldOfStudy": "string (optional, max 200)",
  "academicYear": "string (optional)",
  "email": "string (optional, valid email)",
  "phone": "string (optional, max 20)",
  "cvUrl": "string (optional, valid URL)",
  "transcriptUrl": "string (optional, valid URL)"
}
```

**Note:** `studentId` cannot be changed after creation.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "studentId": "string",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 6.5 Remove Student from Application

**DELETE** `/applications/:appId/students/:id`

**Access:** UNIVERSITY (own application only, status must be PENDING)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| appId | uuid | Application ID |
| id | uuid | Student ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student removed successfully",
  "data": null
}
```

---

### 6.6 Review Student (Accept/Reject)

**POST** `/students/:id/review`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Student ID |

**Request Body:**
```json
{
  "decision": "string (required): ACCEPTED | REJECTED",
  "rejectionReason": "string (required if decision is REJECTED, max 500)"
}
```

**Note:** 
- If ACCEPTED, status changes to AWAITING_ARRIVAL
- If REJECTED, university can update and resubmit the student

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student review completed",
  "data": {
    "id": "uuid",
    "status": "ACCEPTED | REJECTED",
    "rejectionReason": "string | null",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 6.7 Mark Student as Arrived

**POST** `/students/:id/mark-arrived`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Student ID |

**Note:** Student must be in AWAITING_ARRIVAL status.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student marked as arrived",
  "data": {
    "id": "uuid",
    "status": "ARRIVED",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 6.8 List All Students (Admin)

**GET** `/students`

**Access:** ADMIN

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status |
| universityId | uuid | No | Filter by university |
| search | string | No | Search by name or studentId |
| hasInternAccount | boolean | No | Filter by whether intern account exists |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "studentId": "string",
        "fieldOfStudy": "string",
        "status": "string",
        "university": {
          "id": "uuid",
          "name": "string"
        },
        "hasInternAccount": "boolean",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 100,
      "totalPages": 10
    }
  }
}
```

---

## 7. Interns

### 7.1 List Interns

**GET** `/interns`

**Access:** ADMIN, SUPERVISOR (own department only)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| status | string | No | Filter by status: ACTIVE, COMPLETED, TERMINATED |
| departmentId | uuid | No | Filter by department |
| supervisorId | uuid | No | Filter by supervisor |
| search | string | No | Search by name or internId |
| startDateFrom | date | No | Filter by start date (from) |
| startDateTo | date | No | Filter by start date (to) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Interns retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "internId": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "status": "ACTIVE | COMPLETED | TERMINATED",
        "startDate": "ISO 8601 date",
        "endDate": "ISO 8601 date",
        "department": {
          "id": "uuid",
          "name": "string",
          "type": "string"
        },
        "supervisor": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string"
        },
        "university": {
          "id": "uuid",
          "name": "string"
        },
        "submissionCount": "number",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 50,
      "totalPages": 5
    }
  }
}
```

---

### 7.2 Get Intern by ID

**GET** `/interns/:id`

**Access:** ADMIN, SUPERVISOR (own department), INTERN (own profile)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Intern ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Intern retrieved successfully",
  "data": {
    "id": "uuid",
    "internId": "string",
    "status": "ACTIVE | COMPLETED | TERMINATED",
    "startDate": "ISO 8601 date",
    "endDate": "ISO 8601 date",
    "skills": ["string"],
    "interviewNotes": "string | null",
    "finalEvaluation": "number | null",
    "certificateUrl": "string | null",
    "certificateIssued": "boolean",
    "student": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "studentId": "string",
      "fieldOfStudy": "string",
      "email": "string",
      "phone": "string"
    },
    "user": {
      "id": "uuid",
      "email": "string",
      "isActive": "boolean"
    },
    "department": {
      "id": "uuid",
      "name": "string",
      "type": "string"
    },
    "supervisor": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "submissions": [
      {
        "id": "uuid",
        "title": "string",
        "type": "string",
        "status": "string",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 7.3 Get Own Profile (Intern)

**GET** `/interns/me`

**Access:** INTERN

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "internId": "string",
    "status": "string",
    "startDate": "ISO 8601 date",
    "endDate": "ISO 8601 date",
    "skills": ["string"],
    "finalEvaluation": "number | null",
    "certificateUrl": "string | null",
    "certificateIssued": "boolean",
    "student": {
      "firstName": "string",
      "lastName": "string",
      "studentId": "string",
      "fieldOfStudy": "string",
      "email": "string",
      "phone": "string"
    },
    "department": {
      "id": "uuid",
      "name": "string",
      "type": "string"
    },
    "supervisor": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "recentSubmissions": [
      {
        "id": "uuid",
        "title": "string",
        "type": "string",
        "status": "string",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "daysRemaining": "number",
    "completionPercentage": "number"
  }
}
```

---

### 7.4 Create Intern (from Student)

**POST** `/interns`

**Access:** ADMIN

**Request Body:**
```json
{
  "studentId": "uuid (required, student must be in ARRIVED status)",
  "departmentId": "uuid (required)",
  "supervisorId": "uuid (optional)",
  "startDate": "date (required, format: YYYY-MM-DD)",
  "endDate": "date (required, format: YYYY-MM-DD, must be after startDate)",
  "skills": ["string (optional)"],
  "interviewNotes": "string (optional, max 2000)"
}
```

**Note:** 
- Creates intern record and user account
- Student must be in ARRIVED status
- Generates unique internId (INSA-YYYY-NNN format)
- Sends email with temporary password to student's email

**Success Response (201):**
```json
{
  "success": true,
  "message": "Intern account created successfully. Credentials sent to student email.",
  "data": {
    "id": "uuid",
    "internId": "string",
    "status": "ACTIVE",
    "startDate": "ISO 8601 date",
    "endDate": "ISO 8601 date",
    "student": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "user": {
      "id": "uuid",
      "email": "string"
    },
    "department": {
      "id": "uuid",
      "name": "string"
    },
    "createdAt": "ISO 8601 datetime"
  }
}
```

---

### 7.5 Update Intern

**PATCH** `/interns/:id`

**Access:** ADMIN, INTERN (limited fields for own profile)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Intern ID |

**Request Body (ADMIN):**
```json
{
  "departmentId": "uuid (optional)",
  "supervisorId": "uuid (optional)",
  "startDate": "date (optional)",
  "endDate": "date (optional)",
  "skills": ["string (optional)"],
  "interviewNotes": "string (optional, max 2000)",
  "finalEvaluation": "number (optional, 0.00 - 4.00)"
}
```

**Request Body (INTERN - own profile only):**
```json
{
  "skills": ["string (optional)"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Intern updated successfully",
  "data": {
    "id": "uuid",
    "internId": "string",
    "skills": ["string"],
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 7.6 Assign Supervisor

**POST** `/interns/:id/assign-supervisor`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Intern ID |

**Request Body:**
```json
{
  "supervisorId": "uuid (required, must be SUPERVISOR role in same department)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Supervisor assigned successfully",
  "data": {
    "id": "uuid",
    "internId": "string",
    "supervisor": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 7.7 Complete Internship

**POST** `/interns/:id/complete`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Intern ID |

**Request Body:**
```json
{
  "finalEvaluation": "number (required, 0.00 - 4.00)",
  "completionNotes": "string (optional, max 1000)"
}
```

**Note:** Changes status to COMPLETED.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Internship marked as completed",
  "data": {
    "id": "uuid",
    "internId": "string",
    "status": "COMPLETED",
    "finalEvaluation": "number",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 7.8 Terminate Internship

**POST** `/interns/:id/terminate`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Intern ID |

**Request Body:**
```json
{
  "reason": "string (required, max 1000)"
}
```

**Note:** Changes status to TERMINATED. Also deactivates user account.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Internship terminated",
  "data": {
    "id": "uuid",
    "internId": "string",
    "status": "TERMINATED",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 7.9 Issue Certificate

**POST** `/interns/:id/issue-certificate`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Intern ID |

**Request Body:**
```json
{
  "certificateUrl": "string (required, valid URL - uploaded via /documents/upload)"
}
```

**Note:** Intern must be in COMPLETED status.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "data": {
    "id": "uuid",
    "internId": "string",
    "certificateUrl": "string",
    "certificateIssued": true,
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 7.10 Suspend Internship

**POST** `/interns/:id/suspend`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Intern ID |

**Request Body:**
```json
{
  "reason": "string (required, max 1000)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Intern suspended",
  "data": {
    "id": "uuid",
    "status": "SUSPENDED"
  }
}
```

---

### 7.11 Unsuspend Internship

**POST** `/interns/:id/unsuspend`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Intern ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Intern unsuspended",
  "data": {
    "id": "uuid",
    "status": "ACTIVE"
  }
}
```

---

## 8. Submissions

### 8.1 List Submissions

**GET** `/submissions`

**Access:** ADMIN, SUPERVISOR (own department interns only)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| status | string | No | Filter by status: PENDING, APPROVED, REJECTED, NEEDS_REVISION |
| type | string | No | Filter by type: WEEKLY_REPORT, PROJECT_FILE, CODE, TASK, DOCUMENT |
| internId | uuid | No | Filter by intern |
| startDate | date | No | Filter by created date (from) |
| endDate | date | No | Filter by created date (to) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Submissions retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "description": "string",
        "type": "WEEKLY_REPORT | PROJECT_FILE | CODE | TASK | DOCUMENT",
        "status": "PENDING | APPROVED | REJECTED | NEEDS_REVISION",
        "fileUrl": "string | null",
        "weekNumber": "number | null",
        "intern": {
          "id": "uuid",
          "internId": "string",
          "firstName": "string",
          "lastName": "string"
        },
        "supervisorFeedback": "string | null",
        "reviewedAt": "ISO 8601 datetime | null",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 100,
      "totalPages": 10
    }
  }
}
```

---

### 8.2 Get Submission by ID

**GET** `/submissions/:id`

**Access:** ADMIN, SUPERVISOR (own department), INTERN (own submission)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Submission ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Submission retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "type": "string",
    "status": "string",
    "fileUrl": "string | null",
    "weekNumber": "number | null",
    "supervisorFeedback": "string | null",
    "reviewedAt": "ISO 8601 datetime | null",
    "intern": {
      "id": "uuid",
      "internId": "string",
      "firstName": "string",
      "lastName": "string",
      "department": {
        "id": "uuid",
        "name": "string"
      }
    },
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 8.3 Create Submission

**POST** `/submissions`

**Access:** INTERN, ADMIN

**Request Body:**
```json
{
  "title": "string (required, max 200)",
  "description": "string (optional, max 2000)",
  "type": "string (required): WEEKLY_REPORT | PROJECT_FILE | CODE | TASK | DOCUMENT",
  "fileUrl": "string (required for PROJECT_FILE, CODE, DOCUMENT types)",
  "weekNumber": "number (required for WEEKLY_REPORT type, 1-52)"
}
```

**Validation Rules:**
- `fileUrl` required for: PROJECT_FILE, CODE, DOCUMENT
- `weekNumber` required for: WEEKLY_REPORT (must be valid week number)
- Intern must be in ACTIVE status

**Success Response (201):**
```json
{
  "success": true,
  "message": "Submission created successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "type": "string",
    "status": "PENDING",
    "fileUrl": "string | null",
    "weekNumber": "number | null",
    "createdAt": "ISO 8601 datetime"
  }
}
```

---

### 8.4 Update Submission

**PATCH** `/submissions/:id`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Submission ID |

**Request Body:**
```json
{
  "title": "string (optional, max 200)",
  "description": "string (optional, max 2000)",
  "fileUrl": "string (optional)"
}
```

**Note:** `type` and `weekNumber` cannot be changed after creation.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Submission updated successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "fileUrl": "string",
    "status": "PENDING",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 8.5 Review Submission

**POST** `/submissions/:id/review`

**Access:** SUPERVISOR (own department interns only)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Submission ID |

**Request Body:**
```json
{
  "decision": "string (required): APPROVED | REJECTED | NEEDS_REVISION",
  "feedback": "string (required, max 1000)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Submission reviewed successfully",
  "data": {
    "id": "uuid",
    "status": "APPROVED | REJECTED | NEEDS_REVISION",
    "supervisorFeedback": "string",
    "reviewedAt": "ISO 8601 datetime"
  }
}
```

---

### 8.6 List Intern's Submissions

**GET** `/interns/:internId/submissions`

**Access:** ADMIN, SUPERVISOR (own department), INTERN (own submissions)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| internId | uuid | Intern ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status |
| type | string | No | Filter by type |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Intern submissions retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "type": "string",
        "status": "string",
        "weekNumber": "number | null",
        "supervisorFeedback": "string | null",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 15,
      "totalPages": 2
    }
  }
}
```

---

### 8.7 Get My Submissions (Intern)

**GET** `/submissions/my`

**Access:** INTERN

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| status | string | No | Filter by status |
| type | string | No | Filter by type |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Submissions retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "type": "string",
        "status": "string",
        "fileUrl": "string | null",
        "weekNumber": "number | null",
        "supervisorFeedback": "string | null",
        "reviewedAt": "ISO 8601 datetime | null",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 8,
      "totalPages": 1
    }
  }
}
```

---

## 9. Documents

### 9.1 Upload Document

**POST** `/documents/upload`

**Access:** All authenticated users

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | The file to upload |
| type | string | Yes | OFFICIAL_LETTER, CV, TRANSCRIPT, CERTIFICATE, OTHER |
| entityId | uuid | No | Related entity ID (application, student, intern) |
| entityType | string | No | Related entity type: APPLICATION, STUDENT, INTERN |

**Validation Rules:**
- Max file size: 10MB
- Allowed types:
  - Documents: `.pdf`, `.doc`, `.docx`
  - Code: `.zip`, `.tar.gz`
  - Images: `.jpg`, `.jpeg`, `.png` (profile photos only)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "uuid",
    "fileName": "string",
    "fileUrl": "string",
    "type": "string",
    "uploadedBy": "uuid",
    "entityId": "uuid | null",
    "entityType": "string | null",
    "uploadedAt": "ISO 8601 datetime"
  }
}
```

---

### 9.2 Get Document

**GET** `/documents/:id`

**Access:** All authenticated users (with appropriate permissions)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Document ID |

**Success Response (200):**
Returns the file as binary with appropriate Content-Type header.

**Headers:**
```
Content-Type: application/pdf (or appropriate mime type)
Content-Disposition: attachment; filename="filename.pdf"
```

---

### 9.3 Get Document Info

**GET** `/documents/:id/info`

**Access:** All authenticated users (with appropriate permissions)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Document ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Document info retrieved successfully",
  "data": {
    "id": "uuid",
    "fileName": "string",
    "fileUrl": "string",
    "type": "string",
    "uploadedBy": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string"
    },
    "entityId": "uuid | null",
    "entityType": "string | null",
    "uploadedAt": "ISO 8601 datetime"
  }
}
```

---

### 9.4 Delete Document

**DELETE** `/documents/:id`

**Access:** ADMIN

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Document ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": null
}
```

---


### 9.5 List Documents

**GET** `/documents`

**Access:** ADMIN

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| type | string | No | Filter by document type |
| entityType | string | No | Filter by entity type |
| entityId | uuid | No | Filter by entity ID |
| uploadedBy | uuid | No | Filter by uploader |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "fileName": "string",
        "fileUrl": "string",
        "type": "string",
        "uploadedBy": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string"
        },
        "entityId": "uuid | null",
        "entityType": "string | null",
        "uploadedAt": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 50,
      "totalPages": 5
    }
  }
}
```

---

## 10. Dashboard

### 10.1 Admin Dashboard

**GET** `/dashboard/admin`

**Access:** ADMIN

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "overview": {
      "totalUniversities": "number",
      "activeUniversities": "number",
      "totalApplications": "number",
      "pendingApplications": "number",
      "totalStudents": "number",
      "awaitingArrival": "number",
      "totalInterns": "number",
      "activeInterns": "number",
      "completedInterns": "number",
      "totalSupervisors": "number"
    },
    "applicationsByStatus": {
      "PENDING": "number",
      "UNDER_REVIEW": "number",
      "APPROVED": "number",
      "REJECTED": "number"
    },
    "internsByDepartment": [
      {
        "departmentId": "uuid",
        "departmentName": "string",
        "departmentType": "string",
        "activeCount": "number",
        "completedCount": "number"
      }
    ],
    "internsByStatus": {
      "ACTIVE": "number",
      "COMPLETED": "number",
      "TERMINATED": "number"
    },
    "recentApplications": [
      {
        "id": "uuid",
        "universityName": "string",
        "academicYear": "string",
        "status": "string",
        "studentCount": "number",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "recentInterns": [
      {
        "id": "uuid",
        "internId": "string",
        "firstName": "string",
        "lastName": "string",
        "departmentName": "string",
        "startDate": "ISO 8601 date",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "monthlyStats": {
      "applicationsThisMonth": "number",
      "internsStartedThisMonth": "number",
      "internsCompletedThisMonth": "number"
    }
  }
}
```

---

### 10.2 University Dashboard

**GET** `/dashboard/university`

**Access:** UNIVERSITY

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "university": {
      "id": "uuid",
      "name": "string"
    },
    "overview": {
      "totalApplications": "number",
      "pendingApplications": "number",
      "approvedApplications": "number",
      "rejectedApplications": "number",
      "totalStudentsSubmitted": "number",
      "acceptedStudents": "number",
      "rejectedStudents": "number",
      "activeInterns": "number",
      "completedInterns": "number"
    },
    "applicationsByStatus": {
      "PENDING": "number",
      "UNDER_REVIEW": "number",
      "APPROVED": "number",
      "REJECTED": "number"
    },
    "studentsByStatus": {
      "PENDING_REVIEW": "number",
      "ACCEPTED": "number",
      "REJECTED": "number",
      "AWAITING_ARRIVAL": "number",
      "ARRIVED": "number",
      "ACCOUNT_CREATED": "number"
    },
    "recentApplications": [
      {
        "id": "uuid",
        "academicYear": "string",
        "status": "string",
        "studentCount": "number",
        "acceptedCount": "number",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "currentInterns": [
      {
        "id": "uuid",
        "internId": "string",
        "firstName": "string",
        "lastName": "string",
        "departmentName": "string",
        "status": "string",
        "startDate": "ISO 8601 date",
        "endDate": "ISO 8601 date"
      }
    ]
  }
}
```

---

### 10.3 Supervisor Dashboard

**GET** `/dashboard/supervisor`

**Access:** SUPERVISOR

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "supervisor": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string"
    },
    "department": {
      "id": "uuid",
      "name": "string",
      "type": "string"
    },
    "overview": {
      "totalSupervisedInterns": "number",
      "activeInterns": "number",
      "completedInterns": "number",
      "pendingSubmissions": "number",
      "totalSubmissionsReviewed": "number"
    },
    "internsByStatus": {
      "ACTIVE": "number",
      "COMPLETED": "number",
      "TERMINATED": "number"
    },
    "submissionsByStatus": {
      "PENDING": "number",
      "APPROVED": "number",
      "REJECTED": "number",
      "NEEDS_REVISION": "number"
    },
    "supervisedInterns": [
      {
        "id": "uuid",
        "internId": "string",
        "firstName": "string",
        "lastName": "string",
        "status": "string",
        "startDate": "ISO 8601 date",
        "endDate": "ISO 8601 date",
        "pendingSubmissions": "number",
        "daysRemaining": "number"
      }
    ],
    "pendingSubmissions": [
      {
        "id": "uuid",
        "title": "string",
        "type": "string",
        "internName": "string",
        "internId": "string",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "recentActivity": [
      {
        "type": "SUBMISSION_CREATED | SUBMISSION_REVIEWED | INTERN_COMPLETED",
        "description": "string",
        "timestamp": "ISO 8601 datetime"
      }
    ]
  }
}
```

---

### 10.4 Intern Dashboard

**GET** `/dashboard/intern`

**Access:** INTERN

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "intern": {
      "id": "uuid",
      "internId": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "internship": {
      "status": "ACTIVE | COMPLETED | TERMINATED",
      "startDate": "ISO 8601 date",
      "endDate": "ISO 8601 date",
      "daysRemaining": "number",
      "daysCompleted": "number",
      "totalDays": "number",
      "completionPercentage": "number"
    },
    "department": {
      "id": "uuid",
      "name": "string",
      "type": "string"
    },
    "supervisor": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "submissions": {
      "total": "number",
      "pending": "number",
      "approved": "number",
      "rejected": "number",
      "needsRevision": "number"
    },
    "submissionsByType": {
      "WEEKLY_REPORT": "number",
      "PROJECT_FILE": "number",
      "CODE": "number",
      "TASK": "number",
      "DOCUMENT": "number"
    },
    "recentSubmissions": [
      {
        "id": "uuid",
        "title": "string",
        "type": "string",
        "status": "string",
        "supervisorFeedback": "string | null",
        "createdAt": "ISO 8601 datetime"
      }
    ],
    "weeklyReportStatus": {
      "currentWeek": "number",
      "submittedWeeks": ["number"],
      "missingWeeks": ["number"]
    },
    "certificate": {
      "issued": "boolean",
      "url": "string | null"
    }
  }
}
```

---

## 11. Common Response Formats

### 11.1 Success Response

```json
{
  "success": true,
  "message": "string",
  "data": "object | array | null"
}
```

### 11.2 Error Response

```json
{
  "success": false,
  "message": "string",
  "error": {
    "code": "string",
    "details": "object | array | null"
  }
}
```

### 11.3 Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "string",
        "message": "string"
      }
    ]
  }
}
```

### 11.4 Paginated Response

```json
{
  "success": true,
  "message": "string",
  "data": {
    "items": [],
    "pagination": {
      "page": "number",
      "limit": "number",
      "totalItems": "number",
      "totalPages": "number"
    }
  }
}
```

---

## 12. Error Codes

### 12.1 Authentication Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_INVALID_CREDENTIALS | 401 | Invalid email or password |
| AUTH_TOKEN_EXPIRED | 401 | JWT token has expired |
| AUTH_TOKEN_INVALID | 401 | JWT token is malformed or invalid |
| AUTH_UNAUTHORIZED | 401 | User is not authenticated |
| AUTH_FORBIDDEN | 403 | User lacks required permissions |
| AUTH_INVALID_PASSWORD | 400 | Current password is incorrect |
| AUTH_PASSWORD_MISMATCH | 400 | New password and confirm password don't match |
| AUTH_ACCOUNT_INACTIVE | 403 | User account is deactivated |

### 12.2 Validation Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request body validation failed |
| INVALID_UUID | 400 | Invalid UUID format |
| INVALID_EMAIL | 400 | Invalid email format |
| INVALID_DATE | 400 | Invalid date format |
| INVALID_ENUM | 400 | Invalid enum value |

### 12.3 Resource Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| USER_NOT_FOUND | 404 | User with given ID not found |
| UNIVERSITY_NOT_FOUND | 404 | University not found |
| DEPARTMENT_NOT_FOUND | 404 | Department not found |
| APPLICATION_NOT_FOUND | 404 | Application not found |
| STUDENT_NOT_FOUND | 404 | Student not found |
| INTERN_NOT_FOUND | 404 | Intern not found |
| SUBMISSION_NOT_FOUND | 404 | Submission not found |
| DOCUMENT_NOT_FOUND | 404 | Document not found |

### 12.4 Business Logic Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| EMAIL_ALREADY_EXISTS | 409 | Email is already registered |
| UNIVERSITY_NAME_EXISTS | 409 | University name already exists |
| STUDENT_ID_EXISTS | 409 | Student ID already exists |
| APPLICATION_NOT_EDITABLE | 400 | Application cannot be edited in current status |
| APPLICATION_NOT_SUBMITTABLE | 400 | Application cannot be submitted |
| STUDENT_NOT_REVIEWABLE | 400 | Student cannot be reviewed in current status |
| STUDENT_NOT_ARRIVED | 400 | Student must be in ARRIVED status |
| INTERN_NOT_ACTIVE | 400 | Intern is not in ACTIVE status |
| INTERN_ALREADY_COMPLETED | 400 | Intern has already completed |
| SUBMISSION_NOT_EDITABLE | 400 | Submission cannot be edited in current status |
| SUPERVISOR_WRONG_DEPARTMENT | 400 | Supervisor must be in the same department |
| CERTIFICATE_ALREADY_ISSUED | 400 | Certificate has already been issued |
| INTERN_NOT_COMPLETED | 400 | Intern must be in COMPLETED status |

### 12.5 File Upload Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| FILE_TOO_LARGE | 413 | File exceeds maximum size (10MB) |
| FILE_TYPE_NOT_ALLOWED | 400 | File type is not allowed |
| FILE_UPLOAD_FAILED | 500 | File upload failed |

### 12.6 Server Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |
| DATABASE_ERROR | 500 | Database operation failed |
| EMAIL_SEND_FAILED | 500 | Failed to send email |

---

## 13. Database Schema

### 13.1 Entity Relationship Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   University    │     │    Application   │     │     Student     │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ id (PK)         │──┐  │ id (PK)          │──┐  │ id (PK)         │
│ name            │  │  │ university_id(FK)│◄─┘  │ application_id  │◄──┐
│ address         │  │  │ academic_year    │     │ first_name      │   │
│ contact_email   │  │  │ status           │     │ last_name       │   │
│ contact_phone   │  │  │ official_letter  │     │ student_id      │   │
│ is_active       │  │  │ rejection_reason │     │ field_of_study  │   │
│ created_at      │  └─►│ reviewed_by      │     │ academic_year   │   │
│ updated_at      │     │ reviewed_at      │     │ email           │   │
└─────────────────┘     │ created_at       │     │ phone           │   │
                        │ updated_at       │     │ status          │   │
                        └──────────────────┘     │ rejection_reason│   │
                                                 │ cv_url          │   │
┌─────────────────┐     ┌──────────────────┐     │ transcript_url  │   │
│   Department    │     │      User        │     │ created_at      │   │
├─────────────────┤     ├──────────────────┤     │ updated_at      │   │
│ id (PK)         │──┐  │ id (PK)          │     └─────────────────┘   │
│ name            │  │  │ email            │              │            │
│ type            │  │  │ password         │              │            │
│ description     │  │  │ first_name       │              ▼            │
│ created_at      │  │  │ last_name        │     ┌─────────────────┐   │
│ updated_at      │  │  │ role             │     │     Intern      │   │
└─────────────────┘  │  │ is_first_login   │     ├─────────────────┤   │
         │           │  │ is_active        │  ┌──│ id (PK)         │   │
         │           │  │ token            │  │  │ intern_id       │   │
         │           └─►│ department_id(FK)│◄─┤  │ student_id (FK) │◄──┘
         │              │ university_id(FK)│  │  │ user_id (FK)    │
         │              │ created_at       │  │  │ department_id   │◄──┐
         │              │ updated_at       │  │  │ supervisor_id   │◄──┤
         │              └──────────────────┘  │  │ status          │   │
         │                       │            │  │ start_date      │   │
         │                       │            │  │ end_date        │   │
         │                       │            │  │ skills          │   │
         └───────────────────────┼────────────┘  │ interview_notes │   │
                                 │               │ final_evaluation│   │
                                 │               │ certificate_url │   │
                                 │               │ certificate_iss │   │
                                 │               │ created_at      │   │
                                 │               │ updated_at      │   │
                                 │               └─────────────────┘   │
                                 │                        │            │
                                 │                        ▼            │
                                 │               ┌─────────────────┐   │
                                 │               │   Submission    │   │
                                 │               ├─────────────────┤   │
                                 │               │ id (PK)         │   │
                                 │               │ intern_id (FK)  │◄──┤
                                 │               │ title           │   │
                                 │               │ description     │   │
                                 │               │ type            │   │
                                 │               │ status          │   │
                                 │               │ file_url        │   │
                                 │               │ week_number     │   │
                                 │               │ supervisor_fdbk │   │
                                 │               │ reviewed_at     │   │
                                 │               │ created_at      │   │
                                 │               │ updated_at      │   │
                                 │               └─────────────────┘   │
                                 │                                     │
                                 │               ┌─────────────────┐   │
                                 │               │    Document     │   │
                                 │               ├─────────────────┤   │
                                 └──────────────►│ id (PK)         │   │
                                                 │ file_name       │   │
                                                 │ file_url        │   │
                                                 │ type            │   │
                                                 │ uploaded_by(FK) │   │
                                                 │ entity_id       │   │
                                                 │ entity_type     │   │
                                                 │ created_at      │   │
                                                 └─────────────────┘   │
                                                                       │
                                                 (supervisor_id refs   │
                                                  User with SUPERVISOR │
                                                  role in same dept)───┘
```

### 13.2 Table Definitions

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'UNIVERSITY', 'SUPERVISOR', 'INTERN')),
    is_first_login BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    token VARCHAR(255),
    department_id UUID REFERENCES departments(id),
    university_id UUID REFERENCES universities(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Universities Table
```sql
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) UNIQUE NOT NULL,
    address VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Departments Table
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('NETWORKING', 'CYBERSECURITY', 'SOFTWARE_DEVELOPMENT')),
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Applications Table
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id),
    academic_year VARCHAR(9) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    official_letter_url VARCHAR(500) NOT NULL,
    rejection_reason VARCHAR(500),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Students Table
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    field_of_study VARCHAR(200) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'ACCEPTED', 'REJECTED', 'AWAITING_ARRIVAL', 'ARRIVED', 'ACCOUNT_CREATED')),
    rejection_reason VARCHAR(500),
    cv_url VARCHAR(500),
    transcript_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Interns Table
```sql
CREATE TABLE interns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id VARCHAR(20) UNIQUE NOT NULL,
    student_id UUID UNIQUE NOT NULL REFERENCES students(id),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    department_id UUID NOT NULL REFERENCES departments(id),
    supervisor_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'TERMINATED')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    skills TEXT[],
    interview_notes TEXT,
    final_evaluation DECIMAL(3,2) CHECK (final_evaluation >= 0 AND final_evaluation <= 4),
    certificate_url VARCHAR(500),
    certificate_issued BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Submissions Table
```sql
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES interns(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('WEEKLY_REPORT', 'PROJECT_FILE', 'CODE', 'TASK', 'DOCUMENT')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION')),
    file_url VARCHAR(500),
    week_number INTEGER CHECK (week_number >= 1 AND week_number <= 52),
    supervisor_feedback TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Documents Table
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('OFFICIAL_LETTER', 'CV', 'TRANSCRIPT', 'CERTIFICATE', 'OTHER')),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    entity_id UUID,
    entity_type VARCHAR(20) CHECK (entity_type IN ('APPLICATION', 'STUDENT', 'INTERN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 14. Enumerations

### 14.1 User Roles
```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  UNIVERSITY = 'UNIVERSITY',
  SUPERVISOR = 'SUPERVISOR',
  INTERN = 'INTERN'
}
```

### 14.2 Department Types
```typescript
enum DepartmentType {
  NETWORKING = 'NETWORKING',
  CYBERSECURITY = 'CYBERSECURITY',
  SOFTWARE_DEVELOPMENT = 'SOFTWARE_DEVELOPMENT'
}
```

### 14.3 Application Status
```typescript
enum ApplicationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
```

### 14.4 Student Status
```typescript
enum StudentStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  AWAITING_ARRIVAL = 'AWAITING_ARRIVAL',
  ARRIVED = 'ARRIVED',
  ACCOUNT_CREATED = 'ACCOUNT_CREATED'
}
```

### 14.5 Intern Status
```typescript
enum InternStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED'
}
```

### 14.6 Submission Type
```typescript
enum SubmissionType {
  WEEKLY_REPORT = 'WEEKLY_REPORT',
  PROJECT_FILE = 'PROJECT_FILE',
  CODE = 'CODE',
  TASK = 'TASK',
  DOCUMENT = 'DOCUMENT'
}
```

### 14.7 Submission Status
```typescript
enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION'
}
```

### 14.8 Document Type
```typescript
enum DocumentType {
  OFFICIAL_LETTER = 'OFFICIAL_LETTER',
  CV = 'CV',
  TRANSCRIPT = 'TRANSCRIPT',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER'
}
```

### 14.9 Entity Type (for Documents)
```typescript
enum EntityType {
  APPLICATION = 'APPLICATION',
  STUDENT = 'STUDENT',
  INTERN = 'INTERN'
}
```

---

## 15. Intern ID Generation

### Format
```
INSA-YYYY-NNN
```

Where:
- `INSA` - Organization prefix
- `YYYY` - Year of internship start
- `NNN` - Sequential number (001-999, resets each year)

### Examples
- `INSA-2024-001` - First intern of 2024
- `INSA-2024-042` - 42nd intern of 2024
- `INSA-2025-001` - First intern of 2025

### Generation Logic
```typescript
// Get the max intern number for current year
const currentYear = new Date().getFullYear();
const maxIntern = await internRepository
  .createQueryBuilder('intern')
  .where('intern.intern_id LIKE :pattern', { pattern: `INSA-${currentYear}-%` })
  .orderBy('intern.intern_id', 'DESC')
  .getOne();

let nextNumber = 1;
if (maxIntern) {
  const lastNumber = parseInt(maxIntern.internId.split('-')[2]);
  nextNumber = lastNumber + 1;
}

const internId = `INSA-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
```

---

## 16. File Upload Configuration

### Allowed File Types

| Category | Extensions | MIME Types |
|----------|------------|------------|
| Documents | .pdf, .doc, .docx | application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Code Archives | .zip, .tar.gz | application/zip, application/gzip |
| Images | .jpg, .jpeg, .png | image/jpeg, image/png |

### Size Limits
- Maximum file size: 10MB (10,485,760 bytes)

### Storage Path Structure
```
uploads/
├── official-letters/
│   └── {year}/
│       └── {uuid}.pdf
├── cvs/
│   └── {year}/
│       └── {uuid}.pdf
├── transcripts/
│   └── {year}/
│       └── {uuid}.pdf
├── submissions/
│   └── {year}/
│       └── {month}/
│           └── {uuid}.{ext}
└── certificates/
    └── {year}/
        └── {uuid}.pdf
```

---

## 17. Environment Variables

```env
# Application
PORT=3000
APP_ENV=dev|staging|production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=insa_intern_mgmt

# JWT
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=1d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Mail
MAIL_FROM=no-reply@insa.gov.et
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_AUTH_USER=
MAIL_AUTH_PASS=

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=debug|info|warn|error
```

---

## 18. Default Admin Seed

On first deployment, create default admin user:

```json
{
  "email": "admin@insa.gov.et",
  "password": "Admin@123",
  "firstName": "System",
  "lastName": "Administrator",
  "role": "ADMIN",
  "isActive": true,
  "isFirstLogin": true
}
```

**Note:** Admin must change password on first login.

---
