import Product._

import java.sql.{Connection, DriverManager, ResultSet}

object Database {

  def isEmpty(connection: Connection): Boolean = {
    val statement = connection.createStatement()
    val rs = statement.executeQuery("SELECT COUNT(*) FROM product")
    if (rs.next()) {
      rs.getLong(1) == 0
    } else {
      throw new RuntimeException("Failed to count rows in products table")
    }
  }

  def writeNewProduct(connection: Connection): Int = {
    val sql =
      "INSERT INTO product (name, material, color, department, inventory) VALUES (?, ?, ?, ?, ?) RETURNING id"
    val preparedStatement = connection.prepareStatement(sql)

    val product = Product.random()
    preparedStatement.setString(1, product.name)
    preparedStatement.setString(2, product.material)
    preparedStatement.setString(3, product.color)
    preparedStatement.setString(4, product.department)
    preparedStatement.setInt(5, product.inventory)

    val rs = preparedStatement.executeQuery()
    if (rs.next()) {
      val newId = rs.getInt(1)
      println(s"New product (id=$newId): $product")
      newId
    } else {
      throw new RuntimeException(
        "Failed to insert new product, no ID obtained."
      )
    }
  }

  def getSupplierIds(connection: Connection): List[Int] = {
    val statement = connection.createStatement()
    val rs = statement.executeQuery("SELECT id FROM supplier")
    var ids = List.empty[Int]
    while (rs.next()) {
      ids = rs.getInt("id") :: ids
    }
    ids
  }

  def assignProductToSupplier(
      connection: Connection,
      productId: Int,
      supplierId: Int
  ): Unit = {
    val sql =
      "INSERT INTO supplier_products (product_id, supplier_id, price) VALUES (?, ?, ?)"
    val preparedStatement = connection.prepareStatement(sql)
    preparedStatement.setInt(1, productId)
    preparedStatement.setInt(2, supplierId)
    preparedStatement.setInt(3, (new util.Random).nextInt(100000) + 100)
    preparedStatement.executeUpdate()
  }
}
