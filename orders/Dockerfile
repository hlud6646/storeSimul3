ARG ALPINE_VERSION=3.18
ARG ELIXIR_VERSION=1.14.5

# Builder
FROM elixir:${ELIXIR_VERSION}-otp-25-alpine AS builder
WORKDIR /app
# Install build-time system dependencies
# - build-base is for C compilers (for NIFs)
# RUN apk add --no-cache build-base
# Set environment to production
ENV MIX_ENV=prod
RUN mix local.hex --force && \
    mix local.rebar --force
COPY mix.exs mix.lock ./
RUN mix deps.get --only prod
RUN mix deps.compile
COPY . .
RUN mix compile
# `mix release` is cool: It bundles your application and the BEAM runtime
# to make a native executable.
RUN mix release orders_generator

# Runner
FROM alpine:${ALPINE_VERSION} AS release
RUN apk add --no-cache bash openssl ncurses-libs libstdc++ libgcc netcat-openbsd
WORKDIR /app

# Create crash dump directory
RUN mkdir -p /app/crash-dumps

COPY --from=builder /app/_build/prod/rel/orders_generator ./

# Add a wrapper script with database connection testing
RUN cat << 'EOF' > /app/start_with_logging.sh
#!/bin/bash
echo "Starting Orders application at $(date)"
echo "Environment: $MIX_ENV"

# Wait for database to be ready using netcat
echo "Testing database connection..."
for i in {1..30}; do
    if nc -z $POSTGRES_HOST $POSTGRES_PORT; then
        echo "Database connection successful"
        break
    else
        echo "Database not ready, attempt $i/30..."
        sleep 2
    fi
    
    if [ $i -eq 30 ]; then
        echo "Database connection failed after 30 attempts, exiting"
        exit 1
    fi
done

# Set crash dump location
export ERL_CRASH_DUMP="/app/crash-dumps/erl_crash_$(date +%Y%m%d_%H%M%S).dump"

# Start the application
echo "Starting Orders application..."
exec bin/orders_generator start
EOF

RUN chmod +x /app/start_with_logging.sh

# Simple health check - just verify Elixir process is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD pgrep -f "beam.smp.*orders_generator" || exit 1

CMD ["/app/start_with_logging.sh"]
