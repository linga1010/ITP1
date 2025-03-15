import React from "react";
import { useNavigate } from "react-router-dom";
import "./Product.css";


const products = [
  { id: 1, name: "Incense Sticks", price: 50 },
  { id: 2, name: "Temple Oil Lamp", price: 150 },
  { id: 3, name: "Holy Threads", price: 30 },
  { id: 4, name: "Pooja Coconut", price: 25 }
];

const ProductPage = ({ addToCart }) => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2>Temple Products</h2>
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product">
            <h4>{product.name}</h4>
            <p>₹{product.price}</p>
            <button onClick={() => addToCart(product)}>Buy</button>
          </div>
        ))}
      </div>
      <div className="footer">
        <button className="next-button" onClick={() => navigate("/orders")}>Next</button>
      </div>
    </div>
  );
};

export default ProductPage;
