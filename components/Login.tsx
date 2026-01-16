
import React from 'react';
import { Chrome } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleGoogleLogin = () => {
    // Simulación de Firebase Auth
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: 'usuario@ejemplo.com',
      name: 'Explorador de Ideas',
      is_subscribed: false
    };
    onLogin(mockUser);
  };

  return (
    <div className="fixed inset-0 bg-white z-[300] flex flex-col items-center justify-center p-8">
      <div className="mb-12 text-center">
        <div className="w-24 h-24 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white mb-6 mx-auto shadow-2xl">
          <span className="text-4xl font-bold">N</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Nonfiction</h1>
        <p className="text-gray-500 font-medium">Conocimiento en movimiento.</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 px-6 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-700 shadow-sm active:scale-95 transition-all"
        >
          <Chrome size={24} className="text-red-500" />
          Continuar con Google
        </button>
        
        <p className="text-xs text-center text-gray-400 px-8">
          Al continuar, aceptas nuestros términos de servicio y política de privacidad.
        </p>
      </div>
    </div>
  );
};

export default Login;
