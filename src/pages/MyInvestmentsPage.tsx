// src/pages/MyInvestmentsPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const API = 'http://localhost:8080/api/investments';

export default function MyInvestmentsPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetch(`${API}/investor/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setInvestments(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <p>Загрузка...</p>;

  if (!investments.length) return <p>У вас пока нет инвестиций.</p>;

  return (
    <div>
      <h2>Мои инвестиции</h2>
      <table border={1} cellPadding={5} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Стартап</th>
            <th>Сумма</th>
            <th>Валюта</th>
            <th>Процент доли</th>
            <th>Оценка компании</th>
            <th>Статус</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv: any) => (
            <tr key={inv.id}>
              <td>{inv.id}</td>
              <td>{inv.startupId}</td>
              <td>{inv.amount}</td>
              <td>$</td>
              <td>{inv.equityPercent}</td>
              <td>{inv.valuationPostMoney}</td>
              <td>{inv.status}</td>
              <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
