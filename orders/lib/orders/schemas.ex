# Orders.PurchaseOrder is the name of an Ecto schema.
defmodule Orders.PurchaseOrder do
  use Ecto.Schema

  # purchase_order is the name of a table in the database.
  schema "purchase_order" do
    field(:customer, :integer)
    field(:created, :utc_datetime)
    field(:address, :string)
    field(:packed, :utc_datetime)
    field(:dispatched, :utc_datetime)
  end
end

defmodule Orders.PurchaseOrderProduct do
  use Ecto.Schema

  @primary_key false
  schema "purchase_order_products" do
    field(:purchase_order, :integer)
    field(:product, :integer)
    field(:quantity, :integer)
  end
end

defmodule Orders.Customer do
  use Ecto.Schema

  schema "customer" do
    field(:name, :string)
    field(:email, :string)
    field(:created, :utc_datetime)
  end
end

defmodule Orders.Product do
  use Ecto.Schema

  schema "product" do
    field(:name, :string)
    field(:material, :string)
    field(:color, :string)
    field(:department, :string)
    field(:inventory, :integer)
  end
end
