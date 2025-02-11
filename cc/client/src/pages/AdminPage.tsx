import { useEffect, useState } from "react";
import AdminPanel from "@/components/AdminPanel";
import { useSocket } from "@/contexts/SocketContext";
import { useMatch } from "@/contexts/MatchContext";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/check-admin');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-header">🔐 Admin Login</div>
          <input 
            type="password" 
            className="login-input" 
            placeholder="Enter Password" 
            required 
          />
          <button type="submit" className="login-button">Login</button>
          <div className="login-error" style={{ display: 'none' }}></div>
        </form>
      </div>
    );
  }

  return <AdminPanel />;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = form.querySelector('input')?.value;

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setIsAuthenticated(true);
      } else {
        const errorDiv = form.querySelector('.login-error') as HTMLElement;
        errorDiv.textContent = 'Invalid password';
        errorDiv.style.display = 'block';
        (form.querySelector('input') as HTMLInputElement).value = '';
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }
}
