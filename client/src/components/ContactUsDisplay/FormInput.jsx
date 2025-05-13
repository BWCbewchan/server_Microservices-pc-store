const FormInput = ({
    label,
    required,
    type = "text",
    placeholder,
    className = "",
  }) => {
    return (
      <div className="form-group">
        <label className="form-label fw-semibold">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <input
          type={type}
          className={`form-control ${className}`}
          placeholder={placeholder}
        />
      </div>
    );
  };
  
  export default FormInput;
  