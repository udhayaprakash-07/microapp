# Vortex: E-Commerce Microservices Application

Vortex is a modern, high-performance, 3-tier e-commerce application structured using a **microservice architecture**. This repository has been structured explicitly for **DevOps practice** (Dockerization, Kubernetes orchestration, Nginx reverse proxying, and AWS cloud deployment).

---

## 🏗️ Architecture Overview

```
                          ┌────────────────────────┐
                          │     React Frontend     │
                          │   (Vite - Port 3000)   │
                          └───────────┬────────────┘
                                      │
                                      ▼  /api/* (HTTP)
                          ┌────────────────────────┐
                          │      API Gateway       │
                          │      (Port 5000)       │
                          └───────────┬────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │ /auth                       │ /products                   │ /cart & /orders
        ▼                             ▼                             ▼
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│ User Service │              │ProductServ.  │              │Order Service │
│ (Port 5001)  │              │ (Port 5002)  │              │ (Port 5003)  │
└──────┬───────┘              └──────┬───────┘              └──────┬───────┘
       │                             │                             │
       ▼                             ▼                             ▼
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│ MongoDB:     │              │ MongoDB:     │              │ MongoDB:     │
│ users_db     │              │ products_db  │              │ orders_db    │
└──────────────┘              └──────────────┘              └──────────────┘
```

### Key Architectural Patterns
1. **API Gateway Pattern**: The API Gateway acts as the single entry point. The client only communicates with the Gateway (`/api/*`), which proxies requests to the appropriate backend service.
2. **Database-Per-Service**: Each microservice maintains its own dedicated database, preventing tight coupling and allowing databases to scale independently.
3. **Decoupled User Authentication**: 
   - The **User Service** verifies login credentials and issues a signed JWT.
   - The **API Gateway** intercepts requests to protected routes, verifies the JWT, and extracts user details (`id` and `role`).
   - The Gateway forwards requests downstream with custom headers: `x-user-id` and `x-user-role`.
   - Downstream services (`Order Service`) read these headers directly, bypassing the need to verify JWT tokens or query user databases.

---

## ⚙️ Configuration & Environment Variables

All services are fully configurable via environment variables, making containerization and Kubernetes orchestration seamless.

### 1. API Gateway (`/gateway`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Gateway listening port |
| `JWT_SECRET` | `super_secret_jwt_key_987654321` | Key used to verify client JWTs |
| `USER_SERVICE_URL` | `http://localhost:5001` | Downstream User Service address |
| `PRODUCT_SERVICE_URL` | `http://localhost:5002` | Downstream Product Service address |
| `ORDER_SERVICE_URL` | `http://localhost:5003` | Downstream Order Service address |

### 2. User Service (`/services/user-service`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | Service listening port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ecommerce_users` | MongoDB connection string |
| `JWT_SECRET` | `super_secret_jwt_key_987654321` | Key used to sign JWTs |

### 3. Product Service (`/services/product-service`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5002` | Service listening port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ecommerce_products` | MongoDB connection string |

### 4. Order Service (`/services/order-service`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5003` | Service listening port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ecommerce_orders` | MongoDB connection string |

### 5. Frontend Client (`/frontend`)
- Development proxy in `vite.config.js` routes all local `/api` calls directly to `http://localhost:5000`.
- In a production docker build, Vite outputs static assets. Your production proxy (e.g. Nginx) should handle routing `/api` to the Gateway service.

---

## 🚀 Running Locally (for Testing & Development)

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `localhost:27017`
  - *Tip for DevOps practice*: You can spin up a local MongoDB container using Docker:
    ```bash
    docker run -d -p 27017:27017 --name vortex-mongo mongo:latest
    ```

### Step 1: Install Dependencies
From the root directory, run:
```bash
npm run install-all
```
This installs dependencies recursively for the root, gateway, user-service, product-service, order-service, and frontend.

### Step 2: Seed the Product Database
Run the seeder to populate MongoDB with premium products (keyboards, audio gear, laptops):
```bash
npm run seed-products
```

