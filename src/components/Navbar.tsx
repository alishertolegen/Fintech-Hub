import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';


export default function Navbar(){
const { user, logout } = useAuth();
return (
<header className="bg-white shadow">
<div className="container mx-auto px-4 py-3 flex justify-between items-center">
<Link to="/" className="font-bold text-xl">Fintech Hub</Link>
<nav className="flex items-center gap-4">
<Link to="/startups" className="text-sm">Стартаптар</Link>
<Link to="/profile" className="text-sm">Профиль</Link>
{user ? (
<>
<span className="text-sm">{user.fullName || user.email}</span>
<button onClick={logout} className="px-3 py-1 border rounded">Шығу</button>
</>
) : (
<Link to="/login" className="px-3 py-1 border rounded">Кіру</Link>
)}
</nav>
</div>
</header>
);
}