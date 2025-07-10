import Database.{assignProductToSupplier, getSupplierIds, writeNewProduct}
import java.sql.{Connection, DriverManager, ResultSet}

object Main extends App {

  val rand = new util.Random()

  val username = sys.env("POSTGRES_USER")
  val password = sys.env("POSTGRES_PASSWORD")
  val url = sys.env("JDBC_URL")
  val connection = DriverManager.getConnection(url, username, password)

  if (Database.isEmpty(connection)) {
    for (_ <- 1 to 100) {
      writeNewProduct(connection)
    }
  }

  while (true) {
    val waitTime = rand.between(60, 300)
    Thread.sleep(waitTime * 1000)
    try {
      val newProductId = writeNewProduct(connection)

      /* This block would assign the new product to a supplier.
      val supplierIds = getSupplierIds(connection)
      if (supplierIds.nonEmpty) {
        val numSuppliers = util.Random.nextInt(3) + 1
        val randomSuppliers =
          util.Random.shuffle(supplierIds).take(numSuppliers)
        for (supplierId <- randomSuppliers) {
          assignProductToSupplier(connection, newProductId, supplierId)
        }
      }
       */

    } catch {
      case e: RuntimeException =>
        e.printStackTrace()
        println("Closing connection.")
        connection.close()
    }
  }
}
