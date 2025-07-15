defmodule Orders.DatabaseMonitor do
  use GenServer
  require Logger

  @interval_ms 5000  # Query every 5 seconds

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    Logger.info("Database Monitor starting...")
    schedule_check()
    {:ok, %{check_count: 0}}
  end

  @impl true
  def handle_info(:database_check, state) do
    case check_database() do
      {:ok, result} ->
        Logger.info("Database check #{state.check_count + 1}: #{result}")
        schedule_check()
        {:noreply, %{check_count: state.check_count + 1}}

      {:error, reason} ->
        Logger.error("Database check failed: #{inspect(reason)}")
        schedule_check()
        {:noreply, state}
    end
  end

  defp schedule_check() do
    Process.send_after(self(), :database_check, @interval_ms)
  end

  defp check_database() do
    try do
      # Simple query to check database connectivity and get current timestamp
      result = Orders.Repo.query!("SELECT NOW() as current_time, version() as pg_version", [])

      case result.rows do
        [[timestamp, version]] ->
          {:ok, "Connected at #{timestamp}, PostgreSQL version: #{String.slice(version, 0, 50)}..."}
        _ ->
          {:ok, "Connected successfully, got #{length(result.rows)} rows"}
      end
    rescue
      exception ->
        {:error, exception}
    end
  end
end
