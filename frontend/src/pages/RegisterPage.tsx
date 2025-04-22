import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const RegisterPage: React.FC = () => {
  const context = useContext(AuthContext);
  const register = context?.register;
  const loading = context?.loading;
  const error = context?.error;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    if (register) {
      try {
        await register(email, password, name);
        setSuccess(true);
      } catch (err) {
        setSuccess(false);
      }
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {success ? (
        <p>Registration successful! You are now logged in.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            required
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
};

export default RegisterPage;
