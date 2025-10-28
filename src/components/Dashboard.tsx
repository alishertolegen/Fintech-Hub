import React from 'react';
export default function Dashboard(){
return (
<div>
<h2 className="text-2xl font-semibold mb-4">Дашборд</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="bg-white p-6 rounded shadow">Барлық стартаптар<br/><strong className="text-2xl">24</strong></div>
<div className="bg-white p-6 rounded shadow">Жалпы қаржы<br/><strong className="text-2xl">1,234,567</strong></div>
<div className="bg-white p-6 rounded shadow">Активті инвесторлар<br/><strong className="text-2xl">18</strong></div>
</div>
</div>
);
}