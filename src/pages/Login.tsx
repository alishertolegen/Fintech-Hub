import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';


export default function LoginPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState<string | null>(null);
const { login } = useAuth();
const nav = useNavigate();


const submit = async (e: React.FormEvent) => {
e.preventDefault();
setError(null);
try {
await login(email, password);
nav('/');
} catch (err: any) {
setError(err.message || 'Кіру қате');
}
};


return (
<div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
<h2 className="text-xl font-semibold mb-4">Кіру</h2>
<form onSubmit={submit} className="space-y-4">
<div>
<label className="block text-sm">Email</label>
<input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded" />
</div>
<div>
<label className="block text-sm">Құпия сөз</label>
<input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" />
</div>
{error && <div className="text-red-600">{error}</div>}
<div className="flex items-center justify-between">
<button className="px-4 py-2 bg-blue-600 text-white rounded">Кіру</button>
<Link to="/register" className="text-sm text-blue-600">Тіркелу</Link>
</div>
</form>
</div>
);
}