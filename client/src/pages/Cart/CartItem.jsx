import * as React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const CartItem = ({ name ,image, description, price, quantity, isChecked, onToggle, onEdit, onRemove, onQuantityChange }) => {
    const [currentQuantity, setCurrentQuantity] = React.useState(quantity);

    const handleQuantityChange = (e) => {
        const updatedQuantity = Math.max(1, parseInt(e.target.value) || 1);
        setCurrentQuantity(updatedQuantity);
        onQuantityChange && onQuantityChange(description, updatedQuantity);
    };

    return (
        <div
            className="d-flex align-items-center mt-4"
            style={{ borderBottom: "1px solid #ddd", paddingBottom: "16px" }}
        >
            {/* Checkbox để chọn sản phẩm */}
            <div style={{ flex: 0.2, textAlign: "center" }}>
                <input type="checkbox" checked={isChecked} onChange={onToggle} />
            </div>
            <div className="d-flex align-items-center" style={{ flex: 2 }}>
                <img
                    src={image}
                    alt={description}
                    style={{ width: "120px", height: "120px", objectFit: "contain", marginRight: "16px" }}
                />
                <div style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", lineHeight: "1.5" }}>
                   
                    {description}
                </div>
            </div>

            <div style={{ flex: 1, textAlign: "center", fontWeight: "700", fontSize: "16px" }}>
                ${price}
            </div>

            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <input
                    type="number"
                    value={currentQuantity}
                    min="1"
                    onChange={handleQuantityChange}
                    style={{ width: "60px", textAlign: "center", border: "1px solid #ccc", borderRadius: "4px", padding: "4px" }}
                />
            </div>

            <div style={{ flex: 1, textAlign: "center", fontWeight: "700", fontSize: "16px" }}>
                ${(currentQuantity * parseFloat(price.replace(",", ""))).toFixed(2)}
            </div>

            <div className="d-flex flex-column ms-3">
                <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/dca2cde7eb38fba8829b733ffab8637fd3d18f174f083096d94c5abe7b935cac"
                    alt="Edit item"
                    style={{ width: "27px", cursor: "pointer", marginBottom: "8px" }}
                    onClick={onRemove}
                />
                <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/d0d9809920f5bf39ba89eb94c5ee6c2a681622ed8a7b386caeed3b983f39cfb6"
                    alt="Remove item"
                    style={{ width: "27px", cursor: "pointer" }}
                    onClick={onEdit}
                />
            </div>
        </div>
    );
};

export default CartItem;
