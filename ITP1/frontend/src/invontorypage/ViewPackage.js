//veiwpackage
import React, { useEffect, useState } from "react";
import { Input, Button, Card, Row, Col } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewPackage = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate(); // For navigation to the OrderPage

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/packages");
      setPackages(data);
      setFilteredPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = packages.filter((pkg) =>
      pkg.name.toLowerCase().includes(value)
    );
    setFilteredPackages(filtered);
  };

  const addToCart = (pkg) => {
    // Get cart from localStorage or initialize as empty array
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if the package is already in the cart
    const existingItemIndex = cart.findIndex(item => item._id === pkg._id);
    
    if (existingItemIndex > -1) {
      // Package already in cart, increase the quantity
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add the package to cart with quantity 1
      cart.push({ ...pkg, quantity: 1 });
    }

    // Save the updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    console.log("Added to cart:", pkg.name);
  };

  const handlePlaceOrder = () => {
    navigate("/order"); // Redirect to OrderPage
  };

  const renderProducts = (products) => {
    const rows = [];
    for (let i = 0; i < products.length; i += 4) {
      rows.push(
        <Row gutter={[16, 16]} key={i}>
          {products.slice(i, i + 4).map((product, index) => (
            <Col key={index} xs={6} sm={6} md={6} lg={6}>
              <p>
                {product.productId.name} - {product.quantity} {product.productId.unit}
              </p>
            </Col>
          ))}
        </Row>
      );
    }
    return rows;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Package List</h2>

      <Input
        placeholder="Search by package name"
        value={search}
        onChange={handleSearch}
        style={{ width: "300px", marginBottom: "20px" }}
      />

      <Row gutter={[16, 16]}>
        {filteredPackages.map((pkg) => (
          <Col key={pkg._id} xs={24} sm={24} md={24} lg={24}>
            <Card
              hoverable
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
            >
              <Row gutter={[16, 16]} style={{ width: '100%' }}>
                <Col xs={24} sm={8} md={8} lg={8}>
                  <img
                    src={`http://localhost:5000${pkg.image}`}
                    alt="Package"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </Col>
                <Col xs={24} sm={16} md={16} lg={16}>
                  <h3>{pkg.name}</h3>
                  <p>
                    <b>Products:</b>
                  </p>
                  {renderProducts(pkg.products)}
                  <p>
                    <b>Total Price:</b> Rs. {pkg.totalPrice}
                  </p>
                  <p>
                    <b>Discount:</b> {pkg.discount}%
                  </p>
                  <p>
                    <b>Final Price:</b> Rs. {pkg.finalPrice}
                  </p>
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => addToCart(pkg)}
                  >
                    Add to Cart
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      <Button
        type="primary"
        style={{ marginTop: "20px", marginLeft:"1000px", marginBottom: "30px",padding: "20px" }}
        onClick={handlePlaceOrder}
      >
        Place Order
      </Button>
    </div>
  );
};

export default ViewPackage;
