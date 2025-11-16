import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  Modal,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as UserIcon, LogOut, Trash2, Camera, Sun, Moon } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { entriesAPI } from '../lib/api';

const PROFILE_IMAGE_KEY = '@profile_image';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme, colors } = useTheme();
  const [stats, setStats] = useState({
    totalEntries: 0,
    thisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    fetchStats();
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const imageUri = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      if (imageUri) {
        setProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const allEntries = await entriesAPI.getAll();

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const weekEntries =
        allEntries?.filter((e: any) => new Date(e.created_at) >= sevenDaysAgo) || [];

      setStats({
        totalEntries: allEntries?.length || 0,
        thisWeek: weekEntries.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by App.tsx based on auth state
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      t('profile.signOut'),
      t('profile.signOutConfirm'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        { text: t('profile.signOut'), onPress: handleSignOut, style: 'destructive' },
      ]
    );
  };

  const handleDeleteAllData = async () => {
    try {
      const allEntries = await entriesAPI.getAll();
      
      await Promise.all(allEntries.map((entry: any) => entriesAPI.delete(entry.id)));

      setStats({ totalEntries: 0, thisWeek: 0 });

      Alert.alert(t('profile.deleteSuccess'), t('profile.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting data:', error);
      Alert.alert(t('profile.deleteError'), t('profile.deleteError'));
    }
  };

  const confirmDeleteAllData = () => {
    Alert.alert(
      t('profile.deleteAll'),
      t('profile.deleteConfirm'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.delete'),
          onPress: handleDeleteAllData,
          style: 'destructive',
        },
      ]
    );
  };

  const requestImagePickerPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Galeri Erişim İzni',
            message: 'Fotoğraf seçmek için galeri erişim izni gerekiyor.',
            buttonNeutral: 'Daha Sonra',
            buttonNegative: 'İptal',
            buttonPositive: 'İzin Ver',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) {
      Alert.alert(
        'İzin Gerekli',
        'Fotoğraf seçmek için galeri erişim izni gerekiyor.'
      );
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        selectionLimit: 1,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorMessage) {
          Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
          return;
        }
        if (response.assets && response.assets[0]) {
          const imageUri = response.assets[0].uri;
          if (imageUri) {
            setProfileImage(imageUri);
            AsyncStorage.setItem(PROFILE_IMAGE_KEY, imageUri);
          }
        }
      }
    );
  };

  const deleteProfileImage = async () => {
    Alert.alert(
      t('profile.deletePhoto'),
      t('profile.deletePhotoConfirm'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.delete'),
          onPress: async () => {
            setProfileImage(null);
            await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <UserIcon size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text, flex: 1 }]}>{t('profile.title')}</Text>
        <TouchableOpacity
          style={[styles.themeToggleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? (
            <Moon size={18} color={colors.text} />
          ) : (
            <Sun size={18} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.avatarContainer, { backgroundColor: colors.primary }]}
            onPress={profileImage ? () => setImageModalVisible(true) : pickImage}
            onLongPress={profileImage ? deleteProfileImage : undefined}
            activeOpacity={0.8}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <UserIcon size={40} color="#fff" />
            )}
            <TouchableOpacity
              style={[styles.cameraIconContainer, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <Camera size={16} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
          <Text style={[styles.userEmail, { color: colors.text }]}>{user?.email}</Text>
          {profileImage && (
            <TouchableOpacity
              style={styles.deletePhotoButton}
              onPress={deleteProfileImage}
            >
              <Text style={styles.deletePhotoButtonText}>{t('profile.deletePhoto')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setImageModalVisible(false)}
          >
            <View style={styles.modalContent}>
              {profileImage && (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalEntries}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profile.totalEntries')}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.thisWeek}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profile.thisWeek')}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.language')}</Text>
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                language === 'tr' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
              ]}
              onPress={() => setLanguage('tr')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  { color: language === 'tr' ? colors.primary : colors.text },
                  language === 'tr' && { fontWeight: '600' },
                ]}
              >
                {t('profile.turkish')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                language === 'en' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  { color: language === 'en' ? colors.primary : colors.text },
                  language === 'en' && { fontWeight: '600' },
                ]}
              >
                {t('profile.english')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.deleteAll')}</Text>
          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.error }]}
            onPress={confirmDeleteAllData}
          >
            <Trash2 size={20} color="#fff" />
            <Text style={styles.dangerButtonText}>{t('profile.deleteAll')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.primary }]} onPress={confirmSignOut}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>{t('profile.signOut')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    gap: 10,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  themeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    padding: 15,
  },
  userCard: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
    overflow: 'visible',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  statBox: {
    flex: 1,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    gap: 10,
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    gap: 10,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deletePhotoButton: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  deletePhotoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  languageButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
  },
});
