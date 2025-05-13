import React, { useState, useEffect } from "react";

const generateRandomSpecs = () => {
    const cpus = [
        "Intel Core i5-10400",
        "Intel Core i7-10700K",
        "AMD Ryzen 5 3600",
        "AMD Ryzen 7 3700X"
    ];

    const featuredOptions = ["Yes", "No"];

    const ioPorts = [
        "3 x USB 3.0, 1 x HDMI",
        "2 x USB-C, 1 x Ethernet",
        "4 x USB 2.0, 2 x HDMI"
    ];

    const randomCPU = cpus[Math.floor(Math.random() * cpus.length)];
    const randomFeatured = featuredOptions[Math.floor(Math.random() * featuredOptions.length)];
    const randomIOPorts = ioPorts[Math.floor(Math.random() * ioPorts.length)];

    return {
        CPU: randomCPU,
        Featured: randomFeatured,
        "I/O Ports": randomIOPorts,
    };
};

const FakeSpecs = () => {
    const [specs, setSpecs] = useState({
        CPU: "N/A",
        Featured: "N/A",
        "I/O Ports": "N/A",
    });

    useEffect(() => {
        // Khi component được mount, tạo ra specs ngẫu nhiên
        setSpecs(generateRandomSpecs());
    }, []);

    return (
        <table className="table mt-3 border" style={{ maxWidth: "400px" }}>
            <tbody>
                <tr>
                    <th className="p-2 text-start" style={{ backgroundColor: "#f1f1f1", width: "150px" }}>CPU</th>
                    <td className="p-2">{specs.CPU}</td>
                </tr>
                <tr>
                    <th className="p-2 text-start" style={{ backgroundColor: "#f1f1f1" }}>Featured</th>
                    <td className="p-2">{specs.Featured}</td>
                </tr>
                <tr>
                    <th className="p-2 text-start" style={{ backgroundColor: "#f1f1f1" }}>I/O Ports</th>
                    <td className="p-2">{specs["I/O Ports"]}</td>
                </tr>
            </tbody>
        </table>
    );
};

export default FakeSpecs;
