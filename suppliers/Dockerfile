# Builder
FROM haskell:9.10-slim-bullseye AS builder
# Upgrade system postgresql to a version that is compatible with postgresql-simple, then 
# install some other dependencies of that library.
# It's a shame that this image comes with postgresql13 but >= 14 is needed (current is 17). 
RUN apt-get update && apt-get install -y curl ca-certificates postgresql-common
RUN /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
RUN apt-get install -y postgresql libpq-dev pkg-config && rm -rf /var/lib/apt/lists/*

# Install the project dependencies BEFORE the actual project.
WORKDIR /app
COPY ./suppliers.cabal .
RUN cabal update
RUN cabal build --only-dependencies

# Finally, build the actual project. Keeping this separate will allow fast builds
# if only the source code (not the dependencies) changes.
COPY ./src-exe ./src-exe
COPY ./LICENSE ./LICENSE
RUN cabal build
# Where does it put the final executable?
# The executable will be in dist-newstyle/build/x86_64-linux/ghc-9.10.1/suppliers-0.1.0.0/x/suppliers/build/suppliers/suppliers

# Runner
FROM debian:bullseye-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libpq5 ca-certificates procps && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/dist-newstyle/build/x86_64-linux/ghc-9.10.1/suppliers-0.1.0.0/x/suppliers/build/suppliers/suppliers /app/bin/suppliers

# Copy fakedata locale files from builder
COPY --from=builder /root/.local/state/cabal /root/.local/state/cabal

RUN chmod +x /app/bin/suppliers 

# Simple health check - just verify Haskell process is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD pgrep -f "suppliers" || exit 1

ENTRYPOINT ["/app/bin/suppliers"]


