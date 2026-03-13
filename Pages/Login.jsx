import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || "Login failed");
        setError(true);
        return;
      }

      // STORE TOKEN
      const token = data.token || data?.data?.token;
      if (!token) {
        setMessage("Login successful, but token not found.");
        setError(true);
        return;
      }

      localStorage.setItem("token", token);

      // STORE USER
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setMessage("Login successful!");
      setError(false);

      // ROLE-BASED REDIRECT
     const role = data.user?.role;

if (role === "admin") {
  navigate("/dashboard");
} else if (role === "police") {
  navigate("/bar");
} else if (role === "user") {
  navigate("/citizen"); // navigate to citizen dashboard
} else {
  navigate("/"); // fallback for unknown roles
}

    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again.");
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded text-center ${
              error
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
