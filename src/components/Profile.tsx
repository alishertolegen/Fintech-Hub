import React, { useState } from 'react';


export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Асан Асанов',
    email: 'asan.asanov@aifc.kz',
    phone: '+7 (777) 123-45-67',
    company: 'AIFC Administration',
    position: 'Fintech Hub Manager',
    location: 'Астана, Қазақстан',
    joinDate: '15 Қаңтар 2024',
    bio: 'Финтех экожүйесін дамытуға және жаңа стартаптарды қолдауға бағытталған менеджер. 5 жылдық тәжірибе бар.',
  });

  const stats = [
    
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border-4 border-white/30">
                
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                <p className="text-xl text-white/90 mb-1">{profile.position}</p>
                <p className="text-white/80 flex items-center gap-2">
                  
                  {profile.company}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-xl transition flex items-center gap-2 border border-white/30"
            >
              {isEditing ? (
                <>
                  
                  Болдырмау
                </>
              ) : (
                <>
                  
                  Өңдеу
                </>
              )}
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                
                </div>
                
              
            ))}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Жеке мәліметтер</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            ) : (
              <p className="text-slate-900 text-lg px-4 py-3 bg-slate-50 rounded-xl">{profile.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              
              Телефон
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            ) : (
              <p className="text-slate-900 text-lg px-4 py-3 bg-slate-50 rounded-xl">{profile.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              
              Орналасқан жері
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            ) : (
              <p className="text-slate-900 text-lg px-4 py-3 bg-slate-50 rounded-xl">{profile.location}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              
              Қосылған күні
            </label>
            <p className="text-slate-900 text-lg px-4 py-3 bg-slate-50 rounded-xl">{profile.joinDate}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Өзім туралы</label>
          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          ) : (
            <p className="text-slate-700 px-4 py-3 bg-slate-50 rounded-xl leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition flex items-center gap-2 shadow-lg"
            >
              
              Сақтау
            </button>
          </div>
        )}
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Соңғы белсенділік</h2>
        <div className="space-y-4">
          {[
            { action: 'PayTech KZ жобасын мақұлдады', time: '2 сағат бұрын', color: 'bg-blue-500' },
            { action: 'Жаңа есеп қосты', time: '1 күн бұрын', color: 'bg-green-500' },
            { action: 'Профильді жаңартты', time: '3 күн бұрын', color: 'bg-purple-500' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition">
              <div className={`w-3 h-3 ${item.color} rounded-full flex-shrink-0`}></div>
              <div className="flex-1">
                <p className="text-slate-900 font-medium">{item.action}</p>
                <p className="text-sm text-slate-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}