import React from 'react';
import { Outlet } from 'react-router-dom';
import GuestHeader from './GuestHeader';
import GuestFooter from './GuestFooter';

const GuestLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <GuestHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <GuestFooter />
    </div>
  );
};

export default GuestLayout;
