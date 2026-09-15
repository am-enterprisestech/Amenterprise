# Aymoxi

COMPLETE PROJECT CLONE + FULL BACKEND IMPLEMENTATION

I want you to completely clone the provided project and rebuild it as a fully functional, production-ready application.

This is NOT a simple UI recreation, mockup, prototype, frontend-only clone, or simplified version.

I want the entire project recreated from A to Z, including the complete frontend, complete backend, database, APIs, authentication, authorization, business logic, integrations, validations, error handling, configuration, and all other required functionality.

The existing project should be treated as the single source of truth.

PHASE 1 — COMPLETE PROJECT AUDIT

Before implementing anything, first thoroughly inspect and understand the entire existing project.

Audit everything, including:

All pages

All routes

All sections

All components

All files

All folders

All assets

All forms

All buttons

All interactions

All states

All API calls

All data flows

All authentication flows

All user flows

All database-related functionality

All integrations

All dependencies

All configuration

All environment variables

All responsive behavior

All animations

All loading states

All error states

All empty states

Do not start by implementing only the visible UI.

First understand how the complete application works from frontend to backend.

PHASE 2 — COMPLETE FRONTEND CLONE

Recreate the frontend as accurately as technically possible.

Clone:

Every page

Every route

Every section

Every component

Every layout

Every navigation item

Every button

Every form

Every modal

Every dropdown

Every card

Every table

Every tab

Every filter

Every search

Every pagination control

Every notification

Every loading state

Every error state

Every empty state

Every animation

Every interaction

Do not create a simplified version.

Do not remove sections because they appear unimportant.

Do not replace functionality with placeholders.

Do not create fake buttons that do nothing.

Everything that exists in the original application should exist in the clone.

PHASE 3 — COMPLETE BACKEND

This is extremely important.

Build a complete backend using FastAPI.

The backend must NOT be mixed randomly throughout the frontend project.

Create a dedicated backend folder:

/backend


All backend-related functionality must live inside this backend folder.

The frontend should communicate with the backend through proper API endpoints.

Do not put backend business logic inside frontend components.

Do not hardcode backend behavior into the frontend.

The architecture should clearly separate:

Frontend
    ↓
API Requests
    ↓
FastAPI Backend
    ↓
Services / Business Logic
    ↓
Database / External Services


BACKEND FOLDER STRUCTURE

Create a proper scalable FastAPI backend structure.

For example:

backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   │
│   ├── api/
│   │   ├── router.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── users.py
│   │       └── ...
│   │
│   ├── models/
│   │   ├── user.py
│   │   └── ...
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   └── ...
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   └── ...
│   │
│   ├── repositories/
│   │   └── ...
│   │
│   ├── middleware/
│   │   └── ...
│   │
│   ├── dependencies/
│   │   └── ...
│   │
│   └── utils/
│       └── ...
│
├── tests/
├── alembic/
├── requirements.txt
├── .env.example
└── README.md


Adapt the structure according to the actual requirements of the project.

Do not blindly create unnecessary files. However, every backend concern that the application actually needs must have a proper implementation and location.

COMPLETE API IMPLEMENTATION

Identify every API/data operation required by the frontend and implement the corresponding FastAPI endpoints.

This includes, where applicable:

GET endpoints

POST endpoints

PUT endpoints

PATCH endpoints

DELETE endpoints

Search endpoints

Filtering

Sorting

Pagination

CRUD operations

User operations

Authentication endpoints

Authorization checks

File uploads

File downloads

Notifications

Dashboard data

Analytics

Settings

Any other application-specific operations

The frontend must call these APIs from the backend.

Do not hardcode dynamic application data into the frontend when it should come from the backend.

AUTHENTICATION

Implement complete authentication if the application requires users/accounts.

Use proper JWT-based authentication.

Implement everything required, including where applicable:

User registration

Login

Logout

JWT access tokens

Refresh tokens

Password hashing

Password verification

Token validation

Token expiration

Protected routes

Current-user endpoint

