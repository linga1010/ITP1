import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './List.css'; // Import the CSS file
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Import the Admin Navigation Component

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    setFilteredPackages(packages);
  }, [packages]);

  const fetchPackages = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/packages");
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await axios.delete(`http://localhost:5000/api/packages/${id}`);
        fetchPackages();
      } catch (error) {
        console.error("Error deleting package:", error);
      }
    }
  };

  const handleEdit = (id) => {
    const packageToEdit = packages.find(pkg => pkg._id === id);
    navigate(`/Edit-package/${id}`, { state: { package: packageToEdit } });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = packages.filter((pkg) =>
      pkg.name.toLowerCase().includes(value)
    );
    setFilteredPackages(filtered);
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion /> {/* Add the Admin navigation component here */}

      <div className="main-content">
        <h2>Package List</h2>

        <input
          placeholder="Search by package name"
          value={search}
          onChange={handleSearch}
          style={{ width: "300px", marginBottom: "20px" }}
        />

        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Products</th>
              <th>Total Price</th>
              <th>Discount</th>
              <th>Final Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.map((pkg) => (
              <tr key={pkg._id}>
                <td>
                  <img src={`http://localhost:5000${pkg.image}`} alt="Package" width="50" />
                </td>
                <td>{pkg.name}</td>
                <td>
                  <ul>
                    {pkg.products.map((product, index) => (
                      <li key={index}>
                        {product.productId.name} : {product.quantity} {product.productId.unit}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>Rs. {pkg.totalPrice}</td>
                <td>{pkg.discount}%</td>
                <td>Rs. {pkg.finalPrice}</td>
                <td>
                  <button onClick={() => handleEdit(pkg._id)} className="edit">Edit</button>
                  <button onClick={() => handleDelete(pkg._id)} className="Delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PackageList;
