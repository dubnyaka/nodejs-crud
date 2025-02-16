# NodeJS CRUD API – Deployment in Kubernetes

This project is a Node.js CRUD API with a PostgreSQL database. This file describes the deployment process in Kubernetes using Minikube.

## 🚀 Local Deployment in Minikube (Windows)

### Install Dependencies
Before starting, make sure you have installed:
- **[Minikube](https://minikube.sigs.k8s.io/docs/start/)**
- **[Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)**
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**

### Start Minikube
```sh
minikube start --driver=docker
```

### Build Docker Image
⚠️ **Important:** Minikube uses **its own local Docker registry**. To ensure Minikube can see the image, run:
```sh
minikube -p minikube docker-env | Invoke-Expression
docker build -t nodejs-crud:latest .
```

### 📦 Create a ConfigMap for Pub/Sub Variables (Specify actual data)
```sh
kubectl create configmap app-config --from-literal=PUBSUB_TOPIC=authors_topic --from-literal=PUBSUB_SUBSCRIPTION=authors_topic-sub
```

### Create a Secret with the GCP Key (if the key is not in the project root, provide the correct path)
```sh
kubectl create secret generic gcp-key-secret --from-file=gcp-key.json=./gcp-key.json
```

### Deploy to Kubernetes
```sh
kubectl apply -f k8s/deployment.yaml
```

### Check Running Pods
```sh
kubectl get pods
```

### Forward Port to Make the API Available on localhost:3000
```sh
kubectl port-forward service/nodejs-crud-service 3000:3000
```
Now the API is accessible at `http://127.0.0.1:3000`.

---

## 🛠 Useful Commands

### 🔍 **View Logs**
```sh
kubectl logs deployment/nodejs-crud
```

### 🔄 **Restart Deployment**
```sh
kubectl rollout restart deployment nodejs-crud
```

### 🔗 **Open API in Browser**
```sh
minikube service nodejs-crud-service
```

### 🛠 **Delete Service**
```sh
kubectl delete -f k8s/deployment.yaml
```

### 🔧 Local Environment Setup

#### Create a .env file:
#### Copy .env.example to a new file named .env and fill in the required environment variables.

#### Set Up PostgreSQL Databases:
#### Create two PostgreSQL databases:

#### Primary Database: The name must match the value of DATABASE_NAME in the .env file.
#### Test Database: The name must match the value of TEST_DATABASE_NAME in the .env file.

### npm run dev
### npm run test