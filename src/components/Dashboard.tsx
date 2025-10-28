import React from 'react';
import { TrendingUp, Users, DollarSign, Building2, Activity, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { 
      icon: Building2, 
      label: 'Жалпы стартаптар', 
      value: '48', 
      change: '+12%', 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      icon: TrendingUp, 
      label: 'Белсенді жобалар', 
      value: '32', 
      change: '+8%', 
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      icon: DollarSign, 
      label: 'Инвестиция', 
      value: '$2.4M', 
      change: '+23%', 
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      icon: Users, 
      label: 'Қолданушылар', 
      value: '156', 
      change: '+5%', 
      color: 'from-orange-500 to-red-500' 
    },
  ];

  const recentActivity = [
    { 
      title: 'PayTech KZ', 
      action: 'Жаңа аралық есеп жіберілді', 
      time: '2 сағат бұрын', 
      color: 'bg-blue-500' 
    },
    { 
      title: 'CryptoStart', 
      action: 'Инвестиция алды', 
      time: '5 сағат бұрын', 
      color: 'bg-green-500' 
    },
    { 
      title: 'FinBot AI', 
      action: 'Жаңа команда мүшесі қосылды', 
      time: '1 күн бұрын', 
      color: 'bg-purple-500' 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Бақылау тақтасы</h1>
        <p className="text-slate-600">AIFC Fintech Hub статистикасы мен көрсеткіштері</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-lg">
                {stat.change}
              </span>
            </div>
            <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Activity and Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Соңғы белсенділік
          </h3>
          <div className="space-y-4">
            {recentActivity.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                <div className={`w-2 h-2 ${item.color} rounded-full mt-2 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.action}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Жүйе туралы
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Жүйе жұмыс істеп тұр</span>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm mb-2">
                AIFC Fintech Hub - финтех стартаптарды басқару және мониторингілеу үшін 
                арналған заманауи платформа.
              </p>
              <p className="text-xs opacity-80 mt-3">Версия 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}