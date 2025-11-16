# AI Günlük Asistanım

Kullanıcının yazdığı cümleleri AI ile analiz eden ve duygu durumu takibi yapan bir mobil uygulama.

## Proje Yapısı

```
react-ai-project/
├── backend/              # PHP Backend (XAMPP)
│   ├── auth.php          # Kimlik doğrulama endpoint'leri
│   ├── entries.php       # Günlük kayıt CRUD işlemleri
│   ├── weekly.php        # Haftalık özet endpoint'i
│   ├── config.php        # Veritabanı ve JWT yapılandırması
│   └── database.sql      # MySQL veritabanı şeması
└── project/              # React Native CLI Frontend
    ├── screens/          # Uygulama ekranları
    ├── contexts/         # React Context'ler (Auth, Language, Theme)
    ├── lib/              # API ve yardımcı fonksiyonlar
    ├── services/         # AI servisleri (Hugging Face SDK)
    ├── android/          # Android native kodları
    ├── App.tsx           # Ana uygulama bileşeni
    ├── index.js          # Giriş noktası
    └── package.json      # Bağımlılıklar
```

## Özellikler

- ✅ Günlük duygu durumu kaydı
- ✅ AI destekli sentiment analizi (Hugging Face Inference SDK)
- ✅ Çevrimdışı çalışan anahtar kelime analizi (İnternet gerektirmez, Türkçe + İngilizce)
- ✅ Otomatik özet ve öneri üretimi
- ✅ Geçmiş kayıtları görüntüleme (detaylı görünüm)
- ✅ Haftalık istatistikler ve özet (görsel grafikler)
- ✅ Kullanıcı kayıt/giriş sistemi (JWT)
- ✅ Profil fotoğrafı yükleme ve silme
- ✅ Tam ekran fotoğraf görüntüleme
- ✅ Duygu durumuna göre dinamik renkler (yeşil/turuncu/kırmızı)
- ✅ Işık hüzmesi efektleri (haftalık özet)
- ✅ Çoklu dil desteği (Türkçe / İngilizce)
- ✅ Koyu mod / Açık mod seçenekleri
- ✅ PHP Backend (XAMPP + MySQL)

## Kurulum

### Backend Kurulumu

1. **XAMPP'ı kurun ve başlatın**
   - Apache ve MySQL servislerini başlatın
   - Apache port: 80 (varsayılan)
   - MySQL port: 3306 (varsayılan)

2. **Backend dosyalarını kopyalayın**
   - `backend/` klasörünü `C:\xampp\htdocs\backend` konumuna kopyalayın

3. **Veritabanını oluşturun**
   - phpMyAdmin'e gidin: `http://localhost/phpmyadmin`
   - `backend/database.sql` dosyasını içe aktarın
   - Veritabanı adı: `ai_gunluk_asistan`

4. **Hugging Face Token'ı yapılandırın** (Opsiyonel)
   - `backend/.env` dosyası oluşturun:
     ```
     HF_API_TOKEN=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
     HF_API_URL=https://api-inference.huggingface.co/models/tabularisai/multilingual-sentiment-analysis
     ```
### Frontend Kurulumu

#### Gereksinimler

**Android Geliştirme:**
- Node.js (v18 veya üzeri)
- Java JDK (Android Studio ile birlikte gelir)
- Android Studio
- Android SDK (API Level 33+)
- Android SDK Platform-Tools (ADB için)

**iOS Geliştirme (sadece macOS):**
- Xcode (v14+)
- CocoaPods (`sudo gem install cocoapods`)

#### Kurulum Adımları

1. **Bağımlılıkları yükleyin**
   ```bash
   cd project
   npm install
   ```

2. **API URL'ini yapılandırın**
   - `project/lib/api.ts` dosyasındaki `API_BASE_URL` değerini düzenleyin:
     - Android Emülatör için: `http://10.0.2.2:80/backend`
     - Gerçek cihaz için: `http://YOUR_COMPUTER_IP:80/backend`
     - iOS Simülatör için: `http://localhost:80/backend`

