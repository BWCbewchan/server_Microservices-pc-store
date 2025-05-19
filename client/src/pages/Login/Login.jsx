import "bootstrap/dist/css/bootstrap.min.css";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, currentUser, error } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (currentUser) {
      navigate("/home");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    
    if (result.success) {
      toast.success("Đăng nhập thành công!");
      navigate("/home");
    } else {
      toast.error(result.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Đăng nhập</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" id="rememberMe" />
                  <label className="form-check-label" htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Đăng nhập
                </button>
              </form>
              
              <div className="mt-3 text-center">
                <p>Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link></p>
                <p><Link to="/forgot-password">Quên mật khẩu?</Link></p>
              </div>
              
              <hr className="my-4" />
              
              <div className="d-grid gap-2">
                <button className="btn btn-outline-dark">
                  <i className="fab fa-google me-2"></i> Đăng nhập với Google
                </button>
                <button className="btn btn-outline-primary">
                  <i className="fab fa-facebook-f me-2"></i> Đăng nhập với Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
