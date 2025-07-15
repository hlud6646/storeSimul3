# Fake Store

This is a pretty kooky project and exists entirely for learning.
It is essesntially a simulation of a shop, with a database recording
customers, product inventory, orders etc. 

The inital idea was to have a project that showed a lot of database
knowledge, but it has branched out into:
- App frameworks in Java, Python etc.
- Database toolkits in the same;
- Containerisation.

## Components
These are the components of the simulation that are currently running.


| microservice | language | database framework |
| --------------- | --------------- | --------------- |
| Products | Scala | JDBC |
| Suppliers | Haskell | Postgres-simple |
| Customers  | Python | SQLAlchemy |
| Orders | Elixir | Ecto |

### Customers (Python)
Built with Poetry. Sqlalchemy is used as an ORM to interact with the database.

### Products (Scala)
Built with Sbt. I avoided the very complicated looking 
Typelevel solutions for DB interaction and went for a basic aproach with java.sql.

### Suppliers (Haskell)
Built with cabal. Best fake data library of the lot. Not surprisingly, this was the most
comlicated, especialyl when it came to getting a working haskell compiler on a container. 
The current `docker compose build --no-cache suppliers` is above 10 minutes and not finished...

### Orders (Elixir)
Built with Mix, using the fully featured Ecto ORM system. This one is my favourite database API.

### Employees (Java)
Tooo... Maybe emplyees should occasionally pack the wrong item.


## Dashboard

A simple dashboard will show any DB interactions as they occur, a list of unshipped 
orders etc. To do that we'll need an API too...

## Dashboard API
Simple FastAPI that lets you peek at the databas/


## Containerisation
Initially I had a realistic architecture with each microservice defining it's own image, with
docker compose tying it all together.  This was good to play with, but is overkill for a toy project.
The new version has all services running in a single debian derived image. This is bad, but it works.
The disadvantage is that you have to install postgres and haskell on the server by yourself, which is 
a bit of a slog.

The single image also holds the database, and to simplify even further there is no attached volume. This
means that there is no data persistance, which is obviously very bad for a database but fine for this 
project.
 
The *newer* version has microservices again. Since the final deployment strategy turned out to be an
aws ec2 isntance with only 1gb of memory, image size is important. I found it easier to optimise the 
builds when split into microservies. I've learned at lot:
- A good multistage build will have at least the following:
  - A 'build' stage which pulls a base image that contains the relevand development tools and then builds the project;
  - A 'runner' stage that copies the final build artifact from the builder to a minimal runtime and executes it.
For example, a in a scala project the builder would need SBT and the full JDK, but the runner would only need
the cooresponding JRE, which would be a lot smaller.

Something cool about virtual machines is that you can package a single large artifact to run on them. 
In scala, the `assembly` plugin builds a single `.jar` that contains everything that your project
needs and you can simply run `java -jar my-project.jar`.
The `mix` build tool for `elixir` takes this one step further, by including the `mix release`
command. This does the same thing, but *includes the BEAM VM*.

## Docker Compose
- Healthchecks are cool (define in the dockerfiles or via a command in compose)

## Haskell
Project configuration is a bit tricky. When you start a new project a LOT of binaries get compiled.
So you should make sure that the compiler version you are targetting on your docker image matches the
one you are using for local development (or just do all your builds inside the container from day 1.)
This gets tricky since you also need to consider compatible compiler versions for all your dependencies...


## Security
**None** of this is secure. There are passwords in the repo. Go find them!
