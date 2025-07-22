"use client"
import { useState } from "react";

export default function Step2Products({ data, onBack, onNext }) {
  const [products, setProducts] = useState(data || []);
  const [newProduct, setNewProduct] = useState({ name: "" });

  // เพิ่ม/ลบสินค้า
  const addProduct = () => {
    if (!newProduct.name) return;
    setProducts((prev) => [...prev, newProduct]);
    setNewProduct({ name: "" });
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <h2 className="font-bold mb-4">ข้อมูลสินค้า</h2>
      <div className="mb-3">
        <input
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          placeholder="ชื่อสินค้า"
          className="input mr-2"
        />
        <button type="button" className="btn btn-secondary" onClick={addProduct}>
          เพิ่ม
        </button>
      </div>
      <ul>
        {products.map((prod, idx) => (
          <li key={idx}>{prod.name}</li>
        ))}
      </ul>
      <div className="flex justify-between mt-4">
        <button type="button" className="btn" onClick={onBack}>
          ย้อนกลับ
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNext(products)}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