### Step 3: Run the Application Stack
Launch all microservices and the React frontend concurrently:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Vortex includes a comprehensive, multi-layered automated test suite covering all microservices, the API gateway, and the frontend client.

### Testing Architecture
1. **API Gateway Tests**: Uses **Jest** and **Supertest** to verify routing paths, public bypasses, and header injection middlewares (simulating proxy targets).
2. **Backend Microservices Tests**: Uses **Jest** and **Supertest** to test route logic. All Mongoose queries and constructors are mocked to ensure tests run **instantly** without needing a running MongoDB instance.
3. **React Frontend Tests**: Uses **Vitest**, **React Testing Library**, and **jsdom** to render and test UI components (like `Navbar` and `ProductCard`), verifying render details and context integrations.

### Running Tests
To run all tests concurrently from the root directory:
```bash
npm run test
```

To run tests in a specific module, navigate to its directory and run:
```bash
# Gateway
npm run test --prefix gateway

# User Service
npm run test --prefix services/user-service

# Product Service
npm run test --prefix services/product-service

# Order Service
npm run test --prefix services/order-service

# Frontend Client
npm run test --prefix frontend
```

---

## 🛠️ DevOps Implementation Guide (Tips for Your Practice)

As you implement Docker, Kubernetes, Nginx, and AWS, use the following blueprints:

### 🐋 Dockerizing the Services
1. **Backend Services (Node.js)**:
   - Create a `Dockerfile` for `gateway`, `user-service`, `product-service`, and `order-service`.
   - Use a lightweight base image like `node:20-alpine`.
   - Copy `package.json`, run `npm install --only=production`, copy source code, and expose the respective ports.
2. **Frontend Service (React)**:
   - **Stage 1 (Build)**: Use `node:20-alpine` to install dependencies and run `npm run build`. This generates static HTML/JS inside `dist/`.
   - **Stage 2 (Production)**: Use `nginx:alpine`, copy the `dist/` directory to `/usr/share/nginx/html`, and configure Nginx to listen on port `80`.

### ☸️ Kubernetes Orchestration
1. **Deployments**:
   - Create separate Deployment files for each service.
   - For backend services, configure `livenessProbe` and `readinessProbe` targeting `/health` to allow Kubernetes to monitor container health.
2. **Services & ClusterIP**:
   - Create ClusterIP services for User, Product, and Order services (e.g., `user-service-svc`, `product-service-svc`, `order-service-svc`).
   - Configure the **API Gateway** environment variables to target these internal cluster URLs:
     - `USER_SERVICE_URL=http://user-service-svc:5001`
     - `PRODUCT_SERVICE_URL=http://product-service-svc:5002`
     - `ORDER_SERVICE_URL=http://order-service-svc:5003`
3. **Secrets & ConfigMaps**:
   - Use a Kubernetes Secret to store the `JWT_SECRET`.
   - Use ConfigMaps to inject `MONGODB_URI` and port numbers.

### 🌐 Nginx Reverse Proxy (Production Gateway)
If you place Nginx in front of the application:
1. Serve the frontend static files on `/`.
2. Reverse proxy all requests starting with `/api/` to the API Gateway container on port `5000`:
   ```nginx
   server {
       listen 80;

       # Frontend static files
       location / {
           root /usr/share/nginx/html;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # Backend API Gateway Proxy
       location /api/ {
           proxy_pass http://api-gateway-svc:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

### ☁️ AWS Cloud Architecture
1. **Managed Containers (ECS/EKS)**:
   - Use **AWS ECS Fargate** for serverless container execution of individual services, or deploy the Kubernetes configurations on **AWS EKS**.
2. **Database (DocumentDB/Atlas)**:
   - Connect the containers to **AWS DocumentDB** (MongoDB compatible) or **MongoDB Atlas**, injecting connection strings as AWS Secrets Manager credentials.
3. **Caching & CDN**:
   - Point **AWS CloudFront** to an **S3 bucket** hosting the built React assets, routing backend requests (`/api/*`) directly to an **Application Load Balancer** sitting in front of the API Gateway task.
