// src/pages/Home.tsx
import React from 'react';
import { EventCalendar } from '../components/calendar';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <EventCalendar />
    </div>
  );
};

export default Home;