Authentication middleware/dependencies

Role-based authorization

Permission checks

Account validation

Proper authentication errors

Use secure password hashing.

Never store plaintext passwords.

Never hardcode JWT secrets.

Use environment variables for secrets and sensitive configuration.

AUTHORIZATION

Implement proper authorization instead of only checking whether a user is logged in.

If the project requires different user types or permissions, implement the appropriate system, such as:

Admin

User

Staff

Manager

Other project-specific roles

Every protected backend endpoint must enforce the appropriate authorization rules.

Do not rely only on frontend restrictions for security.

DATABASE

Create and configure the complete database layer required by the application.

Identify all entities and relationships required by the project.

Implement:

Database connection

Models

Relationships

Primary keys

Foreign keys

Constraints

Indexes where appropriate

CRUD operations

Transactions where required

Database initialization

Migrations

Use a proper migration system such as Alembic where appropriate.

Do not use temporary in-memory data when the application requires persistent data.

DATA MODELS AND SCHEMAS

Create proper backend models and Pydantic schemas.

Separate:

Database models

Request schemas

Response schemas

Authentication schemas

Update schemas

Validation schemas

Validate incoming data properly.

Return structured and predictable API responses.

BUSINESS LOGIC

Do not put all backend logic directly inside route handlers.

Separate business logic into appropriate service layers.

For example:

API Route
   ↓
Dependency / Authentication
   ↓
Service
   ↓
Repository / Database


Keep the backend organized and maintainable.

ERROR HANDLING

Implement proper backend error handling.

Handle things such as:

Invalid requests

Authentication failures

Authorization failures

Missing resources

Duplicate resources

Database errors

Validation errors

Invalid tokens

Expired tokens

File errors

External API errors

Unexpected server errors

Return appropriate HTTP status codes and useful structured error responses.

Do not expose sensitive internal errors or secrets to users.

SECURITY

Implement normal production-grade backend security practices appropriate for the application.

This includes, where applicable:

JWT security

Secure password hashing

Token expiration

Refresh-token handling

Authorization

Input validation

CORS configuration

Secure environment variables

SQL injection prevention

Proper ORM usage

File upload validation

Rate limiting where appropriate

Secure headers where appropriate

Protection of sensitive endpoints

No hardcoded secrets

No exposed credentials

Do not sacrifice security just to make the implementation easier.

ENVIRONMENT CONFIGURATION

All sensitive or environment-specific values should be configurable through environment variables.

Create:

.env.example


Include appropriate variables such as:

DATABASE_URL=
JWT_SECRET_KEY=
JWT_ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
REFRESH_TOKEN_EXPIRE_DAYS=
CORS_ORIGINS=


Add any other variables required by the actual project.

Never commit real secrets.

FRONTEND ↔ BACKEND CONNECTION

This is mandatory.

The frontend must communicate with the FastAPI backend through the implemented API layer.

For example:

Frontend
   ↓
API Client
   ↓
FastAPI
   ↓
Service Layer
   ↓
Database


All relevant dynamic data should flow through the backend.

Do not create separate fake frontend logic that bypasses the backend.

Do not hardcode API responses simply to make the UI appear functional.

API DOCUMENTATION

Make sure FastAPI's API documentation works correctly.

All important endpoints should have:

Proper endpoint names

Request schemas

Response schemas

Authentication requirements

Useful descriptions

Appropriate status codes

The API should be understandable and testable through FastAPI's documentation interface.

TESTING

Create proper backend tests for important functionality.

Test:

Authentication

Registration

Login

JWT validation

Protected routes

Authorization

CRUD operations

Validation

Error handling

Important business logic

Critical API endpoints

Also verify the frontend integration with the backend.

COMPLETE FILE AND FOLDER REQUIREMENT

Do not skip files simply because they are not visually visible.

Every required backend file must be implemented.

Every required frontend file must be implemented.

Every required configuration file must be implemented.

Every required migration must be implemented.

Every required schema/model/service/router must be implemented.

Everything necessary for the application to actually run must be included.

