import React, { useContext, useState } from "react";
import { AuthContext } from "./contexts/AuthContext";

type User = { email?: string };

const LoginPage: React.FC = () => {
  const context = useContext(AuthContext);
  const user = context?.user;
  const login = context?.login;
  const logout = context?.logout;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (login) {
      await login(email, password);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {user ? (
        <div>
          <p>Welcome, {typeof user === 'object' && user && 'email' in user ? (user as User).email : "User"}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
};

export default LoginPage;