import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductPage from "./Product.jsx";
import OrderPage from "./Order.jsx";
import PaymentPage from "./Payment.jsx";
import OrderHistoryPage from "./OrderHistory.jsx";
import PaymentDetails from "./paymentDetails";


const App = () => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(cart.map((item) => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const increaseQuantity = (id) => {
    setCart(cart.map((item) => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decreaseQuantity = (id) => {
    setCart(cart.map((item) => 
      item.id === id && item.quantity > 1 
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductPage addToCart={addToCart} />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/payment-details" element={<PaymentDetails />} />
        <Route 
          path="/orders" 
          element={
            <OrderPage 
              cart={cart} 
              increaseQuantity={increaseQuantity} 
              decreaseQuantity={decreaseQuantity} 
              removeFromCart={removeFromCart} 
            />
         
          } 
        />
      </Routes>
    </Router>
    
  );
};

export default App;
