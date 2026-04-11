# 📝 Task Management API

A production-ready backend service for managing tasks (to-do list), built with **NestJS**, following best practices for modern web services and cloud deployment.

---

## 🚀 Features

* ✅ Create, read, update, delete tasks (CRUD)
* 📂 Categorize tasks (work, study, personal)
* ✔️ Mark tasks as completed
* 🔍 Filter tasks by status/category *(optional extension)*
* 📄 Swagger API documentation
* 🔐 Input validation & error handling
* ☁️ Cloud deployment ready
* 🔄 CI/CD with GitHub Actions

---

## 🧱 Tech Stack

* Backend: NestJS
* Language: TypeScript
* Validation: class-validator
* API Docs: Swagger (OpenAPI)
* CI/CD: GitHub Actions

---

## 📁 Project Structure

```
src/
 ├── modules/
 │    └── tasks/
 │         ├── tasks.controller.ts
 │         ├── tasks.service.ts
 │         ├── tasks.module.ts
 │         ├── dto/
 │         └── entities/
 ├── common/
 ├── config/
 └── main.ts
```

---

## ⚙️ Installation

### 1. Clone repository

```bash
git clone https://github.com/your-username/task-management-api.git
cd task-management-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create `.env` file:

```env
PORT=3000
DATABASE_URL=your_database_url
```

---

## ▶️ Running the App

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

---

## 📡 API Endpoints

| Method | Endpoint   | Description    |
| ------ | ---------- | -------------- |
| POST   | /tasks     | Create task    |
| GET    | /tasks     | Get all tasks  |
| GET    | /tasks/:id | Get task by ID |
| PATCH  | /tasks/:id | Update task    |
| DELETE | /tasks/:id | Delete task    |

---

## 📄 API Documentation

Swagger UI available at:

```
http://localhost:3000/api-docs
```

---

## 🧠 Data Model

```ts
Task {
  id: number
  title: string
  description?: string
  status: "pending" | "done"
  category: string
  createdAt: Date
}
```
