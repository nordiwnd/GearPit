FROM rust:1.93.1-slim-bullseye

WORKDIR /app

# Install development tools
RUN cargo install cargo-watch

# Initial build cache is not strictly necessary for simple dev setup if we mount source
# But we can pre-fetch dependencies if we copy Cargo.toml first
# COPY Cargo.toml .
# COPY apps/gearpit-core/Cargo.toml apps/gearpit-core/Cargo.toml
# ... constructing workspace is tricky without full context

# Simplifying for dev: Just use the base image with cargo-watch.
# Tilt will mount the source code.
COPY apps/gearpit-core .
CMD ["sh", "-c", "until cargo run --bin migrate; do echo 'Waiting for DB...'; sleep 2; done && cargo watch -x 'run --bin gearpit-core'"]
