// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Tipos de respuesta
export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  access_token: string;
}

export interface UserInfo {
  id: string;
  email: string;
  nombre?: string;
  roles: string[];
  participanteId?: string | null;
}

// Funciones de autenticación
export const authApi = {
  /**
   * Iniciar sesión
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('🔐 [API] Iniciando login...', { email, url: `${API_BASE_URL}/auth/login` });
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('📡 [API] Respuesta del login:', { 
      status: response.status, 
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Error en login:', errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Error al iniciar sesión' };
      }
      throw new Error(error.message || 'Credenciales inválidas');
    }

    const data = await response.json();
    console.log('✅ [API] Login exitoso, token recibido:', { 
      hasToken: !!data.access_token,
      tokenLength: data.access_token?.length 
    });
    
    return data;
  },

  /**
   * Registrarse
   */
  async register(
    nombre: string,
    email: string,
    password: string,
    rol?: string
  ): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, email, password, rol }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al registrarse' }));
      throw new Error(error.message || 'Error al crear la cuenta');
    }

    return response.json();
  },

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(token?: string): Promise<UserInfo> {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    
    console.log('👤 [API] Obteniendo info del usuario...', { 
      hasToken: !!authToken,
      tokenSource: token ? 'parameter' : 'localStorage',
      tokenLength: authToken?.length 
    });
    
    if (!authToken) {
      console.error('❌ [API] No hay token disponible');
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_BASE_URL}/usuarios/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [API] Respuesta de getCurrentUser:', { 
      status: response.status, 
      ok: response.ok 
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado
        console.error('❌ [API] Token inválido o expirado (401)');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');
        }
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
      }
      const errorText = await response.text();
      console.error('❌ [API] Error al obtener usuario:', errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Error al obtener información del usuario' };
      }
      throw new Error(error.message || 'Error al obtener información del usuario');
    }

    const userInfo = await response.json();
    console.log('✅ [API] Usuario obtenido:', { 
      id: userInfo.id, 
      email: userInfo.email, 
      roles: userInfo.roles 
    });
    
    return userInfo;
  },
};

// Funciones de utilidad para el token
export const authStorage = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
    }
  },

  setUserInfo(userInfo: UserInfo) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    }
  },

  getUserInfo(): UserInfo | null {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
