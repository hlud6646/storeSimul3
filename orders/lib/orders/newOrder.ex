defmodule Orders.NewOrder do
  @moduledoc """
    A GenServer module for simulating the arrival of new orders.

    This module periodically creates new orders in the database at random intervals. It is intended
    to be used as part of an OTP Application. By listing it as a child in the application's supervision
    tree (see `lib/orders/application.ex`), the `start_link/1` function will be called, which in turn
    calls `GenServer.start_link/3`. This initializes the GenServer and schedules the creation of new orders.

    The module uses the `Faker` library to generate random addresses and the `Ecto` library to interact
    with the database.  It's a bit overengineered for this problem, but that's OTP.
  """

  use GenServer
  import Ecto.Query
  import Faker.Address.En

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init(_) do
    create_order()
    create_order()
    create_order()
    schedule_new_order()
    {:ok, nil}
  end

  @impl true
  def handle_info(:create_order, state) do
    case create_order() do
      :ok ->
        schedule_new_order()
      :no_data ->
        # If no customers or products exist, try again sooner
        Process.send_after(self(), :create_order, 30000) # 30 seconds
    end
    {:noreply, state}
  end

  defp schedule_new_order do
    delay = :rand.uniform(60000) + 300000
    Process.send_after(self(), :create_order, delay)
  end

  defp create_order do
    case get_random_customer_id() do
      nil ->
        IO.puts("No customers found, skipping order creation")
        :no_data
      customer_id ->
        products = get_random_products(1 + :rand.uniform(10))

        case products do
          [] ->
            IO.puts("No products found, skipping order creation")
            :no_data
          _ ->
            address = "#{street_address()}, #{city()}, #{zip_code()}, #{state()}"

            {:ok, purchase_order} =
              Orders.Repo.insert(%Orders.PurchaseOrder{customer: customer_id, address: address})

            make_order_products(products, purchase_order)
            |> Enum.each(&Orders.Repo.insert/1)

            :ok
        end
    end
  end

  defp get_random_customer_id do
    Orders.Customer
    |> order_by(fragment("RANDOM()"))
    |> limit(1)
    |> Orders.Repo.one()
    |> case do
      nil -> nil
      customer -> Map.get(customer, :id)
    end
  end

  defp get_random_products(n) do
    Orders.Product
    |> Ecto.Query.order_by(fragment("RANDOM()"))
    |> Ecto.Query.limit(^n)
    |> Orders.Repo.all()
  end

  defp make_order_products(products, purchase_order) do
    products
    |> Enum.map(fn product ->
      %Orders.PurchaseOrderProduct{
        purchase_order: Map.fetch!(purchase_order, :id),
        product: Map.get(product, :id),
        quantity: min(:rand.uniform(30), Map.get(product, :inventory))
      }
    end)
  end
end
