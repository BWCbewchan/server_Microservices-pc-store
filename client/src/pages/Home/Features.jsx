import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const Features = () => {
    const features = [
        {
            icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/237cf2bcb7a8e01189137e8a450ab5374260ce55bfe8bb7841116813200df896?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e",
            title: "Product Support",
            description: "Up to 3 years on-site warranty available for your peace of mind."
        },
        {
            icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/4b14ff3601bcace2e2beb6f6afefa1dee0bf83f3ba18a8f77d2c352c1424db2f?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e",
            title: "Personal Account",
            description: "With big discounts, free delivery and a dedicated support specialist."
        },
        {
            icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/72351be5424e8903d7b24f3969be8a002ca35391729859a795d598f8b6ab1c46?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e",
            title: "Amazing Savings",
            description: "Up to 70% off new Products, you can be sure of the best price."
        }
    ];

    return (
        <div className="container-fluid py-5 text-center" style={{marginTop:'60px',backgroundColor:'#F5F7FF'}}>
            <div className="row justify-content-center ">
                {features.map((feature, index) => (
                    <div key={index} className="col-md-4 d-flex flex-column align-items-center mb-4">
                        <img
                            src={feature.icon}
                            alt={feature.title}
                            className="img-fluid mb-3"
                            style={{ width: "65px" }}
                        />
                        <h3 className="h5 fw-bold">{feature.title}</h3>
                        <p className="text-muted">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Features;
