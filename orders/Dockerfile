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

# Simple health check - just verify Elixir process is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD pgrep -f "beam.smp.*orders_generator" > /dev/null || exit 1

CMD ["/app/bin/orders_generator", "start"]
