import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';


export default function RegisterPage(){
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [fullName, setFullName] = useState('');
const [error, setError] = useState<string | null>(null);
const { register } = useAuth();
const nav = useNavigate();


const submit = async (e: React.FormEvent) => {
e.preventDefault();
setError(null);
try {
await register(email, password, fullName);
nav('/');
} catch (err: any) {
setError(err.message || 'Тіркелу қатесі');
}
};


return (
<div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
<h2 className="text-xl font-semibold mb-4">Тіркелу</h2>
<form onSubmit={submit} className="space-y-4">
<div>
<label className="block text-sm">Аты-жөні</label>
<input value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full p-2 border rounded" />
</div>
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
<button className="px-4 py-2 bg-green-600 text-white rounded">Тіркелу</button>
<Link to="/login" className="text-sm text-blue-600">Кіру</Link>
</div>
</form>
</div>
);
}