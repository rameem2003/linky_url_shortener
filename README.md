# 🔗 Linky - URL Shortener Backend

Linky is a modern and secure backend for a URL shortener service. Built with **Node.js**, **Express.js**, and **MySQL2**, this API allows users to shorten URLs, track analytics, and manage their links with ease. It uses **Drizzle ORM** for database operations and supports **JWT**, **bcrypt**, **Arctic**, and **Google OAuth** for robust authentication.

---

## API Documentation

You can explore and test the API endpoints using Postman:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/rameem2003/workspace/public-apis-rol-studio-bangladesh/collection/30401825-157991e0-4dd6-4c1f-9bd9-2ee224225935?action=share&creator=30401825&active-environment=30401825-60af71c2-8511-4db3-bebf-81328f0f713d)

---

## 🚀 Features

- 🔐 JWT-based authentication
- 🔑 Google OAuth login via [Arctic](https://arcticjs.dev/)
- 🔒 Secure password hashing with bcrypt
- 🔗 URL shortening with customizable slugs
- 📊 Click tracking and analytics
- 🧑‍💼 User account management
- 🧱 Built using Drizzle ORM with MySQL2
- ⚙️ Environment-based configuration

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL2
- **ORM**: Drizzle ORM
- **Authentication**: JWT, bcrypt, Arctic (Google OAuth)
- **Other**: dotenv, nodemailer, zod etc.

---

## 📁 Project Structure

```plaintext
server/
├── config/                      # Configuration files
│   ├── constants.js             # App-wide constant values
│   └── db.js                    # Database connection using MySQL2 & Drizzle
│
├── controllers/                # Route controller logic
│   ├── auth.controller.js      # Handles auth-related requests
│   └── links.controller.js     # Handles link creation, redirection, etc.
│
├── drizzle/                    # Drizzle ORM setup
│   ├── schema.js               # Drizzle schema definitions
│   ├── meta/                   # Drizzle metadata files (auto-generated)
│   └── 0000_unusual_loki.sql   # Migration SQL file (auto-generated)
│
├── middlewares/               # Express middlewares
│   └── auth-middleware.js      # JWT auth middleware
│
├── routes/                    # API routes
│   ├── auth/                   # Auth-related routes
│   │   └── index.js
│   ├── links/                  # URL shortening and management routes
│   │   └── index.js
│
├── services/                  # Core business logic
│   ├── auth.service.js         # Auth services (login, register, etc.)
│   └── links.service.js        # URL services (shorten, stats, etc.)
│
├── utils/                     # Utility/helper functions
│   ├── oauth/
│   │   └── google.js           # Google OAuth setup via Arctic
│   └── sendEmail.js            # Email utility (if used)
│
├── validator/                 # Input validation logic
│   ├── auth.validator.js       # Validation for login/register
│   └── shortener.validator.js  # Validation for link shortening
│
├── .env                        # Environment variable config
├── drizzle.config.js           # Drizzle ORM config file
├── app.js                      # Main express app file
├── index.js                    # Server entry point
├── package.json
└── package-lock.json
```

# MySQL Database Setup with Drizzle ORM

This guide explains how to create a MySQL database, generate SQL from the Drizzle schema, run migrations, and view the database using Drizzle tools.

---

## Prerequisites

- MySQL server installed and running
- Node.js and npm installed
- Drizzle ORM and Drizzle Kit installed in your project

---

## Step 1: Create the Database

Before running any migrations, create a new database in MySQL.

You can do this by logging into MySQL and running:

```sql
CREATE DATABASE your_database_name;
```

## Step 2: Define Your Drizzle Schema

Create or update your Drizzle schema files in your project, defining your tables and models according to the Drizzle ORM documentation.

## Step 3: Generate SQL from Drizzle Schema

Use the Drizzle CLI to generate SQL migration files from your schema.

Run this command in your project root:

```bash
npm run db:generate
```

This will create migration files based on the current schema definitions.

## Step 4: Run Migrations to Update the Database

Apply the generated migration files to your MySQL database to create or update tables.

Run:

```bash
npm run db:migrate
```

This will execute the SQL commands on your database.

## Step 5: View the Database in Drizzle Studio

To visually inspect and manage your database schema and data, run Drizzle Studio:

```bash
npm run db:studio
```

This will open a local UI where you can browse your database tables, data, and migrations.

# Environment Variables

Create a `.env` file in your project root with the following content:

```env
PORT=5000
JWT_SECRET=
DATABASE_URL=
API_BASE=/api/v1
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Contributing

Contributions to **Linky** are welcome! Whether it's fixing bugs, adding new features, improving documentation, or suggesting ideas, your help is appreciated.

To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request describing your changes

Please follow the existing code style and write clear commit messages.
