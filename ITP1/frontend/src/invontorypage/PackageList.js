import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Table } from "antd";
import axios from "axios";
import './List.css'; // Import the CSS file

const PackageList = () => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/packages");
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const deletePackage = async (id) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await axios.delete(`http://localhost:5000/api/packages/${id}`);
        fetchPackages();
      } catch (error) {
        console.error("Error deleting package:", error);
      }
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      render: (text) => (
        <img src={`http://localhost:5000${text}`} alt="Package" width="50" />
      ),
    },
    { title: "Name", dataIndex: "name" },
    {
      title: "Products",
      dataIndex: "products",
      render: (products) => (
        <ul>
          {products.map((product, index) => (
            <li key={index}>
              {product.productId.name} : {product.quantity} {product.productId.unit}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      render: (price) => `Rs. ${price}`,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      render: (discount) => `${discount}%`,
    },
    {
      title: "Final Price",
      dataIndex: "finalPrice",
      render: (price) => `Rs. ${price}`,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Link to={`/Edit-package/${record._id}`}>
            <Button type="primary">Edit</Button>
          </Link>
          <Button
            type="danger"
            onClick={() => deletePackage(record._id)}
            style={{ marginLeft: 10 }}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Package List</h2>
      <Link to="/add-package">
        <Button type="primary" className="add-button">
          Add Package
        </Button>
      </Link>
      <Table dataSource={packages} columns={columns} rowKey="_id" />
    </div>
  );
};

export default PackageList;
