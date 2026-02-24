// components/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // для рендера текущей страницы
import Footer from './Footer';

const Layout: React.FC = () => {
  return (
    <div className="app-layout">
      {/* Тут можно добавить header, если он общий */}
      <Outlet /> {/* рендер текущей страницы */}
      <Footer />
    </div>
  );
};

export default Layout;