import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = '@app_language';

const translations = {
  tr: {
    // Auth
    'auth.title': 'AI Günlük Asistanım',
    'auth.subtitle': 'Günlük duygularını paylaş, AI ile analiz et',
    'auth.email': 'E-posta',
    'auth.password': 'Şifre',
    'auth.login': 'Giriş Yap',
    'auth.signup': 'Kayıt Ol',
    'auth.switchToSignup': 'Hesabın yok mu? Kayıt ol',
    'auth.switchToLogin': 'Zaten hesabın var mı? Giriş yap',
    'auth.fillAll': 'Lütfen tüm alanları doldurun',
    
    // Home
    'home.title': 'Günlük Kaydı',
    'home.howFeel': 'Bugün nasıl hissediyorsun? Duygularını paylaş...',
    'home.placeholder': 'Örn: Bugün motive hissediyorum ama biraz yorgunum.',
    'home.analyze': 'Analiz Et',
    'home.enterText': 'Lütfen bir metin girin',
    'home.analysisError': 'Analiz yapılırken bir hata oluştu',
    'home.positive': 'Pozitif',
    'home.neutral': 'Nötr',
    'home.negative': 'Negatif',
    'home.summary': 'Özet',
    'home.suggestion': 'Öneri',
    'home.saved': '✓ Kaydedildi',
    'home.newEntry': 'Yeni Kayıt',
    
    // History
    'history.title': 'Geçmiş',
    'history.empty': 'Henüz kayıt yok',
    'history.today': 'Bugün',
    'history.yesterday': 'Dün',
    
    // Weekly
    'weekly.title': 'Haftalık Özet',
    'weekly.positive': 'Pozitif',
    'weekly.neutral': 'Nötr',
    'weekly.negative': 'Negatif',
    'weekly.total': 'Toplam',
    'weekly.entries': 'Kayıt',
    'weekly.empty': 'Bu hafta henüz kayıt yok',
    
    // Profile
    'profile.title': 'Profil',
    'profile.stats': 'İstatistikler',
    'profile.totalEntries': 'Toplam Kayıt',
    'profile.thisWeek': 'Bu Hafta',
    'profile.language': 'Dil',
    'profile.turkish': 'Türkçe',
    'profile.english': 'English',
    
    // Tab Bar
    'tabs.home': 'Ana Sayfa',
    'tabs.history': 'Geçmiş',
    'tabs.weekly': 'Haftalık',
    'tabs.profile': 'Profil',
    'profile.signOut': 'Çıkış Yap',
    'profile.deleteAll': 'Tüm Verileri Sil',
    'profile.deleteConfirm': 'Tüm kayıtlarınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
    'profile.deleteSuccess': 'Tüm kayıtlar silindi',
    'profile.deleteError': 'Kayıtlar silinirken bir hata oluştu',
    'profile.signOutConfirm': 'Çıkış yapmak istediğinize emin misiniz?',
    'profile.cancel': 'İptal',
    'profile.delete': 'Sil',
    'profile.deletePhoto': 'Fotoğrafı Sil',
    'profile.deletePhotoConfirm': 'Profil fotoğrafınızı silmek istediğinize emin misiniz?',
    'profile.theme': 'Tema',
    'profile.light': 'Açık',
    'profile.dark': 'Koyu',
  },
  en: {
    // Auth
    'auth.title': 'AI Daily Assistant',
    'auth.subtitle': 'Share your daily feelings, analyze with AI',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.switchToSignup': "Don't have an account? Sign up",
    'auth.switchToLogin': 'Already have an account? Sign in',
    'auth.fillAll': 'Please fill in all fields',
    
    // Home
    'home.title': 'Daily Entry',
    'home.howFeel': 'How are you feeling today? Share your feelings...',
    'home.placeholder': 'E.g: I feel motivated today but a bit tired.',
    'home.analyze': 'Analyze',
    'home.enterText': 'Please enter some text',
    'home.analysisError': 'An error occurred while analyzing',
    'home.positive': 'Positive',
    'home.neutral': 'Neutral',
    'home.negative': 'Negative',
    'home.summary': 'Summary',
    'home.suggestion': 'Suggestion',
    'home.saved': '✓ Saved',
    'home.newEntry': 'New Entry',
    
    // History
    'history.title': 'History',
    'history.empty': 'No entries yet',
    'history.today': 'Today',
    'history.yesterday': 'Yesterday',
    
    // Weekly
    'weekly.title': 'Weekly Summary',
    'weekly.positive': 'Positive',
    'weekly.neutral': 'Neutral',
    'weekly.negative': 'Negative',
    'weekly.total': 'Total',
    'weekly.entries': 'Entries',
    'weekly.empty': 'No entries this week yet',
    
    // Profile
    'profile.title': 'Profile',
    'profile.stats': 'Statistics',
    'profile.totalEntries': 'Total Entries',
    'profile.thisWeek': 'This Week',
    'profile.language': 'Language',
    'profile.turkish': 'Türkçe',
    'profile.english': 'English',
    
    // Tab Bar
    'tabs.home': 'Home',
    'tabs.history': 'History',
    'tabs.weekly': 'Weekly',
    'tabs.profile': 'Profile',
    'profile.signOut': 'Sign Out',
    'profile.deleteAll': 'Delete All Data',
    'profile.deleteConfirm': 'Are you sure you want to delete all your entries? This action cannot be undone.',
    'profile.deleteSuccess': 'All entries deleted',
    'profile.deleteError': 'An error occurred while deleting entries',
    'profile.signOutConfirm': 'Are you sure you want to sign out?',
    'profile.cancel': 'Cancel',
    'profile.delete': 'Delete',
    'profile.deletePhoto': 'Delete Photo',
    'profile.deletePhotoConfirm': 'Are you sure you want to delete your profile photo?',
    'profile.theme': 'Theme',
    'profile.light': 'Light',
    'profile.dark': 'Dark',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage === 'tr' || savedLanguage === 'en') {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.tr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

