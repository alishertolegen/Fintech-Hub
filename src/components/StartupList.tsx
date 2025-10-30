import React, { useState } from 'react';

export default function StartupList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const startups = [
    {
      id: 1,
      name: 'PayTech KZ',
      description: 'Қазақстандағы төлем шешімдері',
      category: 'Төлемдер',
      status: 'Белсенді',
      investment: '$500K',
      team: 12,
      progress: 75,
      rating: 4.8,
      location: 'Астана',
      founded: '2023',
    },
    {
      id: 2,
      name: 'CryptoStart',
      description: 'Криптовалюта саудасы платформасы',
      category: 'Blockchain',
      status: 'Өсуде',
      investment: '$1.2M',
      team: 18,
      progress: 60,
      rating: 4.6,
      location: 'Алматы',
      founded: '2022',
    },
    {
      id: 3,
      name: 'FinBot AI',
      description: 'AI негізіндегі қаржылық кеңесші',
      category: 'AI/ML',
      status: 'Белсенді',
      investment: '$800K',
      team: 15,
      progress: 85,
      rating: 4.9,
      location: 'Астана',
      founded: '2023',
    },
    {
      id: 4,
      name: 'InsureTech Pro',
      description: 'Сақтандыру технологиялары',
      category: 'InsurTech',
      status: 'Бастапқы',
      investment: '$300K',
      team: 8,
      progress: 45,
      rating: 4.3,
      location: 'Астана',
      founded: '2024',
    },
    {
      id: 5,
      name: 'LendingHub',
      description: 'P2P несие беру платформасы',
      category: 'Lending',
      status: 'Белсенді',
      investment: '$650K',
      team: 14,
      progress: 70,
      rating: 4.7,
      location: 'Алматы',
      founded: '2023',
    },
    {
      id: 6,
      name: 'WealthWise',
      description: 'Инвестициялық басқару жүйесі',
      category: 'WealthTech',
      status: 'Өсуде',
      investment: '$950K',
      team: 20,
      progress: 65,
      rating: 4.5,
      location: 'Астана',
      founded: '2022',
    },
  ];

  const filteredStartups = startups.filter(startup => {
    const matchesSearch =
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || startup.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div>
        <div>
          <h1>Стартаптар тізімі</h1>
          <p>Барлық финтех жобалар мен олардың көрсеткіштері</p>
        </div>
        <div>
          <span>Барлығы:</span>
          <strong>{filteredStartups.length}</strong>
        </div>
      </div>

      <div>
        <div>
          <div>
            <input
              type="text"
              placeholder="Стартап іздеу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Барлық статус</option>
              <option value="Белсенді">Белсенді</option>
              <option value="Өсуде">Өсуде</option>
              <option value="Бастапқы">Бастапқы</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        {filteredStartups.map((startup) => (
          <div key={startup.id}>
            <div>
              <div>
                <div>
                  <div>
                    <h3>{startup.name}</h3>
                    <p>{startup.category}</p>
                  </div>
                </div>
                <div>
                  <span>{startup.rating}</span>
                </div>
              </div>
            </div>

            <div>
              <p>{startup.description}</p>

              <div>
                <span>{startup.status}</span>
                <span>{startup.location}</span>
              </div>

              <div>
                <div>
                  <span>Прогресс</span>
                  <strong>{startup.progress}%</strong>
                </div>
              </div>

              <div>
                <div>
                  <p>{startup.investment}</p>
                  <p>Инвестиция</p>
                </div>
                <div>
                  <p>{startup.team}</p>
                  <p>Команда</p>
                </div>
                <div>
                  <p>{startup.founded}</p>
                  <p>Құрылған</p>
                </div>
              </div>

              <button>Толығырақ</button>
            </div>
          </div>
        ))}
      </div>

      {filteredStartups.length === 0 && (
        <div>
          <h3>Стартап табылмады</h3>
          <p>Іздеу параметрлерін өзгертіп көріңіз</p>
        </div>
      )}
    </div>
  );
}
