'use client';

import { useState } from "react";
import { loginAdmin } from "./actions";

export default function LoginAdminPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setLoading(true);
    setError("");
    const resultado = await loginAdmin(formData);
    
    // Si la función nos devuelve un error, lo mostramos
    if (resultado?.error) {
      setError(resultado.error);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0D241D", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "#1F2937", padding: "40px 30px", borderRadius: 12, width: "100%", maxWidth: 400, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", textAlign: "center" }}>
        
        <h1 style={{ color: "#FCD34D", margin: "0 0 10px 0", fontSize: 24 }}>Acceso Restringido</h1>
        
        <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <input 
            type="password" 
            name="password" 
            placeholder="Contraseña..." 
            required 
            style={{ padding: "12px", borderRadius: 6, border: "1px solid #4B5563", background: "#374151", color: "#FFF", fontSize: 16 }}
          />
          
          {error && <div style={{ color: "#EF4444", fontSize: 14, fontWeight: "bold" }}>{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: "12px", borderRadius: 6, border: "none", background: "#10B981", color: "#FFF", fontSize: 16, fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

      </div>
    </div>
  );
}