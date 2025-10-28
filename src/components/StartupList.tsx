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
      color: 'from-blue-500 to-cyan-500',
      
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
      color: 'from-purple-500 to-pink-500',
      
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
      color: 'from-green-500 to-emerald-500',
      
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
      color: 'from-orange-500 to-red-500',
      
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
      color: 'from-indigo-500 to-purple-500',
      
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
      color: 'from-pink-500 to-rose-500',
      
    }
  ];

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || startup.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Белсенді': return 'bg-green-100 text-green-700 border-green-200';
      case 'Өсуде': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Бастапқы': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Стартаптар тізімі</h1>
          <p className="text-slate-600">Барлық финтех жобалар мен олардың көрсеткіштері</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Барлығы:</span>
          <span className="text-2xl font-bold text-slate-900">{filteredStartups.length}</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
           
            <input
              type="text"
              placeholder="Стартап іздеу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="relative">
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-48 pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white cursor-pointer"
            >
              <option value="all">Барлық статус</option>
              <option value="Белсенді">Белсенді</option>
              <option value="Өсуде">Өсуде</option>
              <option value="Бастапқы">Бастапқы</option>
            </select>
          </div>
        </div>
      </div>

      {/* Startups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStartups.map((startup) => (
          <div
            key={startup.id}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${startup.color} p-6 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border-2 border-white/30">
                   
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{startup.name}</h3>
                    <p className="text-white/90 text-sm">{startup.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/30">
                 
                  <span className="text-white font-semibold">{startup.rating}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-600 mb-4 line-clamp-2">{startup.description}</p>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(startup.status)}`}>
                  {startup.status}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  
                  {startup.location}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-600">Прогресс</span>
                  <span className="text-xs font-bold text-slate-900">{startup.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${startup.color} transition-all duration-500`}
                    style={{ width: `${startup.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    
                  </div>
                  <p className="text-lg font-bold text-slate-900">{startup.investment}</p>
                  <p className="text-xs text-slate-500">Инвестиция</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    
                  </div>
                  <p className="text-lg font-bold text-slate-900">{startup.team}</p>
                  <p className="text-xs text-slate-500">Команда</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                   
                  </div>
                  <p className="text-lg font-bold text-slate-900">{startup.founded}</p>
                  <p className="text-xs text-slate-500">Құрылған</p>
                </div>
              </div>

              {/* View Details Button */}
              <button className="w-full bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-900 font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white">
                Толығырақ
                
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStartups.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center">
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">Стартап табылмады</h3>
          <p className="text-slate-600">Іздеу параметрлерін өзгертіп көріңіз</p>
        </div>
      )}
    </div>
  );
}