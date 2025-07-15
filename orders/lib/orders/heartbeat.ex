defmodule Orders.Heartbeat do
  use GenServer

  @interval_ms 2000

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    IO.puts("Heartbeat server starting...")
    schedule_heartbeat()
    {:ok, %{}}
  end

  @impl true
  def handle_info(:heartbeat, state) do
    IO.puts("heartbeat...")
    schedule_heartbeat()
    {:noreply, state}
  end

  defp schedule_heartbeat() do
    Process.send_after(self(), :heartbeat, @interval_ms)
  end
end
