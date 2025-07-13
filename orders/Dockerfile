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
RUN mix release orders_generator

# Runner
FROM alpine:${ALPINE_VERSION} AS release
RUN apk add --no-cache bash openssl ncurses-libs libstdc++ libgcc
WORKDIR /app
COPY --from=builder /app/_build/prod/rel/orders_generator ./
CMD ["bin/orders_generator", "start"]
