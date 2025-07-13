FROM haskell:slim-bullseye AS builder
WORKDIR /app
# Install PostgreSQL development libraries and pkg-config
RUN apt-get update && apt-get install -y \
    pkg-config \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
COPY ./suppliers.cabal .
RUN cabal update
RUN cabal build --only-dependencies
COPY ./src-exe ./src-exe
RUN cabal build




# Runner
# FROM haskell:slim-bullseye AS runner
# WORKDIR /app
# Copy the final executable