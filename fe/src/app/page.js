'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function HomePage() {
  const { user, logout } = useAuth(); // Get user and logout function from context

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to our Application</h1>
      
      {user ? (
        // If user is logged in
        <div>
          <p>Hello, {user.name}! You are logged in.</p>
          <p>Your email: {user.email}</p>
          <button onClick={() => logout()} style={{ padding: '10px 15px', marginTop: '20px' }}>
            Logout
          </button>
        </div>
      ) : (
        // If user is not logged in
        <div>
          <p>Please log in or register to continue.</p>
          <div style={{ marginTop: '20px' }}>
            <Link href="/login" style={{ marginRight: '10px', padding: '10px 15px', border: '1px solid #ccc', textDecoration: 'none' }}>
              Login
            </Link>
            <Link href="/register" style={{ padding: '10px 15px', border: '1px solid #ccc', textDecoration: 'none' }}>
              Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
