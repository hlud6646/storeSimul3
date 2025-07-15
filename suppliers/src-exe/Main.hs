{-# LANGUAGE DeriveAnyClass #-}
{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE RecordWildCards #-}

module Main where

import Control.Concurrent (threadDelay)
import Control.Monad (void)
import Data.ByteString (ByteString)
import Data.ByteString.Char8 (pack)
import Data.Text (Text)
import Database.PostgreSQL.Simple
import Faker
import Faker.Address qualified as FAddress
import Faker.Company qualified as FCompany
import Faker.PhoneNumber qualified as FPhone
import GHC.Generics (Generic)
import System.Environment (getEnv)
import System.Random (randomRIO)

main :: IO ()
main = do
  connectionUrl <- getConnectionString
  conn <- connectPostgreSQL connectionUrl
  loop conn

loop :: Connection -> IO ()
loop conn =
  do
    supplierID <- writeNewSupplier conn
    productIds <- readRandomProducts conn
    writeSupplierProducts conn supplierID productIds
    logSupplier supplierID
    sleep
    loop conn
  where
    sleep = do
      waitTime <- randomRIO (300, 360)
      threadDelay (waitTime * 1000000)
      return ()

-- Data types for database interaction.
-- Note that you can derive ToRow and FromRow for tuples of up to ten elements!
-- Things that you would have to write by hand like
-- instance FromRow Product where
-- fromRow = Product <$> field <*> field <*> field <*> field
-- instance ToRow Supplier where
-- toRow Supplier {..} = [toField supplier_name, toField address, toField phone, toField email]
data Supplier = Supplier
  { supplier_name :: Text,
    address :: Text,
    phone :: Text,
    email :: Text
  }
  deriving (Show, Generic, ToRow, FromRow)

data Product = Product
  { product_name :: Text,
    material :: Text,
    color :: Text,
    department :: Text
  }
  deriving (Show, Generic, ToRow, FromRow)

data SupplierProduct = SupplierProduct
  { supplier_id :: Int,
    product_id :: Int,
    price :: Int
  }
  deriving (Show, Generic, ToRow, FromRow)

-- Fake data generation for suppliers.
fakeSupplier :: Fake Supplier
fakeSupplier = do
  supplier_name <- FCompany.name
  address <- FAddress.fullAddress
  phone <- FPhone.cellPhoneFormat
  email <- FCompany.email
  pure $ Supplier {..}

-- postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]
getConnectionString :: IO ByteString
getConnectionString = do
  user <- getEnv "POSTGRES_USER"
  password <- getEnv "POSTGRES_PASSWORD"
  host <- getEnv "POSTGRES_HOST"
  port <- getEnv "POSTGRES_PORT"
  database <- getEnv "POSTGRES_DB"

  return $
    pack $
      "postgresql://"
        ++ user
        ++ ":"
        ++ password
        ++ "@"
        ++ host
        ++ ":"
        ++ port
        ++ "/"
        ++ database

-- Insert a random supplier and return the new id.
writeNewSupplier :: Connection -> IO Int
writeNewSupplier conn = do
  supplier <- generateNonDeterministic fakeSupplier
  [Only supplierId] <-
    query
      conn
      "INSERT INTO supplier (name, address, phone, email) \
      \ VALUES (?, ?, ?, ?) \
      \ RETURNING id"
      supplier
  return supplierId

-- Pull 20 random product ids from the database.
readRandomProducts :: Connection -> IO [Int]
readRandomProducts conn = do
  ids <- query_ conn "SELECT id FROM product ORDER BY RANDOM() LIMIT 20"
  return $ map fromOnly ids

-- Given a supplier_id and a list of product_ids, record in the database.
-- The price is randomly determined for each product.
writeSupplierProducts :: Connection -> Int -> [Int] -> IO ()
writeSupplierProducts conn supplierID productIds = do
  supplierProducts <-
    mapM
      (\productId -> SupplierProduct (fromIntegral supplierID) productId <$> generateRandomPrice)
      productIds
  void $
    executeMany
      conn
      "INSERT INTO supplier_products (supplier_id, product_id, price) VALUES (?, ?, ?)"
      supplierProducts
  where
    generateRandomPrice = randomRIO (100, 1000000)

-- Log the new supplier.
logSupplier :: Int -> IO ()
logSupplier supplier = do
  putStrLn $ "New supplier with id" <> (show supplier)
