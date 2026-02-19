use axum::{
    routing::get,
    Router,
    response::IntoResponse,
    Json,
};
use serde::Serialize;
use std::net::SocketAddr;

mod domain;
mod infrastructure;

mod api;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Setup Database Connection
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = sqlx::PgPool::connect(&database_url).await.expect("Failed to connect to DB");

    // Run Migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    // Define routes
    let app = Router::new()
        .route("/health", get(health_check))
        .merge(api::handlers::api_routes(pool));

    // Run app
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string()).parse().expect("PORT must be a number");
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "ok".to_string(),
        version: "0.1.0".to_string(),
    })
}
