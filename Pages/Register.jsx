import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);

    if (!form.email || !form.password) {
      setMessage("Please fill all fields");
      setError(true);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ TEMPORARY SAVE for login page
        sessionStorage.setItem(
          "registerCredentials",
          JSON.stringify(form)
        );

        // ✅ Redirect to login
        navigate("/login");
      } else {
        setMessage(data.msg || "Registration failed");
        setError(true);
      }
    } catch (err) {
      setMessage("Server error. Try again.");
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded"
          >
            Register
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded text-center ${
            error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
