import React, { useEffect, useState } from "react";
import { Input, Button, Card, Row, Col, message } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ViewPackage = () => {
  const { user } = useAuth(); // Get logged-in user
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
    if (!user) {
      message.error("Please log in to add items to the cart.");
      navigate("/login");
      return;
    }

    const cartKey = `cart_user_${user._id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const existingItemIndex = cart.findIndex((item) => item._id === pkg._id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({ ...pkg, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    message.success(`${pkg.name} added to cart.`);
  };

  const handlePlaceOrder = () => {
    navigate("/order");
  };

  const handleBack = () => {
    navigate("/user-home");
  };

  /**
   * Renders the products in a table format:
   * - If there are 1 to 4 products, display them in one row.
   * - If there are more than 4, group them into rows with 4 products per row.
   */
  const renderProducts = (products) => {
    const tableStyle = {
      width: "100%",
      borderCollapse: "collapse",
      border: "1px solid #ccc",
      marginBottom: "10px"
    };

    const rows = [];

    for (let i = 0; i < products.length; i += 4) {
      const batch = products.slice(i, i + 4);
      const cells = batch.map((product, index) => (
        <td
          key={index}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            verticalAlign: "top",
          }}
        >
          {product.productId.name} - {product.quantity} {product.productId.unit}
        </td>
      ));
      rows.push(<tr key={i}>{cells}</tr>);
    }

    return (
      <table style={tableStyle}>
        <tbody>{rows}</tbody>
      </table>
    );
  };

  return (
    <div  style={{ padding: "20px", position: "relative", backgroundColor:" rgba(43, 43, 43, 0.5)"}}>
      <Button
        className="backbutton"
        onClick={handleBack}
        type="default"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "5px 10px",
          minWidth: "auto",
          height: "auto",
          backgroundColor: "#007bff",
          color: "white",
        }}
      >
        ← Back to Home
      </Button>

      <h2 style={{ textAlign: "center" }}>User Package List</h2>

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
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Row gutter={[16, 16]} style={{ width: "100%" }}>
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
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "15px 30px",
          fontSize: "16px",
          zIndex: 1000,
        }}
        onClick={handlePlaceOrder}
      >
        Place Order
      </Button>
    </div>
  );
};

export default ViewPackage;
