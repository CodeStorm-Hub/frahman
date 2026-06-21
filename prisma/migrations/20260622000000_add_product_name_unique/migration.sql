-- AlterTable: add unique constraint to Product.name
CREATE UNIQUE INDEX IF NOT EXISTS "Product_name_key" ON "Product"("name");
