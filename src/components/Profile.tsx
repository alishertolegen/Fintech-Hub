import React from 'react';
import { Mail, Phone, MapPin, Briefcase, User } from 'lucide-react';

const user = {
  email: 'user2@example.com',
  password: '12345', // пароль здесь только для соответствия модели — не отображаем
  role: 'founder',
  name: 'Alisher',
  company: 'MyStartup',
  bio: 'Fintech founder',
  avatarUrl: '',
  phone: '+77001234567',
  location: 'Astana',
};

type InitialsAvatarProps = {
  name?: string;
  size?: number;
};

function InitialsAvatar({ name = '', size = 64 }: InitialsAvatarProps) {
  const initials = (name)
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      aria-hidden
      className={`flex items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-100 font-semibold`} 
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-6">
          <div className="shrink-0">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <InitialsAvatar name={user.name} size={80} />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{user.name}</h1>

              <span className="inline-flex items-center text-sm py-1 px-2 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {user.role}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              <Briefcase className="inline-block mr-2" size={14} /> {user.company}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{user.bio}</p>
          </div>

          <div className="text-right">
            {/* Можно показать быструю кнопку для взаимодействий */}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Mail className="mt-1" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
              <div className="text-sm font-medium">{user.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-1" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Телефон</div>
              <div className="text-sm font-medium">{user.phone}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-1" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Орналасқан жері</div>
              <div className="text-sm font-medium">{user.location}</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Компания</h2>
          <p className="mt-1 text-sm font-medium">{user.company}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Биография</h2>
          <p className="mt-1 text-sm">{user.bio}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Остальная информация</h2>
          <ul className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <User size={14} /> Роль: <span className="ml-1 font-medium">{user.role}</span>
            </li>
            <li className="flex items-center gap-2">
              <Briefcase size={14} /> Компания: <span className="ml-1 font-medium">{user.company}</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
