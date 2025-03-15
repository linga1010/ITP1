import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Select, message } from 'antd';

const { Option } = Select;

const CreateInvoice = () => {
  const [form] = Form.useForm(); // Ant Design form instance
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [amountAfterDiscount, setAmountAfterDiscount] = useState(0);

  const todayDate = new Date().toISOString().split('T')[0]; // Format to YYYY-MM-DD

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        message.error('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

  const addProductRow = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find((product) => product._id === productId);
    if (!selectedProduct) return;

    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      productId,
      productName: selectedProduct.name,
      unit: selectedProduct.unit,
      rate: selectedProduct.sellingPrice,
      amount: selectedProduct.sellingPrice * updatedProducts[index].quantity,
    };

    setSelectedProducts(updatedProducts);
    calculateTotal(updatedProducts, discount);
  };

  const handleQuantityChange = (index, quantity) => {
    // Allow input with up to 2 decimal places
    if (quantity === "" || /^[0-9]*\.?[0-9]{0,2}$/.test(quantity)) {
      setSelectedProducts((prev) => {
        const updatedProducts = [...prev];
        updatedProducts[index].quantity = quantity; // Keep as string temporarily
        updatedProducts[index].amount = updatedProducts[index].rate * quantity; // Update the amount
        calculateTotal(updatedProducts, discount); // Recalculate prices
        return updatedProducts;
      });
    }
  };
  

  const handleDiscountChange = (value) => {
    // Ensure the value is numeric and within the range 0-100
    value = Math.max(0, Math.min(100, value)); // Limit the value between 0 and 100
  
    setDiscount(value);
    calculateTotal(selectedProducts, value);
  };

  const calculateTotal = (updatedProducts, discountValue) => {
    let total = updatedProducts.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (total * discountValue) / 100;
    const finalAmount = total - discountAmount;

    setTotalAmount(total);
    setAmountAfterDiscount(finalAmount);
  };

  const handleSubmit = async (values) => {
    if (selectedProducts.length === 0) {
      message.error("Please add at least one product");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/invoices', {
        customerName: values.customerName,
        invoiceDate: values.invoiceDate,
        discount: values.discount || 0,
        items: selectedProducts,
      });
      message.success('Invoice created successfully');
      form.resetFields();
      setSelectedProducts([]);
      setTotalAmount(0);
      setAmountAfterDiscount(0);
    } catch (error) {
      console.error('Error creating invoice:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Error creating invoice');
    }
  };
  

  const removeProductRow = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
    calculateTotal(updatedProducts, discount); // Recalculate total after removal
  };

  return (
    <div>
      <h2>Create Invoice</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Customer Name" name="customerName" rules={[{ required: true, message: 'Customer name is required' }]} >
          <Input placeholder="Enter customer name" />
        </Form.Item>

        <Form.Item label="Invoice Date" name="invoiceDate" initialValue={todayDate} rules={[{ required: true, message: 'Invoice date is required' }]} >
          <Input type="date" disabled />
        </Form.Item>

        <Button type="dashed" onClick={addProductRow}>
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
              filterOption={(input, option) => option.children?.toString()?.toLowerCase()?.includes(input.toLowerCase())}
            >
              {products.map((product) => (
                <Option key={product._id} value={product._id}>
                  {`${product.name || ""} - ${product.sku || ""}`}
                </Option>
              ))}
            </Select>

            <Input
              type="text" // Use text type to avoid increment/decrement buttons
              value={item.quantity}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
              min={0.01}
              style={{ width: "100px" }}
            />

            <span style={{ marginLeft: '10px' }}>{item.unit || "unit"}</span> {/* Display unit */}

            <span style={{ marginLeft: '10px' }}>Rate: Rs. {item.rate || 0}</span>

            <span style={{ marginLeft: '10px' }}>Amount: Rs. {item.amount.toFixed(2) || 0}</span> {/* Format amount */}

            <Button type="link" danger onClick={() => removeProductRow(index)}>
              Remove
            </Button>
          </div>
        ))}

<Form.Item label="Discount (%)" name="discount">
  <Input
    type="number"
    min="0"
    max="100" // Optional: Add a max attribute for UI validation
    placeholder="Enter discount percentage"
    value={discount}
    onChange={(e) => handleDiscountChange(Number(e.target.value))}
  />
</Form.Item>


        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Invoice
          </Button>
        </Form.Item>
      </Form>

      <div>
        <h3>Total Amount: Rs. {totalAmount.toFixed(2)}</h3> {/* Format total amount */}
        <h3>Amount After Discount: Rs. {amountAfterDiscount.toFixed(2)}</h3> {/* Format after discount */}
      </div>
    </div>
  );
};

export default CreateInvoice;
