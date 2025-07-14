// src/pages/Home.tsx
import React from 'react';
import { EventCalendar } from '../components/calendar';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <EventCalendar />
    </div>
  );
};

export default Home;
