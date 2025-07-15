import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "./index.css";
import { TopCustomersChart } from "./components/TopCustomersChart";
import { OrdersLineChart } from "./components/OrdersLineChart";
import { ProductDepartmentPieChart } from "./components/ProductDepartmentPieChart";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { SupplierProductProportionChart } from "./components/SupplierProductProportionChart";

export function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "home";
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-auto flex-col items-center bg-background px-8 pt-8">
        <div className="w-full max-w-[900px] py-4">
          <h1 className="text-3xl font-bold">Store Simulation</h1>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-[900px]"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      <main className="flex flex-col items-center p-8">
        <div className="w-full max-w-[900px]">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent value="home" className="mt-4">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>What is this?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>SQL</strong>
                    <br />
                    If you don't work with SQL databases but want to learn about
                    them, you need to make one. This project mocks up a simple
                    online store, with randomly generated customers, orders etc.
                    It's a kooky learning project with each part of the store
                    modelled as a microservice in a different language. Each
                    service has some common components, like data-faking,
                    database interface, logging etc. In addition to the
                    microservices, there's a tiny API for this dashboard to
                    call.
                  </p>
                  <br />
                  <strong>Docker</strong>
                  <p>
                    What started as a project to learn about databases morphed
                    into an experiment in containerisation. Initially I had a
                    more realistic architecture with each microservice defining
                    it's own docker image, and a docker compose file tying it
                    all together. This was good to play with, but is overkill
                    for a toy project. Now all services run in a single debian
                    derived image. This is unrealistic, but it works. The
                    disadvantage is that you have to install postgres and
                    haskell on the server by yourself, which is painful (it's
                    uncommon to build your own database image, and Haskell makes
                    everything difficult). To simplify even further there is no
                    attached volume for the database, and so there is no data
                    persistance. This is obviously very bad for a database but
                    fine for this project.
                  </p>
                  <br />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle> What this isn't</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Safe</strong>
                    <br />
                    This is not a real application. I have not tried to make a
                    secure or reliable API or frontend. I've done as little as
                    possible to <i>present</i> the dashboard, having been
                    interested primarily in creating a database and interacting
                    with it. This is not safe. There are secrets all through the
                    code, things like database passwords that should be
                    carefully guarded. As I said, the point was to play with
                    Postgres. Don't judge me!
                  </p>
                  <br />
                  <p>
                    <strong>Stunning</strong>
                    <br />
                    This dashboard is intentionally minimal. I didn't want to
                    spend too much time on the front end, so I let the llms run
                    pretty freely in putting together the API that serves the
                    dashboard, and the dashboard itself. The frontend is a
                    simple React page using Charts.js and minimal design on my
                    part. Luckily this is an area where the models are
                    particularly strong and so this was easy.
                  </p>{" "}
                  <br />
                  <p>
                    <strong>Complicated</strong>
                    <br />
                    For what it's worth, the API is a simple Python FastAPI
                    service that exposes parts of the database. I did learn
                    something here about building only what you need. Where I
                    would have overcomplicated by reaching for{" "}
                    `SqlAlchemy` and subclassing
                    `pydantic.Basemodel`, the llm just wrote some SQL in the
                    request handler, and made the handler return a list of
                    Python dictionaries. FastApi is smart enough to convert this
                    to JSON.
                  </p>
                  <br />
                  <p></p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders */}
            <TabsContent value="orders" className="mt-4">
              <div className="space-y-4">
                <Card>
                  {/* <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
              </CardHeader> */}
                  <CardContent>
                    <OrdersLineChart />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Elixir + Ecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="">
                      <a
                        href="https://github.com/hlud6646/storeSimul/blob/main/orders/lib/orders/newOrder.ex"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        https://github.com/hlud6646/storeSimul/blob/main/orders/lib/orders/newOrder.ex
                      </a>
                    </div>
                    This process mocks the arrival of new orders by periodically
                    picking a customer and some products and writing a new
                    purchase order to the database. It's an OTP application
                    written in Elixir, using the very lovely Ecto library for
                    database interaction.
                    <br />
                    Elixir is growing in popularity, largely due to the strength
                    of it's web framework (Phoenix). It's a dynamically typed
                    language that emphasises immutable structures and functional
                    programming, which is kind of a strange combination in my
                    opinion. Nevertheless I like it a lot, and Ecto was my
                    favourite database abstraction of the lot.
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="mt-4">
              <div className="space-y-4">
                <TopCustomersChart />
                <Card>
                  <CardHeader>
                    <CardTitle>Python + SQLAlchemy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="">
                      <a
                        href="https://github.com/hlud6646/storeSimul/blob/main/customers/customers/main.py"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        https://github.com/hlud6646/storeSimul/blob/main/customers/customers/main.py
                      </a>
                    </div>
                    The customers service is a simple Python program which
                    periodically creates a new customer record. It uses the
                    SQLAlchemy object relational mapper to interact with the
                    database.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>SQL Functions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="">
                      <a
                        href="https://github.com/hlud6646/storeSimul/blob/main/customers/customers/main.py"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        https://github.com/hlud6646/storeSimul/blob/main/customers/customers/main.py
                      </a>
                    </div>
                    When a new customer joins ths store, we send them a welcome
                    gift. This is implemented at the database level with a
                    trigger and a function that is loaded after the tables are
                    created. The function is executed whenever a new customer
                    record is created. All it does is pick a random product,
                    decrement the inventory by one, and create a new purchase
                    order for the customer. It follows the general pattern of
                    first creating a function in `plpgsql`, and then a trigger
                    that executes the function on certain database events.
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="mt-4">
              <div className="space-y-4">
                <ProductDepartmentPieChart />
                <Card>
                  <CardHeader>
                    <CardTitle>Scala + Java.Sql</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-2">
                      <a
                        href="https://github.com/hlud6646/storeSimul/blob/main/products/src/main/scala/app.scala"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        https://github.com/hlud6646/storeSimul/blob/main/products/src/main/scala/app.scala
                      </a>
                    </div>
                    The Products service is written in Scala and periodically
                    creates new products and writes them to the database. It
                    uses the Java.Sql interface to interact with the database.
                    This is a simple solution (not a fancy ORM). It's nice to be
                    reminded of how strong the ineterop can be between different
                    languages on the JVM.
                    <br />
                    I'm a big Scala fan, and out of all the languages that I've
                    used in this project it's my favourite. Only Scala and
                    Haskell have static types, which is something that I like,
                    and for everything that is nice about Haskell, it's simply
                    not as usable as Scala.
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="suppliers" className="mt-4">
              <div className="space-y-4">
                <SupplierProductProportionChart />
                <Card>
                  <CardHeader>
                    <CardTitle>Haskell + postgresql-simple</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-2">
                      <a
                        href="https://github.com/hlud6646/storeSimul/blob/main/suppliers/app/Main.hs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        https://github.com/hlud6646/storeSimul/blob/main/suppliers/app/Main.hs
                      </a>
                    </div>
                    The Suppliers service is a Haskell program that periodically
                    adds new suppliers and the products they offer to the
                    database. It uses the
                    <a
                      href="https://hackage.haskell.org/package/postgresql-simple"
                      className="text-blue-500 hover:underline"
                    >
                      {" "}
                      postgresql-simple{" "}
                    </a>
                    library to interact with the database. This library is nice,
                    but maybe not entirely simple.
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default App;
