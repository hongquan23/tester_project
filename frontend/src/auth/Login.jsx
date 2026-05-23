import React, { useEffect, useState } from "react";
import styles from "./login.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, register, forgotPassword, verifyResetCode, resetPassword } from "../api";
import { jwtDecode } from "jwt-decode";

const PasswordInput = ({ value, onChange, placeholder, show, toggleShow }) => (
  <div className={styles.passwordContainer}>
    <input
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
    <span className={styles.togglePassword} onClick={toggleShow}>
      {show ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
);

const AuthForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MEMBER");

  // forgotStep: 0 = tắt, 1 = nhập email, 2 = nhập mã OTP, 3 = nhập mật khẩu mới
  const [forgotStep, setForgotStep] = useState(0);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const [showPasswordSignUp, setShowPasswordSignUp] = useState(false);
  const [showPasswordSignIn, setShowPasswordSignIn] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const signUpButton = document.getElementById("signUp");
    const signInButton = document.getElementById("signIn");
    const container = document.getElementById("loginContainer");

    if (signUpButton && signInButton && container) {
      signUpButton.onclick = () =>
        container.classList.add(styles.rightPanelActive);
      signInButton.onclick = () =>
        container.classList.remove(styles.rightPanelActive);

      if (searchParams.get("mode") === "signup") {
        container.classList.add(styles.rightPanelActive);
      }
    }
  }, [searchParams]);

  // =========================
  // 🔹 SIGN UP (CHỈ MEMBER)
  // =========================
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      alert("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        role: "MEMBER",
      });

      alert("Đăng ký thành công! Vui lòng đăng nhập.");

      // 🔹 reset form signup
      setName("");
      setPassword("");
      setShowPasswordSignUp(false);

      // 🔹 chuyển về SIGN IN
      const container = document.getElementById("loginContainer");
      container.classList.remove(styles.rightPanelActive);

      setShowPasswordSignIn(false);

      // 👉 email giữ nguyên để user khỏi nhập lại
    } catch (err) {
      alert(err.response?.data?.detail || "Đăng ký thất bại");
    }
  };

  // =========================
  // 🔹 SIGN IN
  // =========================
