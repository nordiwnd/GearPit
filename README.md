# GearPit

GearPit is a modern SaaS application for outdoor enthusiasts to manage their gear, plan trips, and track usage.

## Tech Stack

### Frontend (`apps/gearpit-web`)
*   **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Components**: [shadcn/ui](https://ui.shadcn.com/)
*   **State Management**: React Query, Zustand (where applicable)
*   **Communication**: gRPC-Web via ConnectRPC

### Backend (`apps/gearpit-core`)
*   **Language**: Rust (Edition 2021)
*   **Web Framework**: [Axum](https://github.com/tokio-rs/axum)
*   **Runtime**: [Tokio](https://tokio.rs/)
*   **Database Interface**: [SQLx](https://github.com/launchbadge/sqlx) (PostgreSQL)
*   **gRPC**: Prost, Tonic/Connect-Rust

### Infrastructure & DevOps
*   **Containerization**: Docker
*   **Orchestration**: Kubernetes (k3d recommended for local development)
*   **Dev Environment**: [Tilt](https://tilt.dev/)
*   **Database**: PostgreSQL

## Prerequisites

Before running the project locally, ensure you have the following installed:

*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
*   [k3d](https://k3d.io/) (Lightweight Kubernetes)
*   [Tilt](https://tilt.dev/)
*   [Rust](https://www.rust-lang.org/tools/install) (Optional, for local compilation without Docker)
*   [Node.js](https://nodejs.org/) & [pnpm](https://pnpm.io/) (Optional, for local frontend dev)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd GearPit
    ```

2.  **Create a local Kubernetes cluster:**
    The default `Tiltfile` expects a context named `k3d-gearpit-dev`.
    ```bash
    k3d cluster create gearpit-dev
    ```

3.  **Start the development environment:**
    ```bash
    tilt up
    ```
    This command will build the Docker images for `gearpit-core` and `gearpit-web`, deploy them to your local k3d cluster, and set up port forwarding.

4.  **Access the application:**
    *   **Frontend**: [http://localhost:9000](http://localhost:9000)
    *   **Backend API**: [http://localhost:3000](http://localhost:3000)
    *   **PostgreSQL**: `localhost:5432`

## Project Structure

*   `apps/`
    *   `gearpit-core`: The Rust backend service handling business logic, database interactions, and API endpoints.
    *   `gearpit-web`: The Next.js frontend application providing the user interface.
*   `infra/`: Kubernetes manifests and infrastructure configuration.
*   `Tiltfile`: Configuration for the local development environment orchestration.
