import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const GlobalContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalContext = () => useContext(GlobalContext);

export default function GlobalProvider({ children }) {
  const [openForm, setOpenForm] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);


  return (
    <GlobalContext.Provider
      value={{
        openForm,
        setOpenForm, productToUpdate, setProductToUpdate
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

GlobalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
