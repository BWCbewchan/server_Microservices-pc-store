import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import PropTypes from "prop-types";

export default function DefaultLayout({ children }) {
  return (
    <>
      <Header />
      <div className="default-layout w-100">{children}</div>
      <Footer />
    </>
  );
}

DefaultLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