const handleSignIn = async (e) => {
  e.preventDefault();

  try {
    const res = await login({ email, password });
    const { access_token, token_type, role: serverRole } = res.data;

    // Lưu token và role
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("role", serverRole);

    // ⭐ DECODE JWT TOKEN để lấy user_id
    try {
      const decoded = jwtDecode(access_token);
      console.log("🔍 Decoded JWT:", decoded);

      // JWT có thể chứa: sub, user_id, id, hoặc userId
      const userId = decoded.sub || decoded.user_id || decoded.id || decoded.userId;

      if (userId) {
        localStorage.setItem("user_id", userId.toString());
        console.log("✅ Đã lưu user_id:", userId);
      } else {
        console.warn("⚠️ Token không chứa user_id. Decoded data:", decoded);
      }
    } catch (decodeError) {
      console.error("❌ Lỗi decode JWT token:", decodeError);
    }

    // Điều hướng
    if (serverRole === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/member");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Email hoặc mật khẩu không đúng");
  }
};
  // =========================
  // 🔹 FORGOT PASSWORD
  // =========================
  const resetForgotState = () => {
    setForgotStep(0);
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await forgotPassword({ email: resetEmail });
      alert("Mã xác nhận đã được gửi đến email của bạn!");
      setForgotStep(2);
    } catch (err) {
      alert(err.response?.data?.detail || "Không tìm thấy email này trong hệ thống");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await verifyResetCode({ email: resetEmail, code: resetCode });
      setForgotStep(3);
    } catch (err) {
      alert(err.response?.data?.detail || "Mã xác nhận không đúng hoặc đã hết hạn");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      alert("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }
    setForgotLoading(true);
    try {
      await resetPassword({ email: resetEmail, code: resetCode, new_password: newPassword });
      alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      resetForgotState();
    } catch (err) {
      alert(err.response?.data?.detail || "Đặt lại mật khẩu thất bại");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.topBrand}>
        <span className={styles.brandIcon}>🎓</span>
        <span className={styles.brandName}>StudyWithMe</span>
      </div>
      <div className={styles.loginContainer} id="loginContainer">

        {/* ================= SIGN UP ================= */}
        <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
          <form onSubmit={handleSignUp}>
            <h1>Create Account</h1>

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              show={showPasswordSignUp}
              toggleShow={() =>
                setShowPasswordSignUp(!showPasswordSignUp)
              }
            />

            {/* 🔒 Chỉ MEMBER */}
            <select value="MEMBER" disabled>
              <option value="MEMBER">MEMBER</option>
            </select>

            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* ================= SIGN IN ================= */}
        <div className={`${styles.formContainer} ${styles.signInContainer}`}>
          {forgotStep === 0 && (
            <form onSubmit={handleSignIn}>
              <h1>Sign in</h1>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                show={showPasswordSignIn}
                toggleShow={() => setShowPasswordSignIn(!showPasswordSignIn)}
              />

              <button type="submit">Sign In</button>

              <p style={{ marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  style={{
                    border: "none",
                    background: "none",
                    color: "blue",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Forgot Password?
                </button>
              </p>
            </form>
          )}

          {/* BƯỚC 1: Nhập email */}
          {forgotStep === 1 && (
            <form onSubmit={handleSendCode}>
              <h1>Quên mật khẩu</h1>
              <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
                Nhập email tài khoản của bạn, chúng tôi sẽ gửi mã xác nhận 6 số.
              </p>

              <input
                type="email"
                placeholder="Email của bạn"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />

              <button type="submit" disabled={forgotLoading}>
                {forgotLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
              </button>

              <button
                type="button"
                onClick={resetForgotState}
                style={{ border: "none", background: "none", color: "blue", marginTop: 10, cursor: "pointer" }}
              >
                Quay lại đăng nhập
              </button>
            </form>
          )}

          {/* BƯỚC 2: Nhập mã 6 số */}
          {forgotStep === 2 && (
            <form onSubmit={handleVerifyCode}>
              <h1>Nhập mã xác nhận</h1>
              <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
                Mã 6 số đã được gửi đến <strong>{resetEmail}</strong>. Mã có hiệu lực trong 10 phút.
              </p>

              <input
                type="text"
                placeholder="Nhập mã 6 số"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                style={{ letterSpacing: 6, fontSize: 22, textAlign: "center" }}
                required
              />

              <button type="submit" disabled={forgotLoading || resetCode.length < 6}>
                {forgotLoading ? "Đang xác nhận..." : "Xác nhận mã"}
              </button>

              <button
                type="button"
                onClick={() => setForgotStep(1)}
                style={{ border: "none", background: "none", color: "blue", marginTop: 10, cursor: "pointer" }}
              >
                Gửi lại mã
              </button>
            </form>
          )}

          {/* BƯỚC 3: Nhập mật khẩu mới */}
          {forgotStep === 3 && (
            <form onSubmit={handleResetPassword}>
              <h1>Mật khẩu mới</h1>
              <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
                Nhập mật khẩu mới cho tài khoản <strong>{resetEmail}</strong>.
              </p>

              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
                show={showNewPassword}
                toggleShow={() => setShowNewPassword(!showNewPassword)}
              />

              <button type="submit" disabled={forgotLoading}>
                {forgotLoading ? "Đang lưu..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}
        </div>

        {/* ================= OVERLAY ================= */}
        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
              <h1>Welcome Back!</h1>
              <button className="ghost" id="signIn">Sign In</button>
            </div>

            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
              <h1>Hello, Friend!</h1>
              <button className="ghost" id="signUp">Sign Up</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthForm;