NO MOCK BACKEND

Do NOT create a fake backend just to satisfy the UI.

Do NOT use:

Fake API responses

Static JSON pretending to be a backend

Hardcoded user accounts

Fake authentication

Fake JWT tokens

Fake database operations

Placeholder endpoints

Dummy CRUD operations

If the original application requires real backend functionality, implement the real functionality.

NO PLACEHOLDERS

Do not leave things like:

TODO
Coming Soon
Implement later
Placeholder
Mock data
Fake API
Not implemented


unless something genuinely requires external credentials or information that cannot be provided.

If something cannot be implemented exactly because an external dependency is unavailable, clearly identify the dependency and structure the code so it can be configured properly.

RESPONSIVE DESIGN

The frontend must work properly across:

Desktop

Laptop

Tablet

Mobile

Reproduce the original responsive behavior.

Do not simply shrink the desktop layout.

Check:

Navigation

Menus

Cards

Tables

Forms

Grids

Typography

Spacing

Images

Modals

Sidebars

Mobile layouts

VISUAL ACCURACY

The clone should match the original as closely as technically possible.

Pay attention to:

Colors

Typography

Font weights

Font sizes

Line heights

Spacing

Padding

Margins

Borders

Border radius

Shadows

Icons

Images

Gradients

Animations

Hover states

Focus states

Active states

Disabled states

Loading states

Empty states

Error states

Do not redesign the application.

The objective is to clone the existing application, not improve its visual design.

FINAL FULL-SYSTEM AUDIT

After everything has been implemented, perform a complete audit.

Check the application from beginning to end.

Verify:

Frontend

Every page exists

Every route works

Every section exists

Every component works

Every button works

Every form works

Every interaction works

Responsive behavior works

Assets load correctly

No console errors

Backend

FastAPI starts successfully

Database connects correctly

Migrations work

APIs work

Authentication works

JWT works

Authorization works

CRUD operations work

Validation works

Error handling works

No sensitive information is exposed

No broken endpoints exist

Integration

Frontend correctly calls backend APIs

Authentication state works

Protected pages work

Protected API endpoints work

Data is correctly stored and retrieved

Errors from the backend are correctly handled by the frontend

Loading states work

Logout works

Token expiration/refresh behavior works where implemented

IMPORTANT WORKFLOW

Follow this workflow:

Step 1

Audit the complete existing project.

Step 2

Create a complete inventory of the frontend, backend requirements, APIs, database entities, authentication requirements, assets, routes, and functionality.

Step 3

Build the backend architecture in the dedicated:

/backend


folder.

Step 4

Implement the database, models, schemas, services, repositories, authentication, JWT, authorization, middleware, APIs, validation, error handling, configuration, and all other required backend functionality.

Step 5

Clone the frontend completely.

Step 6

Connect the frontend to the FastAPI backend.

Step 7

Test every important feature.

Step 8

Compare the clone against the original project.

Step 9

Find every missing or incorrect part.

Step 10

Fix everything you find.

Step 11

Run a final complete frontend + backend + integration audit.

Do not stop after the first working version.

Continue iterating until the application is as complete and accurate as technically possible.

FINAL NON-NEGOTIABLE REQUIREMENT

I want the entire project, not just the frontend.

I want:

Complete Frontend + Complete FastAPI Backend + Database + APIs + JWT Authentication + Authorization + Business Logic + Models + Schemas + Services + Repositories + Middleware + Validation + Error Handling + Security + Migrations + Configuration + Tests + Frontend/Backend Integration + Responsive UI + Assets + All Pages + All Components + All Functionality.

Everything that belongs to the application should be implemented.

Do not skip anything. Do not simplify anything unnecessarily. Do not replace real functionality with mocks. Do not create a frontend-only prototype.

The final result should be a fully functional, production-ready full-stack application that reproduces the original project's UI, structure, behavior, functionality, and data flow as accurately as technically possible.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/17f857ae-0eeb-4789-bd16-70144f8c6b11).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
