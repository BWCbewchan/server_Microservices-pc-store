import React from "react";
import { Link } from "react-router-dom";

const FooterLinkItem = ({ name, link }) => {
    return (
        <Link
            to={link}
            style={{
                color: "white",
                textDecoration: "none",
                display: "block",
                fontSize: "14px",
                marginBottom: "8px",
            }}
        >
            {name}
        </Link>
    );
};

export default FooterLinkItem;
