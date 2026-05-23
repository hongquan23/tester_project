import React, { useEffect, useState } from "react";
import styles from "./login.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, register } from "../api";
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

  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

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

      // 🔹 đảm bảo quay về mode login
      setForgotMode(false);
      setRole("MEMBER");
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
  // 🔹 FORGOT PASSWORD (MOCK)
  // =========================
  const handleForgotPassword = (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      alert("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    alert("Khôi phục mật khẩu (frontend demo)");
    setForgotMode(false);
    setResetEmail("");
    setNewPassword("");
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
          {!forgotMode ? (
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
                toggleShow={() =>
                  setShowPasswordSignIn(!showPasswordSignIn)
                }
              />

              <button type="submit">Sign In</button>

              <p style={{ marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
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
          ) : (
            <form onSubmit={handleForgotPassword}>
              <h1>Reset Password</h1>

              <input
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />

              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                show={showNewPassword}
                toggleShow={() => setShowNewPassword(!showNewPassword)}
              />

              <button type="submit">Update Password</button>

              <button
                type="button"
                onClick={() => setForgotMode(false)}
                style={{
                  border: "none",
                  background: "none",
                  color: "blue",
                  marginTop: 10,
                }}
              >
                Back to Sign In
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