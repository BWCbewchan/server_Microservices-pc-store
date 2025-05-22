import React, { useState, useEffect } from "react";
import axios from "axios";

export default function OrderDetailModal({ orderId, onClose }) {
    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/orders/${orderId}`);
                setOrderDetail(response.data);
            } catch (err) {
                setError("Lỗi khi lấy chi tiết đơn hàng");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [orderId]);

    return (
        // Overlay Modal
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            {/* Modal container with max height and overflow-y auto */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-semibold">Chi tiết đơn hàng</h2>
                    <button
                        onClick={onClose}
                        className="text-3xl text-gray-500 hover:text-gray-700"
                    >
                        &times;
                    </button>
                </div>
                {/* Content */}
                <div className="px-6 py-4">
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <p>Loading...</p>
                        </div>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="space-y-6">
                            {/* Order ID */}
                            <div>
                                <span className="font-bold">Mã đơn hàng:</span> {orderDetail._id}
                            </div>
                            {/* Customer Information */}
                            <div className="border p-4 rounded">
                                <h3 className="font-semibold text-lg mb-2">Thông tin khách hàng</h3>
                                <p>
                                    <span className="font-bold">Tên:</span> {orderDetail.customer?.name}
                                </p>
                                <p>
                                    <span className="font-bold">Địa chỉ:</span> {orderDetail.customer?.address}
                                </p>
                                <p>
                                    <span className="font-bold">SĐT:</span> {orderDetail.customer?.phone}
                                </p>
                                <p>
                                    <span className="font-bold">Email:</span> {orderDetail.customer?.email}
                                </p>
                            </div>
                            {/* Shipping Information */}
                            <div className="border p-4 rounded">
                                <h3 className="font-semibold text-lg mb-2">Thông tin giao hàng</h3>
                                <p>
                                    <span className="font-bold">Phương thức:</span> {orderDetail.shipping?.method}
                                </p>
                                <p>
                                    <span className="font-bold">Phí vận chuyển:</span>{" "}
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(orderDetail.shipping?.fee)}
                                </p>
                                <p>
                                    <span className="font-bold">Trạng thái:</span> {orderDetail.shipping?.status}
                                </p>
                                <p>
                                    <span className="font-bold">Tracking Number:</span>{" "}
                                    {orderDetail.shipping?.trackingNumber || "N/A"}
                                </p>
                            </div>
                            {/* Payment Information */}
                            <div className="border p-4 rounded">
                                <h3 className="font-semibold text-lg mb-2">Thông tin thanh toán</h3>
                                <p>
                                    <span className="font-bold">Phương thức:</span> {orderDetail.payment?.method}
                                </p>
                                <p>
                                    <span className="font-bold">Trạng thái:</span> {orderDetail.payment?.status}
                                </p>
                            </div>
                            {/* Order Items */}
                            <div className="border p-4 rounded">
                                <h3 className="font-semibold text-lg mb-2">Danh sách sản phẩm</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="px-3 py-2 text-left">Tên sản phẩm</th>
                                                <th className="px-3 py-2 text-left">Số lượng</th>
                                                <th className="px-3 py-2 text-left">Giá</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderDetail.items?.map((item) => (
                                                <tr key={item._id} className="border-b">
                                                    <td className="px-3 py-2">{item.name}</td>
                                                    <td className="px-3 py-2">{item.quantity}</td>
                                                    <td className="px-3 py-2">
                                                        {new Intl.NumberFormat("vi-VN", {
                                                            style: "currency",
                                                            currency: "VND",
                                                        }).format(item.price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Order Summary */}
                            <div className="border p-4 rounded">
                                <h3 className="font-semibold text-lg mb-2">Tóm tắt đơn hàng</h3>
                                <p>
                                    <span className="font-bold">Tổng tiền:</span>{" "}
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(orderDetail.finalTotal)}
                                </p>
                                <p>
                                    <span className="font-bold">Trạng thái đơn hàng:</span> {orderDetail.status}
                                </p>
                                <p>
                                    <span className="font-bold">Ngày tạo:</span>{" "}
                                    {new Date(orderDetail.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {/* Notes */}
                            <div className="border p-4 rounded">
                                <h3 className="font-semibold text-lg mb-2">Ghi chú</h3>
                                <p>
                                    <span className="font-bold">Khách hàng:</span>{" "}
                                    {orderDetail.notes?.customerNote || "Không có"}
                                </p>
                                <p>
                                    <span className="font-bold">Nhà bán:</span>{" "}
                                    {orderDetail.notes?.sellerNote || "Không có"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                {/* Footer */}
                <div className="flex justify-end border-t px-6 py-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
