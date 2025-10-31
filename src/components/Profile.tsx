import React from 'react';
import { User, Mail, Phone, Building2, Calendar, Award, Briefcase, MapPin } from 'lucide-react';

export default function Profile() {
  const profile = {
    name: 'Асан Асанов',
    email: 'asan.asanov@aifc.kz',
    phone: '+7 (777) 123-45-67',
    company: 'AIFC Administration',
    position: 'Fintech Hub Manager',
    location: 'Астана, Қазақстан',
    joinDate: '15 Қаңтар 2024',
    bio: 'Финтех экожүйесін дамытуға және жаңа стартаптарды қолдауға бағытталған менеджер. 5 жылдық тәжірибе бар.',
  };

  const stats = [
    { label: 'Жобалар', value: '12', icon: Briefcase },
    { label: 'Жетістіктер', value: '8', icon: Award },
    { label: 'Бағалау', value: '4.8', icon: Award },
  ];

  return (
    <div>
      <div>
        <div>
          <div>
            <div>
              <User />
            </div>
            <div>
              <h1>{profile.name}</h1>
              <p>{profile.position}</p>
              <p>
                <Building2 />
                {profile.company}
              </p>
            </div>
          </div>
        </div>

        <div>
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div>
                <stat.icon />
              </div>
              <p>{stat.value}</p>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2>Жеке мәліметтер</h2>

        <div>
          <div>
            <label>
              <Mail />
              Email
            </label>
            <p>{profile.email}</p>
          </div>

          <div>
            <label>
              <Phone />
              Телефон
            </label>
            <p>{profile.phone}</p>
          </div>

          <div>
            <label>
              <MapPin />
              Орналасқан жері
            </label>
            <p>{profile.location}</p>
          </div>

          <div>
            <label>
              <Calendar />
              Қосылған күні
            </label>
            <p>{profile.joinDate}</p>
          </div>
        </div>

        <div>
          <label>Өзім туралы</label>
          <p>{profile.bio}</p>
        </div>
      </div>

      <div>
        <h2>Соңғы белсенділік</h2>
        <div>
          {[
            { action: 'PayTech KZ жобасын мақұлдады', time: '2 сағат бұрын' },
            { action: 'Жаңа есеп қосты', time: '1 күн бұрын' },
            { action: 'Профильді жаңартты', time: '3 күн бұрын' },
          ].map((item, idx) => (
            <div key={idx}>
              <div />
              <div>
                <p>{item.action}</p>
                <p>{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
