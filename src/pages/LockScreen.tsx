import React, { useState, useEffect } from "react";

const PASSWORD = "123"; // Cambia aquí la contraseña general

const LockScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inputPassword, setInputPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Estado para carga inicial

  useEffect(() => {
    // Chequea si ya está desbloqueado (flag en localStorage)
    const unlocked = localStorage.getItem("screenUnlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
    setLoading(false); // Terminamos de verificar
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === PASSWORD) {
      localStorage.setItem("screenUnlocked", "true"); // <-- Comentado para pruebas
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Contraseña incorrecta");
      setInputPassword("");
    }
  };

  // Si ya está desbloqueado mostramos children directamente
  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center text-white p-4"
      style={{ display: loading ? "none" : "flex" }} // ocultar mientras carga
    >
      <img src="./nodo-calendario.avif" alt="Nodo calendario logo" width={300}/>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <input
          type="password"
          placeholder="Ingrese la contraseña"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          className="w-full px-4 py-2 border border-blue-300 rounded text-black focus:outline-none focus:ring-1 focus:ring-blue-300"
          autoFocus
        />
        {error && <p className="text-red-400 mt-2">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full botonazul py-2 rounded transition"
        >
          Desbloquear
        </button>
      </form>
    </div>
  );
};

export default LockScreen;
