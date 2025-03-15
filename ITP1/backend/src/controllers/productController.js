import Product from '../models/Product.js';
import path from 'path';
import fs from 'fs';

// ✅ Utility to delete an image file
const deleteImage = (imagePath) => {
  if (imagePath) {
    try {
      fs.unlinkSync(path.resolve(imagePath));
    } catch (err) {
      console.error('Error deleting image file:', err);
    }
  }
};

// ✅ Add a new product
const addProduct = async (req, res) => {
  try {
    const { name, sku, sellingPrice, costPrice, quantity, unit } = req.body;

    // Check for duplicate SKU
    if (await Product.findOne({ sku })) {
      return res.status(400).json({ message: "SKU already exists. Please use a unique SKU." });
    }

    const imagePath = req.file?.path; // Handle image if uploaded

    const newProduct = new Product({
      name,
      sku,
      sellingPrice,
      costPrice,
      quantity,
      unit,
      image: imagePath,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update product by SKU
const updateProduct = async (req, res) => {
  try {
    const { sku } = req.params;
    const { name, sellingPrice, costPrice, quantity, unit } = req.body;

    const existingProduct = await Product.findOne({ sku });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle new image and delete the old one if uploaded
    if (req.file) {
      deleteImage(existingProduct.image);
      existingProduct.image = req.file.path;
    }

    // Update fields
    Object.assign(existingProduct, { name, sellingPrice, costPrice, quantity, unit });

    await existingProduct.save();
    res.status(200).json({ message: "Product updated successfully", product: existingProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete product by SKU
const deleteProduct = async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOneAndDelete({ sku });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image if it exists
    deleteImage(product.image);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { addProduct, updateProduct, deleteProduct, getProducts };
