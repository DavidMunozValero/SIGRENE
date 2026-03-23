# SIGRENE 🏊‍♂️

**System for Elite Swimmer Management and Performance** *(Sistema de Gestión y Rendimiento del Nadador de Élite)*

SIGRENE is a high-performance, secure digital platform designed to track, manage, and optimize the long-term development of elite Spanish swimmers. It acts as a centralized database and API for coaching staff to input daily training loads, morning wellness metrics, and physiological data.

## 🎯 Core Features

* **Daily Wellness & External Load Tracking**: Secure logging of metrics such as RPE, session volume, sleep hours, and resting heart rate.
* **Automated Sports Science Calculations**: Real-time backend computation of derived metrics like Session RPE (sRPE) and Training Density.
* **Role-Based Access Control (RBAC)**: Strict JWT-based authentication ensuring coaches can only access data for their assigned swimmers.
* **Privacy by Design (GDPR/LOPDGDD Compliant)**: Pseudonymization of athlete identities and Bcrypt password hashing.

## 🛠️ Tech Stack

* **Backend Framework**: FastAPI (Python 3.12)
* **Database**: MongoDB (Local/Community Edition)
* **Dependency Management**: Poetry
* **Data Validation**: Pydantic
* **Security**: PyJWT, Passlib (Bcrypt)
* **Frontend**: Vanilla HTML/JS (Decoupled architecture)

## 🚀 Getting Started (Local Development)

Follow these steps to set up the SIGRENE environment on a macOS machine.

### 1. Prerequisites
Ensure you have the following installed:
* [Python 3.12+](https://www.python.org/downloads/)
* [Poetry](https://python-poetry.org/docs/#installation)
* [Homebrew](https://brew.sh/) (for MongoDB installation)

### 2. Database Setup (MongoDB)
Install and start the MongoDB Community Edition service via Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### 3. Project Installation
Clone this private repository and install the dependencies using Poetry:

```bash
git clone <your-private-repo-url>
cd SIGRENE
poetry install
```

### 4. Environment Variables
Create a `.env` file in the root directory of the project and add your secure credentials:

```env
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=sigrene_db
SECRET_KEY=your_super_secret_random_string_here
```

### 5. Running the API Server
Start the Uvicorn ASGI server with hot-reloading enabled:

```bash
poetry run uvicorn app.main:app --reload
```

Once running, the interactive API documentation (Swagger UI) will be available at:  
👉 **http://127.0.0.1:8000/docs**

## 📂 Project Structure

```text
SIGRENE/
├── app/
│   ├── main.py              # FastAPI application and route endpoints
│   ├── api/                 # API routers 
│   ├── models/              # Pydantic validation schemas (schemas.py)
│   ├── database/            # Database connection managers (mongodb.py)
│   └── services/            # Business logic and auth (calculations.py, auth.py)
├── .env                     # Environment variables (Ignored by Git)
├── pyproject.toml           # Poetry dependencies and project metadata
└── poetry.lock              # Locked dependency versions
```

## 🗺️ Roadmap / Next Steps

- [ ] Implement ACWR (Acute:Chronic Workload Ratio) historical calculations.
- [ ] Set up SeaweedFS integration for biomechanical video storage and URI linking.
- [ ] Expand Pydantic schemas for physiological control tests (lactate, CMJ jumps, etc.).
