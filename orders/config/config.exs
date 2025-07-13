import Config

config :orders, Orders.Repo,
  database: System.get_env("POSTGRES_DB"),
  username: System.get_env("POSTGRES_USER"),
  password: System.get_env("POSTGRES_PASSWORD"),
  hostname: System.get_env("POSTGRES_HOST"),
  port: String.to_integer(System.get_env("POSTGRES_PORT", "5432"))

config :orders, ecto_repos: [Orders.Repo]
