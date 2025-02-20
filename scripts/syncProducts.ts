import { db } from "../db";
import { drinks } from "../db/schema";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";

const filePath = path.join(__dirname, "../data/drinks.json");
const fileContent = fs.readFileSync(filePath, "utf-8");
const products = JSON.parse(fileContent);

// Function to sync products
async function syncProducts() {
  for (const product of products) {
    if (!product.name_en || !product.ean) {
      console.log("Skipping product", product);
      continue;
    }
    console.log(product);
    const existingProduct = await db
      .select()
      .from(drinks)
      .where(eq(drinks.ean, product.ean));
    console.log(existingProduct);
    if (existingProduct.length > 0) {
      // Update the existing product
      console.log("Updating existing product");
      const res = await db
        .update(drinks)
        .set({
          name: product.name_en,
          photo: product.photo,
          volume: product.volume,
          description_en: product.description_en,
        })
        .where(eq(drinks.ean, product.ean));
      console.log(res);
    } else {
      console.log("Inserting new product");
      // Insert the new product
      const res = await db.insert(drinks).values({
        ean: product.ean,
        name: product.name_en,
        photo: product.photo,
        volume: product.volume,
        description_en: product.description_en,
      });
      console.log(res);
    }
  }
}

// Execute the sync function
syncProducts()
  .then(() => {
    console.log("Products synced successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error syncing products:", error);
    process.exit(1);
  });
