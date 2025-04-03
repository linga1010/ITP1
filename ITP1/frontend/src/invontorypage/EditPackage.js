import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Button, Upload, Select, message } from "antd";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Import the Admin Navigation Component

const { Option } = Select;

const EditPackage = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [image, setImage] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [packageId, setPackageId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // from the URL (route defined as /Edit-Package/:id?)
  // Try to get the package from location.state if available
  const existingPackageFromState = location.state?.package || null;

  // Fetch products from the API
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      message.error("Failed to load products");
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    // If package data was passed via location.state, use it
    if (existingPackageFromState) {
      setPackageId(existingPackageFromState._id);
      form.setFieldsValue({
        name: existingPackageFromState.name,
        discount: existingPackageFromState.discount,
      });

      // Map over products and ensure they contain name, unit, and sellingPrice
      const updatedProducts = existingPackageFromState.products.map((item) => ({
        productId: item.productId._id, // Ensure we have the productId
        name: item.productId.name, // Populate name
        unit: item.productId.unit, // Populate unit
        sellingPrice: item.productId.sellingPrice, // Populate sellingPrice
        quantity: item.quantity, // Retain quantity
      }));
      setSelectedProducts(updatedProducts);
      setImage(existingPackageFromState.image);
      setDiscount(existingPackageFromState.discount);
      calculatePrices(updatedProducts, existingPackageFromState.discount);
    } else if (id) {
      // Otherwise, fetch the package details using the ID from the URL
      axios
        .get(`http://localhost:5000/api/packages/${id}`)
        .then((response) => {
          const pkg = response.data;
          setPackageId(pkg._id);
          form.setFieldsValue({ name: pkg.name, discount: pkg.discount });

          // Map over products and ensure they contain name, unit, and sellingPrice
          const updatedProducts = pkg.products.map((item) => ({
            productId: item.productId._id,
            name: item.productId.name,
            unit: item.productId.unit,
            sellingPrice: item.productId.sellingPrice,
            quantity: item.quantity,
          }));
          setSelectedProducts(updatedProducts);
          setImage(pkg.image);
          setDiscount(pkg.discount);
          calculatePrices(updatedProducts, pkg.discount);
        })
        .catch((error) => {
          message.error("Failed to load package");
        });
    }
  }, [fetchProducts, existingPackageFromState, form, id]);

  const handleSubmit = async (values) => {
    if (!image) return message.error("Please upload an image");
    if (!packageId) return message.error("Package ID is missing");

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("discount", discount.toString());
    formData.append("image", image);
    formData.append("products", JSON.stringify(selectedProducts));

    try {
      await axios.put(
        `http://localhost:5000/api/packages/${packageId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      message.success("Package updated successfully");
      navigate("/packages"); // Redirect to packages list
    } catch (error) {
      console.error("Error updating package:", error.response?.data || error.message);
      message.error(
        "Error updating package: " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const addProductRow = () => {
    setSelectedProducts([
      ...selectedProducts,
      { productId: "", name: "", unit: "", sellingPrice: 0, quantity: 1 },
    ]);
  };

  const handleProductChange = (index, id) => {
    const product = products.find((p) => p._id === id);
    if (!product) return;

    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      productId: id,
      name: product.name,
      unit: product.unit,
      sellingPrice: product.sellingPrice,
      quantity: 1,
    };

    setSelectedProducts(updatedProducts);
    calculatePrices(updatedProducts, discount);
  };

  const handleQuantityChange = (index, quantity) => {
    // Allow decimal input while typing (no immediate parsing, allow the user to type normally)
    if (quantity === "" || /^[0-9]*\.?[0-9]{0,2}$/.test(quantity)) {
      setSelectedProducts((prev) => {
        const updatedProducts = [...prev];
        updatedProducts[index].quantity = quantity; // Keep as string temporarily
        calculatePrices(updatedProducts, discount); // Recalculate prices
        return updatedProducts;
      });
    }
  };

  const removeProductRow = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
    calculatePrices(updatedProducts, discount);
  };

  const calculatePrices = (selected, discount) => {
    let total = selected.reduce(
      (sum, item) => sum + item.sellingPrice * item.quantity,
      0
    );
    let final = discount ? total - total * (discount / 100) : total;
    setTotalPrice(total);
    setFinalPrice(final);
  };

  return (
    <div className="admin-dashboard-container">
    <Adminnaviagtion /> {/* Add the Admin navigation component here */}

    <div className="main-content">
    <div>
      <h2>Edit Package</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Package Name"
          rules={[{ required: true, message: "Enter package name" }]}
        >
          <Input />
        </Form.Item>

        <Button type="dashed" onClick={addProductRow} style={{ marginBottom: 20, backgroundColor: "#ffcc00", color: "black" }}>
          + Add Product
        </Button>

        {selectedProducts.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: 10 }}>
            <Select
              showSearch
              style={{ width: "40%" }}
              value={item.productId || undefined}
              placeholder="Search and select product"
              onChange={(value) => handleProductChange(index, value)}
              filterOption={(input, option) =>
                option.children
                  ?.toString()
                  ?.toLowerCase()
                  ?.includes(input.toLowerCase())
              }
            >
              {products.map((product) => (
                <Option key={product._id} value={product._id}>
                  {`${product.name || ""} - ${product.sku || ""}`}
                </Option>
              ))}
            </Select>

            <span>{item.unit}</span>
            <span>Rs. {item.sellingPrice || 0}</span>
            <span>quantity</span>
            <Input
              type="text"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
              placeholder="Enter quantity"
              style={{ width: "100px" }}
            />
            <span>{item.quantity}</span>
            <Button type="link" danger onClick={() => removeProductRow(index)}>
              Remove
            </Button>
          </div>
        ))}

        <Form.Item label="Discount">
          <Input
            value={discount}
            onChange={(e) => {
              const newDiscount = parseFloat(e.target.value) || 0;
              setDiscount(newDiscount);
              calculatePrices(selectedProducts, newDiscount); // Recalculate prices on discount change
            }}
          />
        </Form.Item>

        <Form.Item label="Total Price">
          <Input value={totalPrice} readOnly />
        </Form.Item>

        <Form.Item label="Final Price">
          <Input value={finalPrice} readOnly />
        </Form.Item>

        <Form.Item label="Upload Image">
          <Upload
            beforeUpload={(file) => {
              setImage(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button>Upload Image</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button style={{ backgroundColor: "#ffcc00", color: "black" }} type="primary" htmlType="submit">
            Update Package
          </Button>
        </Form.Item>
      </Form>
    </div>
    </div>
    </div>
  );
};

export default EditPackage;
