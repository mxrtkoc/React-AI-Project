// Local API Base URL - XAMPP için
import { Platform } from 'react-native';

// Platform'a göre API URL'ini belirle
// PHP Backend kullanılıyor (XAMPP port 80)
function getApiBaseUrl(): string {
  // Android emülatör için
  if (Platform.OS === 'android') {
    // Emülatör kullanıyorsanız: http://10.0.2.2:80/backend
    // Gerçek cihaz kullanıyorsanız: Bilgisayarınızın IP adresini kullanın
    // IP adresiniz: 192.168.1.130 (ipconfig ile bulundu)
    return 'http://192.168.1.130:80/backend'; // Gerçek cihaz için
    // Emülatör için: return 'http://10.0.2.2:80/backend';
  }

  // iOS için
  if (Platform.OS === 'ios') {
    // iOS Simulator için localhost çalışır
    // Gerçek cihaz için: Bilgisayarınızın IP adresini kullanın
    // IP adresiniz: 192.168.1.130
    return 'http://192.168.1.130:80/backend'; // Gerçek cihaz için
    // Simulator için: return 'http://localhost:80/backend';
  }

  // Varsayılan
  return 'http://localhost:80/backend';
}

const API_BASE_URL = getApiBaseUrl();

// Token'ı AsyncStorage'dan almak için
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token yönetimi
const TOKEN_KEY = '@ai_gunluk_token';

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Token alınamadı:', error);
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Token kaydedilemedi:', error);
  }
}

export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Token silinemedi:', error);
  }
}

// API çağrısı helper fonksiyonu
async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Response boş olabilir (özellikle OPTIONS için)
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    }

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Bir hata oluştu`);
    }

    return data;
  } catch (error: any) {
    // Network hatası
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed')) {
      console.error('API Call Error:', { url, error: error.message });
      throw new Error(`Backend'e bağlanılamıyor. Lütfen XAMPP'ın çalıştığından ve API URL'inin doğru olduğundan emin olun. (URL: ${url})`);
    }
    throw error;
  }
}

// Auth API
export const authAPI = {
  register: async (email: string, password: string) => {
    const data = await apiCall('auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      await setToken(data.token);
    }
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await apiCall('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      await setToken(data.token);
    }
    return data;
  },

  logout: async () => {
    await removeToken();
  },

  getMe: async () => {
    return apiCall('auth.php?action=me');
  },
};

// Entries API
export const entriesAPI = {
  getAll: async () => {
    const data = await apiCall('entries.php');
    return data.entries || [];
  },

  create: async (entry: {
    content: string;
    sentiment: string;
    summary: string;
    suggestion: string;
  }) => {
    const data = await apiCall('entries.php', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return data.entry;
  },

  update: async (id: number, entry: Partial<{
    content: string;
    sentiment: string;
    summary: string;
    suggestion: string;
  }>) => {
    const data = await apiCall(`entries.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
    return data.entry;
  },

  delete: async (id: number) => {
    return apiCall(`entries.php?id=${id}`, {
      method: 'DELETE',
    });
  },
};

// Weekly API
export const weeklyAPI = {
  getSummary: async () => {
    return apiCall('weekly.php');
  },
};

// Analyze API - AI sentiment analysis (PHP backend)
export const analyzeAPI = {
  analyze: async (text: string) => {
    return apiCall('analyze.php', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },
};

