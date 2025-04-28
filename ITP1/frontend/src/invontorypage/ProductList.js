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


  const handlePrint = () => {
    const logoURL = "/logo.jpeg"; // Your logo path
    
    const newWindow = window.open('', '_blank');
  
    const productHTML = `
      <html>
        <head>
          <title>Product List - Vk Aura</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 40px;
              background-color: #f2f2f2;
              display: flex;
              justify-content: center;
            }
            .container {
              background-color: #ffffff;
              border: 2px solid #ccc;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              padding: 30px;
              max-width: 950px;
              width: 100%;
              margin: auto;
            }
            .company-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
            }
            .company-header img {
              width: 100px;
              height: auto;
              border: 1px solid #ccc;
              padding: 5px;
            }
            .company-header h1 {
              font-size: 28px;
              margin: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            table, th, td {
              border: 1px solid #333;
            }
            th, td {
              padding: 12px;
              text-align: center;
            }
            .totals {
              text-align: right;
              font-size: 18px;
              margin-top: 20px;
            }
            .button-group {
              display: flex;
              justify-content: center;
              gap: 20px;
              margin-top: 40px;
            }
            .print-btn, .cancel-btn, .download-btn {
              padding: 10px 25px;
              font-size: 18px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            }
            .print-btn {
              background-color: #4CAF50;
              color: white;
            }
            .cancel-btn {
              background-color: #f44336;
              color: white;
            }
            .download-btn {
              background-color: #2196F3;
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="container" id="product-content">
            <div class="company-header">
              <h1>Vk Aura</h1>
              <img src="${logoURL}" alt="Company Logo" />
            </div>
  
            <h2 style="text-align: center;">Product List</h2>
  
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Selling Price (₹)</th>
                  <th>Cost Price (₹)</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPackages.map(product => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.sku}</td>
                    <td>${Number(product.sellingPrice).toFixed(2)}</td>
                    <td>${Number(product.costPrice).toFixed(2)}</td>
                    <td>${Number(product.quantity).toFixed(2)}</td>
                    <td>${product.unit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
  
            <div class="totals">
              <p><strong>Total Hand Stock Value:</strong> ₹${totalHandStockValue.toFixed(2)}</p>
            </div>
  
            <div class="button-group">
              <button class="cancel-btn" onclick="window.close()">Cancel</button>
              <button class="download-btn" onclick="downloadHTML()">Download</button>
              <button class="print-btn" onclick="window.print()">Print Product List</button>
            </div>
          </div>
  
          <script>
            function downloadHTML() {
              const element = document.getElementById('product-content');
              const htmlContent = '<html><head><title>Product List</title></head><body>' + element.outerHTML + '</body></html>';
              const blob = new Blob([htmlContent], { type: 'text/html' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'product-list.html';
              link.click();
            }
          </script>
  
        </body>
      </html>
    `;
  
    newWindow.document.write(productHTML);
    newWindow.document.close();
  };

  const handleDownload = () => {
    const element = document.createElement('div');
    const htmlContent = `
      <html>
        <head><title>Product List</title></head>
        <body>
          <h1>Product List - Vk Aura</h1>
          <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Selling Price</th>
                <th>Cost Price</th>
                <th>Quantity</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPackages.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.sku}</td>
                  <td>₹${Number(product.sellingPrice).toFixed(2)}</td>
                  <td>₹${Number(product.costPrice).toFixed(2)}</td>
                  <td>${Number(product.quantity).toFixed(2)}</td>
                  <td>${product.unit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <br/>
          <p><strong>Total Hand Stock Value:</strong> ₹${totalHandStockValue.toFixed(2)}</p>
        </body>
      </html>
    `;
  
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Product-List-VkAura.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p> 
      <div className="main-content">
        <div>
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        Product List</p>
         
        <div style={{ 
  display: 'flex',  
  alignItems: 'center', 
  justifyContent: 'space-between',  
  width: '100%',  
  gap: '20px',
  marginBottom: '20px',
}}>

  <h3 style={{ margin: 0, color: '#374495' }}> Total Hand Stock Value: ₹{totalHandStockValue.toFixed(2)} </h3>

  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <input 
    placeholder="Search by package name or SKU"
    value={search}
    onChange={handleSearch}
    style={{ 
      width: "300px", 
      padding: "8px 12px", 
      border: "1px solid #ccc",
      borderRadius: "6px",
      fontSize: "14px",
    }}
  />

  <button 
    onClick={handlePrint}
    style={{ 
      padding: "8px 16px", 
      backgroundColor: "#374495", 
      color: "white", 
      border: "none", 
      borderRadius: "6px", 
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }}
  >
    🖨️ Print
  </button>

  <button 
    onClick={handleDownload}
    style={{ 
      padding: "8px 16px", 
      backgroundColor: "#2196F3", 
      color: "white", 
      border: "none", 
      borderRadius: "6px", 
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }}
  >
    📥 Download
  </button>
</div>
</div>
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
                  <img src={product.image} alt="Product" style={{ width: "80px", height: "80px" }} />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.sellingPrice}</td>
                  <td>{product.costPrice}</td>
                  <td>{Number(product.quantity).toFixed(2)}</td>
                  <td>{product.unit}</td>
                  <td>
                    <button onClick={() => handleEdit(product.sku)} className="edit" 
                      style={{backgroundColor: "#1E88E5", color: "white" }}>
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
