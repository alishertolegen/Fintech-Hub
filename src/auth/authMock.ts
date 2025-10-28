export type MockUser = { id: string; email: string; fullName?: string; role?: string };


const LS_USERS = 'mock_users_v1';
const LS_TOKEN = 'mock_token_v1';


function readUsers(): MockUser[] {
try { return JSON.parse(localStorage.getItem(LS_USERS) || '[]'); } catch { return []; }
}
function writeUsers(u: MockUser[]) { localStorage.setItem(LS_USERS, JSON.stringify(u)); }


export async function mockRegister(email: string, password: string, fullName?: string) {
// simple mock: store email+password in users list (password stored in plain for mock only)
const users = readUsers() as any[];
if (users.find(x => x.email === email)) throw new Error('Пайдаланушы бар');
const id = Math.random().toString(36).slice(2, 9);
const user = { id, email, fullName, role: 'STARTUP_FOUNDER', password };
users.push(user);
writeUsers(users);
const token = btoa(JSON.stringify({ id, email }));
localStorage.setItem(LS_TOKEN, token);
return { token, user: { id, email, fullName, role: 'STARTUP_FOUNDER' } };
}


export async function mockLogin(email: string, password: string) {
const users = readUsers() as any[];
const found = users.find(x => x.email === email && x.password === password);
if (!found) throw new Error('Email немесе пароль қате');
const token = btoa(JSON.stringify({ id: found.id, email: found.email }));
localStorage.setItem(LS_TOKEN, token);
return { token, user: { id: found.id, email: found.email, fullName: found.fullName, role: found.role } };
}


export function getCurrentUserFromToken(): MockUser | null {
const t = localStorage.getItem(LS_TOKEN);
if (!t) return null;
try { const p = JSON.parse(atob(t)); return { id: p.id, email: p.email }; } catch { return null; }
}


export function logoutMock() { localStorage.removeItem(LS_TOKEN); }