3. **Hugging Face Token'ını yapılandırın** ⚠️ **ZORUNLU**
   
   Bu uygulamayı kullanabilmek için Hugging Face'den kendi API token'ınızı almanız ve projeye eklemeniz gerekmektedir.
   
   **Token Alma Adımları:**
   1. [Hugging Face](https://huggingface.co/) web sitesine gidin ve bir hesap oluşturun (veya mevcut hesabınızla giriş yapın)
   2. Sağ üst köşedeki profil ikonunuza tıklayın ve **Settings** (Ayarlar) seçeneğine gidin
   3. Sol menüden **Access Tokens** (Erişim Token'ları) seçeneğine tıklayın
   4. **New token** (Yeni token) butonuna tıklayın
   5. Token için bir isim verin (örn: "react-ai-project") ve **Read** yetkisini seçin
   6. **Generate token** (Token oluştur) butonuna tıklayın
   7. Oluşturulan token'ı kopyalayın (bir daha gösterilmeyecektir!)
   
   **Token'ı Projeye Ekleme:**
   1. `project/services/aiService.ts` dosyasını açın
   2. `HF_TOKEN` değişkenini bulun:
      ```typescript
      const HF_TOKEN = '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';
      ```
   3. Bu token'ı kendi Hugging Face token'ınızla değiştirin:
      ```typescript
      const HF_TOKEN = 'YOUR_HUGGING_FACE_TOKEN_HERE';
      ```
   
   **⚠️ ÖNEMLİ GÜVENLİK UYARISI:**
   
   Bu projeyi GitHub'a yüklerken, `aiService.ts` dosyasındaki mevcut token (`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`) **iptal olmuştur** ve artık kullanılamaz. Bu token GitHub'a yükleme sırasında otomatik olarak Hugging Face tarafından iptal edilmiştir.
   
   Eğer kendi token'ınızı kullanıyorsanız:
   - Token'ınızı GitHub'a yüklemeyin
   - `.gitignore` dosyasına `aiService.ts` ekleyin, VEYA
   - Token'ı environment variable olarak kullanın

4. **Android Ortam Değişkenlerini Ayarlayın** (Windows)
   
   Android SDK Platform-Tools'u PATH'e ekleyin:
   - `C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools`
   
   Java JDK yolunu ayarlayın (Android Studio ile birlikte gelir):
   - `C:\Program Files\Android\Android Studio\jbr`

5. **Uygulamayı Çalıştırma**

   **Android Emülatör ile:**
   ```bash
   # Metro bundler'ı başlat
   npm start
   
   # Yeni bir terminalde Android uygulamasını çalıştır
   npm run android
   ```

   **Android Gerçek Cihaz ile:**
   ```bash
   # USB Debugging'i etkinleştirin (Telefon Ayarları > Geliştirici Seçenekleri)
   # Cihazı USB ile bilgisayara bağlayın
   adb devices  # Cihazın bağlı olduğunu kontrol edin
   
   # Metro bundler'ı başlat
   npm start
   
   # Yeni bir terminalde Android uygulamasını çalıştır
   npm run android
   ```

   **iOS Simülatör ile (sadece macOS):**
   ```bash
   # iOS bağımlılıklarını yükle
   cd ios && pod install && cd ..
   
   # Metro bundler'ı başlat
   npm start
   
   # iOS için (yeni terminal, sadece macOS)
   npm run ios
   ```

6. **APK Oluşturma (Android)**

   Debug APK oluşturmak için:
   ```bash
   cd android
   
   # Windows PowerShell için
   $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
   $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
   $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
   .\gradlew.bat assembleDebug
   
   # APK dosyası şu konumda oluşur:
   # android/app/build/outputs/apk/debug/app-debug.apk
   ```
   
   APK'yı telefona yüklemek için:
   - APK dosyasını telefona kopyalayın
   - Telefonda "Bilinmeyen kaynaklardan uygulama yükleme" iznini verin
   - APK dosyasına dokunarak yükleyin

## Teknolojiler

### Backend
- PHP 7.4+
- MySQL (XAMPP)
- JWT Token Authentication
- CORS desteği

### Frontend
- React Native CLI (0.81.4)
- TypeScript
- React Navigation (Stack + Bottom Tabs)
- AsyncStorage (Token yönetimi)
- Context API
- Hugging Face Inference SDK (`@huggingface/inference`)
  - Model: `tabularisai/multilingual-sentiment-analysis`
  - Çevrimdışı anahtar kelime analizi (Türkçe + İngilizce, internet gerektirmez)

**UI Components & Icons:**
- **lucide-react-native** (^0.544.0) - İkonlar
- **react-native-vector-icons** (^10.2.0) - Ek ikon desteği
- **react-native-linear-gradient** (^2.8.3) - Gradient efektler
- **react-native-svg** (15.12.1) - SVG desteği

**Media & Gestures:**
- **react-native-image-picker** (^7.1.2) - Profil fotoğrafı seçme
- **react-native-gesture-handler** (~2.28.0) - Dokunma hareketleri
- **react-native-haptic-feedback** (^2.2.0) - Dokunsal geri bildirim

**Animations & Performance:**
- **react-native-reanimated** (~4.1.1) - Animasyonlar
- **react-native-worklets** (^0.6.1) - Performans optimizasyonu
- **react-native-safe-area-context** (~5.6.0) - Güvenli alan desteği
- **react-native-screens** (~4.16.0) - Ekran optimizasyonu

**Development Tools:**
- **Babel** - JavaScript transpiler
  - `@babel/core` (^7.25.2)
  - `@react-native/babel-preset` (^0.81.4)
  - `babel-plugin-module-resolver` (^5.0.2) - Path alias desteği
- **TypeScript** (~5.9.2) - Tip kontrolü
- **ESLint** (^8.57.0) - Kod kalitesi
- **Jest** (^29.7.0) - Test framework
- **Prettier** (^3.3.3) - Kod formatlama

## API Endpoint'leri

### Authentication
- `POST /backend/auth.php?action=register` - Kullanıcı kaydı
- `POST /backend/auth.php?action=login` - Kullanıcı girişi
- `GET /backend/auth.php?action=me` - Mevcut kullanıcı bilgisi

### Analysis
- AI analizi frontend'de yapılıyor (`project/services/aiService.ts`)
- Hugging Face Inference SDK kullanılıyor
- Backend'de analyze endpoint'i yok

### Entries
- `GET /backend/entries.php` - Tüm kayıtları getir
- `POST /backend/entries.php` - Yeni kayıt oluştur
- `PUT /backend/entries.php?id={id}` - Kayıt güncelle
- `DELETE /backend/entries.php?id={id}` - Kayıt sil

### Weekly Summary
- `GET /backend/weekly.php` - Haftalık özet

## AI Analizi

Uygulama, Hugging Face Inference SDK ve çevrimdışı çalışabilen hibrit bir analiz sistemi kullanır:

### Çevrimiçi Analiz (Hugging Face)
- Model: `tabularisai/multilingual-sentiment-analysis` (Türkçe + İngilizce destekli)
- İnternet bağlantısı gerektirir
- Yüksek doğruluk oranı
- Hugging Face Inference SDK ile frontend'de direkt çalışır

### Çevrimdışı Analiz (Anahtar Kelime Tabanlı)
- İnternet bağlantısı gerektirmez - Tamamen çevrimdışı çalışır
- 100+ pozitif kelime (iyi, güzel, harika, mutlu, happy, great, vb.)
- 100+ negatif kelime (kötü, üzgün, yorgun, sad, tired, vb.)
- Türkçe ve İngilizce destekli
- Otomatik geçiş: İnternet yoksa veya AI model yanıt vermezse çevrimdışı mod devreye girer

### Sonuçlar
Her iki mod da aynı sonuçları üretir:
- Duygu durumu: `positive`, `neutral`, `negative`
- Otomatik özet oluşturma
- Kişiselleştirilmiş öneriler

### Renk Paleti
Uygulama genelinde tutarlı renk kullanımı:
- Pozitif: Yeşil (#34C759) - Olumlu duygular
- Nötr: Turuncu (#FF9500) - Dengeli duygular
- Negatif: Kırmızı (#FF3B30) - Olumsuz duygular

Bu renkler ana sayfa arka planı, geçmiş kayıtları ve haftalık özet kutucuklarında kullanılır.

## Kullanım

1. Uygulamayı açın ve kayıt olun
2. Ana sayfada günlük duygu durumunuzu yazın
3. "Analiz Et" butonuna tıklayın
4. AI analiz sonuçlarını görüntüleyin (duygu durumu, özet, öneri)
   - Arka plan rengi duygu durumuna göre değişir (yeşil/turuncu/kırmızı)
5. Geçmiş kayıtlarınızı "Geçmiş" sekmesinden görüntüleyin
   - Kayıtlara dokunarak detayları görebilirsiniz
6. Haftalık istatistiklerinizi "Haftalık Özet" sekmesinden görüntüleyin
   - Işık hüzmesi efektleri ile görselleştirilmiş istatistikler
7. Profil sayfasından fotoğrafınızı yükleyin veya değiştirin
   - Fotoğrafa dokunarak tam ekran görüntüleyebilirsiniz
8. Dil Değiştirme: Profil sayfasından Türkçe veya İngilizce dil seçeneğini değiştirebilirsiniz
9. Tema Değiştirme: Profil sayfasından Koyu mod veya Açık mod seçeneğini değiştirebilirsiniz

## Sorun Giderme

### Metro Bundler Port Hatası
Eğer 8081 portu kullanılıyorsa:
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 8081 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
npm start -- --reset-cache
```

### ADB Komutu Bulunamıyor
Android SDK Platform-Tools'u PATH'e ekleyin:
- `C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools`

### JAVA_HOME Hatası
Android Studio ile birlikte gelen JDK'yı kullanın:
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

### Path Alias Hatası
Babel Module Resolver yapılandırmasını kontrol edin:
- `babel.config.js` dosyasında `@/` alias'ı tanımlı olmalı

## Geliştirme Notları

Bu projeyi geliştirirken, Hugging Face Inference API entegrasyonu ve kurulumu konusunda Cursor AI Chat'ten yardım aldım. Ücretli AI servisleri ile entegrasyon konusunda deneyimim olmasına rağmen, Hugging Face'in ücretsiz inference API'si ve SDK kullanımı hakkında önceden tecrübem yoktu. Bu nedenle, Hugging Face entegrasyonu, model seçimi ve çevrimdışı fallback mekanizmasının geliştirilmesi sürecinde Cursor AI Chat'ten teknik destek aldım. Ek olarak README.md dosyasını ChatGPT ile düzenledim.

## Güvenlik Notları

- Production ortamında `JWT_SECRET` değerini mutlaka değiştirin
- Veritabanı şifresini güçlendirin
- HTTPS kullanın
- API rate limiting ekleyin
