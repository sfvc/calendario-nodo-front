// components/Loading.tsx
import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-opacity-90 z-50">
      {/* Imagen centrada */}
        <img
          src='/nodo-calendario.avif'
          alt='cargando'
          width={300}
        />
      </div>
  );
};

export default Loading;