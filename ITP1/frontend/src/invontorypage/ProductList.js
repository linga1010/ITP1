import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './List.css'; // Import the CSS file    
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Import the Admin Navigation Component     

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]); // Define filteredPackages state
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setFilteredPackages(products); // Initialize filtered packages with all products on initial load
  }, [products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDelete = async (sku) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${sku}`);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleEdit = (sku) => {
    const productToEdit = products.find(product => product.sku === sku);
    navigate(`/edit-Product/${sku}`, { state: { product: productToEdit } });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = products.filter((pkg) =>
      pkg.name.toLowerCase().includes(value) || pkg.sku.toLowerCase().includes(value)
    );
    setFilteredPackages(filtered);
  };

  // Calculate the total hand stock value (costPrice * quantity)
  const totalHandStockValue = filteredPackages.reduce((acc, product) => {
    return acc + (Number(product.costPrice) * Number(product.quantity));
  }, 0);

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion /> {/* Add the Admin navigation component here */}
      <div className="main-content">
        <div>
          <h2>Product List</h2>
          
          <input
            placeholder="Search by package name or SKU"
            value={search}
            onChange={handleSearch}
            style={{ width: "300px", marginBottom: "20px" }}
          />
          
          {/* Display total hand stock value */}
          <h3>
            Total Hand Stock Value: ₹{totalHandStockValue.toFixed(2)}
          </h3>
          
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Selling Price</th>
                <th>Cost Price</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map((product) => (
                <tr key={product.sku}>
                  <td>
                    <img src={`http://localhost:5000/${product.image}`} alt="Product" />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.sellingPrice}</td>
                  <td>{product.costPrice}</td>
                  <td>{product.quantity}</td>
                  <td>{product.unit}</td>
                  <td>
                    <button onClick={() => handleEdit(product.sku)} className="edit" 
                      style={{ backgroundColor: "#ffcc00", color: "black" }}>
                      Edit
                    </button>
                    {/* <button onClick={() => handleDelete(product.sku)} className="Delete">Delete</button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
