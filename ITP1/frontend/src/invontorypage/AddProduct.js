import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "antd";
import "./AddProduct.css";

const AddProduct = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const doublevalue = (setter) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setter(value);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (parseFloat(sellingPrice) <= parseFloat(costPrice)) {
      setErrorMessage("Selling price must be greater than cost price.");
      return;
    }
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("sellingPrice", sellingPrice);
    formData.append("costPrice", costPrice);
    formData.append("quantity", quantity);
    formData.append("unit", unit);
  
    if (image) {
      formData.append("image", image);
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/products/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // If the product is added successfully
      alert("Product added successfully");
      navigate("/product-list");
    } catch (error) {
      // Capture specific error from the backend
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.message); // Display "SKU already exists" message
      } else {
        setErrorMessage("An error occurred. Please try again."); // Fallback for unknown errors
      }
  
      console.error("Error saving product:", error.response ? error.response.data : error);
    }
  };
  

  return (
    <div className="form-container">
      <h2>Add Product</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="form-content">
        <div className="image-upload">
          <label htmlFor="file-upload" className="image-label">
            Browse Photo
          </label>
          <input id="file-upload" type="file" onChange={handleImageChange} style={{ display: "none" }} />
          
          <div className="image-placeholder">
            {previewImage ? (
              <img src={previewImage} alt="Preview" />
            ) : (
              <div className="empty-placeholder">No Image</div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product Name"
              required
            />
          </div>

          <div className="form-group">
            <label>SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="SKU"
              required
            />
          </div>

          <div className="form-group">
            <label>Selling Price</label>
            <input
              type="text"
              value={sellingPrice}
              onChange={doublevalue(setSellingPrice)}
              placeholder="Selling Price"
              required
            />
          </div>

          <div className="form-group">
            <label>Cost Price</label>
            <input
              type="text"
              value={costPrice}
              onChange={doublevalue(setCostPrice)}
              placeholder="Cost Price"
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <Input
              type="text"
              value={quantity}
              onChange={doublevalue(setQuantity)}
              placeholder="Quantity"
            />
          </div>

          <div className="form-group">
            <label>Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="kg">kg</option>
              <option value="pcs">pcs</option>
            </select>
          </div>

          <button type="submit" className="submit-button">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
