import { HfInference } from '@huggingface/inference';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface AIAnalysisResult {
  sentiment: SentimentType;
  summary: string;
  suggestion: string;
}

// Hugging Face Inference - Token ile
const HF_TOKEN = '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';
const hf = new HfInference(HF_TOKEN);

// Multilingual sentiment analysis model (Türkçe + İngilizce destekli)
const SENTIMENT_MODEL = 'tabularisai/multilingual-sentiment-analysis';

/**
 * Multilingual sentiment analizi için anahtar kelimeler (Türkçe + İngilizce fallback)
 */
function analyzeMultilingualSentiment(text: string): SentimentType {
  const lowerText = text.toLowerCase();
  
  // Önce negatif ifadeleri kontrol et (öncelikli)
  const negativePhrases = [
    // Türkçe negatif ifadeler
    'pek iyi geçmedi', 'iyi geçmedi', 'iyi değil', 'pek iyi değil', 'iyi değildi',
    'iyi değilim', 'iyi değiliz', 'iyi değildim', 'iyi değildin', 'iyi değildik',
    'hiç iyi değil', 'hiç iyi değilim', 'hiç iyi değildi', 'hiç iyi değildim',
    'çok iyi değil', 'çok iyi değilim', 'çok iyi değildi',
    'güzel değil', 'güzel değilim', 'güzel değildi', 'güzel değildim',
    'mutlu değilim', 'mutlu değiliz', 'mutlu değildim', 'mutlu değildi',
    'hiç mutlu değilim', 'hiç mutlu değildim', 'hiç mutlu değildi',
    'neşeli değilim', 'neşeli değildim', 'neşeli değildi',
    'keyifli değil', 'keyifli değildi', 'keyifli değilim',
    'iyi hissetmiyorum', 'iyi hissetmiyoruz', 'iyi hissetmedim',
    'kendimi iyi hissetmiyorum', 'kendimi iyi hissetmedim',
    'motivasyonum düşük', 'motivasyon düşük', 'moralim düşük', 'moral düşük',
    'moralim bozuk', 'moral bozuk', 'kötü geçti', 'kötüydü',
    'hiçbir şey iyi değil', 'hiçbir şey güzel değil',
    // İngilizce negatif ifadeler
    'not good', 'not well', 'not happy', 'not fine', 'not great', 'not okay',
    'am not good', 'is not good', 'are not good', 'was not good', 'were not good',
    'do not feel good', 'does not feel good', 'did not feel good',
    'feel bad', 'feeling bad', 'feels bad', 'felt bad'
  ];
  
  for (const phrase of negativePhrases) {
    if (lowerText.includes(phrase)) {
      return 'negative';
    }
  }
  
  // Pozitif ifadeleri kontrol et (öncelikli)
  const positivePhrases = [
    'çok iyi', 'pek iyi', 'çok güzel', 'harika geçti', 'mükemmel geçti',
    'çok mutluyum', 'çok mutluyuz', 'çok neşeliyim', 'çok sevinçliyim',
    'çok başarılı', 'çok başarılıydım', 'çok başarılıydı',
    'motivasyonum yüksek', 'moralim yüksek', 'moralim çok iyi',
    'çok keyifli', 'çok zevkli', 'çok hoş', 'çok güzel',
    'harika bir gün', 'mükemmel bir gün', 'süper bir gün',
    'çok iyiyim', 'çok iyiyiz', 'çok iyiydi', 'çok iyiydim',
    'very good', 'very happy', 'very excited', 'very successful',
    'great day', 'wonderful day', 'amazing day', 'fantastic day',
    'feeling great', 'feeling good', 'feeling happy', 'feeling amazing'
  ];
  
  for (const phrase of positivePhrases) {
    if (lowerText.includes(phrase)) {
      return 'positive';
    }
  }
  
  // Türkçe + İngilizce pozitif kelimeler (belirgin duygu ifadeleri)
  const positiveWords = [
    // Türkçe - Belirgin pozitif duygular
    'mutlu', 'neşeli', 'sevinçli', 'coşkulu', 'heyecanlı', 'gururlu', 'başarılı',
    'keyifli', 'zevkli', 'hoş', 'sevindim', 'sevinç', 'neşe', 'coşku', 'heyecan',
    'umutlu', 'iyimser', 'pozitif', 'iyiyim', 'iyiyiz', 'iyiler',
    'harika', 'süper', 'müthiş', 'fantastik', 'muhteşem', 'olağanüstü',
    'enerjik', 'enerjikim', 'dinç', 'dinçim', 'canlı', 'canlıyım',
    'huzurlu', 'huzurluyum', 'rahat', 'rahatım', 'sakin', 'sakinim',
    'gururluyum', 'gururluyuz', 'başarılıydım', 'başarılıydı',
    'mutluyum', 'mutluyuz', 'mutluydum', 'mutluydum',
    'sevinçliyim', 'sevinçliyiz', 'neşeliyim', 'neşeliyiz',
    'keyifliydi', 'keyifliydim', 'zevkli', 'zevkliydi',
    'memnun', 'memnunum', 'memnunuz', 'hoşnut', 'hoşnutum',
    'coşkulu', 'coşkuluyum', 'heyecanlıyım', 'heyecanlıyız',
    'iyi', 'güzel', 'mükemmel', 'başarı', 'gurur', 'keyif', 'zevk', 'umut',
    // İngilizce - Belirgin pozitif duygular
    'happy', 'joyful', 'glad', 'pleased', 'delighted', 'cheerful', 'excited',
    'love', 'loved', 'loving', 'enjoy', 'enjoying', 'enjoyed', 'pleasure',
    'success', 'successful', 'proud', 'pride', 'hope', 'hopeful', 'optimistic',
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
    'positive', 'nice', 'fine', 'well', 'better', 'best', 'perfect', 'brilliant',
    'energetic', 'peaceful', 'calm', 'relaxed', 'content', 'satisfied', 'grateful',
    'thrilled', 'ecstatic', 'euphoric', 'blissful', 'jubilant', 'elated', 'overjoyed'
  ];
  
  // Türkçe + İngilizce negatif kelimeler (belirgin duygu ifadeleri)
  const negativeWords = [
    // Türkçe - Belirgin negatif duygular
    'üzgün', 'mutsuz', 'kederli', 'hüzünlü', 'acılı', 'ağrılı', 'sıkıntılı',
    'bunalımlı', 'depresif', 'umutsuz', 'çaresiz', 'yorgun', 'bitkin', 'tükenmiş', 'bıkmış',
    'sinirli', 'öfkeli', 'kızgın', 'kırgın', 'hayal kırıklığı', 'hayal kırıklığına uğradım',
    'korkulu', 'endişeli', 'kaygılı', 'panik', 'stresli', 'gergin', 'huzursuz',
    'rahatsız', 'memnuniyetsiz', 'hoşnutsuz', 'üzüntü', 'keder', 'hüzün', 'acı', 'ağrı',
    'sıkıntı', 'zor', 'zorlu', 'zorlanıyorum', 'bunalım', 'depresyon',
    'umutsuzluk', 'çaresizlik', 'yorgunluk', 'bitkinlik', 'tükenmişlik', 'bıkkınlık',
    'sinirlilik', 'öfke', 'kızgınlık', 'kırgınlık', 'korku', 'endişe', 'kaygı',
    'panik', 'stres', 'gerginlik', 'huzursuzluk', 'rahatsızlık',
    'yorucu', 'yorucuydu', 'yorucuyum', 'yoruldum', 'yoruldu',
    'sıkıldım', 'sıkıldı', 'sıkıcı', 'sıkıcıydı', 'sıkıntılı', 'sıkıntılıydı',
    'kötü', 'kötüydü', 'kötüydüm', 'kötü geçti',
    // Türkçe negatif bağlam oluşturan kelimeler
    'değil', 'değildi', 'değilim', 'değiliz', 'değildim', 'değildin', 'değildik',
    'yok', 'yoktu', 'yokum', 'yokuz', 'yoktum', 'yoktun', 'yoktuk',
    'hiç', 'asla', 'bir şey yok', 'hiçbir şey', 'hiçbir', 'asla',
    'olmuyor', 'olmadı', 'olmayacak', 'olmayız', 'olmayız',
    'üzgünüm', 'üzgünüz', 'mutsuzum', 'mutsuzuz',
    'yorgunum', 'yorgunuz', 'bitkinim', 'tükenmişim',
    'sinirliyim', 'sinirliyiz', 'öfkeliyim', 'kızgınım',
    'korkuyorum', 'korkuyoruz', 'endişeliyim', 'kaygılıyım',
    'stresliyim', 'gerginim', 'huzursuzum', 'rahatsızım',
    // İngilizce - Belirgin negatif duygular
    'sad', 'unhappy', 'depressed', 'upset', 'disappointed', 'frustrated',
    'angry', 'mad', 'annoyed', 'irritated', 'furious', 'rage', 'hate',
    'hated', 'hateful', 'tired', 'exhausted', 'drained', 'stressed', 'anxious',
    'worried', 'fear', 'afraid', 'scared', 'frightened', 'nervous', 'panic',
    'pain', 'hurt', 'suffering', 'struggle', 'difficult', 'hard', 'tough',
    'hopeless', 'helpless', 'desperate', 'lonely', 'alone', 'isolated',
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'worse', 'poor',
    'tense', 'uneasy', 'uncomfortable', 'distressed', 'miserable', 'gloomy',
    // İngilizce negatif bağlam oluşturan kelimeler
    'not', 'no', 'never', 'nothing', 'nobody', 'nowhere', 'neither', 'nor'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  // "iyi", "güzel", "mutlu" ve "good" gibi kelimeler negatif bağlamda kullanılmışsa pozitif sayma
  const hasNegativeContext = 
                             // Türkçe negatif bağlam
                             lowerText.includes('geçmedi') || 
                             lowerText.includes('değil') || 
                             lowerText.includes('değildi') ||
                             lowerText.includes('değilim') ||
                             lowerText.includes('değiliz') ||
                             lowerText.includes('değildim') ||
                             lowerText.includes('değildin') ||
                             lowerText.includes('değildik') ||
                             lowerText.includes('pek iyi') ||
                             lowerText.includes('hiç iyi') ||
                             lowerText.includes('çok iyi değil') ||
                             lowerText.includes('güzel değil') ||
                             lowerText.includes('mutlu değil') ||
                             lowerText.includes('neşeli değil') ||
                             lowerText.includes('keyifli değil') ||
                             lowerText.includes('iyi hissetmiyor') ||
                             lowerText.includes('iyi hissetmedim') ||
                             lowerText.includes('kendimi iyi hissetmiyor') ||
                             lowerText.includes('kendimi iyi hissetmedim') ||
                             lowerText.includes('yok') ||
                             lowerText.includes('yoktu') ||
                             lowerText.includes('yokum') ||
                             lowerText.includes('hiç') ||
                             lowerText.includes('asla') ||
                             lowerText.includes('bir şey yok') ||
                             lowerText.includes('hiçbir şey') ||
                             // İngilizce negatif bağlam
                             lowerText.includes('not good') ||
                             lowerText.includes('not well') ||
                             lowerText.includes('not happy') ||
                             lowerText.includes('not fine') ||
                             lowerText.includes('not great') ||
                             lowerText.includes('not okay') ||
                             lowerText.includes('am not') ||
                             lowerText.includes('is not') ||
                             lowerText.includes('are not') ||
                             lowerText.includes('was not') ||
                             lowerText.includes('were not') ||
                             lowerText.includes('do not') ||
                             lowerText.includes('does not') ||
                             lowerText.includes('did not') ||
                             lowerText.includes('feel bad') ||
                             lowerText.includes('feeling bad') ||
                             lowerText.includes('feels bad') ||
                             lowerText.includes('felt bad');
  
  positiveWords.forEach(word => {
    // Pozitif kelimeler negatif bağlamda kullanılmışsa sayma
    const positiveWordsToSkip = [
      'iyi', 'güzel', 'mutlu', 'neşeli', 'keyifli', 'zevkli', 'hoş',
      'good', 'well', 'fine', 'great', 'okay', 'happy', 'joyful', 'cheerful'
    ];
    
    if (positiveWordsToSkip.includes(word) && hasNegativeContext) {
      return; // Skip - negatif bağlamda kullanılmış pozitif kelime
    }
    if (lowerText.includes(word)) {
      positiveCount++;
    }
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) {
      negativeCount++;
    }
  });
  
  // Negatif kelimeler varsa ve pozitif kelimelerden fazlaysa negatif
  if (negativeCount > 0 && negativeCount >= positiveCount) {
    return 'negative';
  }
  
  // Pozitif kelimeler varsa ve negatif kelimelerden fazlaysa pozitif
  if (positiveCount > 0 && positiveCount > negativeCount) {
    return 'positive';
  }
  
  return 'neutral';
}

/**
 * Metni analiz eder ve duygu durumunu belirler
 */
async function analyzeSentiment(text: string): Promise<{ label: SentimentType; score: number; confidence: string }> {
  try {
    const result = await hf.textClassification({
      model: SENTIMENT_MODEL,
      inputs: text
    });

    // En yüksek score'a sahip olanı bul
    const sortedResults = [...result].sort((a, b) => (b.score || 0) - (a.score || 0));
    const topResult = sortedResults[0];

    // Label'ı lowercase yap ve sentiment'e çevir
    const labelStr = String(topResult.label).toLowerCase().trim();
    let label: SentimentType = 'neutral';

    if (labelStr.includes('positive') || labelStr === 'pozitif' || labelStr === 'pos' || labelStr === '1' || labelStr === 'LABEL_1') {
      label = 'positive';
    } else if (labelStr.includes('negative') || labelStr === 'negatif' || labelStr === 'neg' || labelStr === '0' || labelStr === 'LABEL_0') {
      label = 'negative';
    } else if (labelStr.includes('neutral') || labelStr === 'nötr' || labelStr === '2' || labelStr === 'LABEL_2') {
      label = 'neutral';
    } else {
      // Bilinmeyen label - anahtar kelime analizi kullan
      label = analyzeMultilingualSentiment(text);
    }

    // Anahtar kelime analizini her zaman kontrol et ve öncelik ver
    const keywordSentiment = analyzeMultilingualSentiment(text);
    const score = topResult.score || 0;
    
    // Eğer anahtar kelime analizi negatif diyorsa ve AI model pozitif veya nötr diyorsa, anahtar kelime analizine öncelik ver
    if (keywordSentiment === 'negative' && (label === 'positive' || label === 'neutral')) {
      label = 'negative';
      console.log(`✅ Anahtar kelime analizi sonucu: ${keywordSentiment} (AI model: ${label} yerine kullanıldı)`);
    } 
    // Eğer anahtar kelime analizi pozitif diyorsa ve AI model negatif veya nötr diyorsa, anahtar kelime analizine öncelik ver
    else if (keywordSentiment === 'positive' && (label === 'negative' || label === 'neutral')) {
      label = 'positive';
      console.log(`✅ Anahtar kelime analizi sonucu: ${keywordSentiment} (AI model: ${label} yerine kullanıldı)`);
    } 
    // Düşük skor durumunda anahtar kelime analizini kullan
    else if (score < 0.5 && keywordSentiment !== 'neutral') {
      label = keywordSentiment;
      console.log(`✅ Anahtar kelime analizi sonucu: ${keywordSentiment}`);
    }

    // Confidence hesapla
    const confidence = ((topResult.score || 0) * 100).toFixed(1);

    return {
      label: label,
      score: topResult.score || 0,
      confidence: confidence
    };
  } catch (error) {
    // Hata durumunda anahtar kelime tabanlı fallback kullan
    const fallbackSentiment = analyzeMultilingualSentiment(text);
    return {
      label: fallbackSentiment,
      score: 0.5,
      confidence: '50.0'
    };
  }
}

/**
 * Metnin dilini tespit eder (basit kontrol)
 */
function detectLanguage(text: string): 'tr' | 'en' {
  const lowerText = text.toLowerCase();
  // Yaygın İngilizce kelimeler
  const englishWords = ['the', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'this', 'that', 'with', 'from', 'and', 'but', 'or', 'not', 'you', 'your', 'i', 'am', 'be', 'been', 'being', 'do', 'does', 'did', 'get', 'got', 'go', 'went', 'come', 'came', 'see', 'saw', 'know', 'knew', 'think', 'thought', 'feel', 'felt', 'make', 'made', 'take', 'took', 'give', 'gave', 'say', 'said', 'tell', 'told', 'ask', 'asked', 'work', 'worked', 'call', 'called', 'try', 'tried', 'need', 'needed', 'want', 'wanted', 'like', 'liked', 'use', 'used', 'find', 'found', 'good', 'great', 'bad', 'happy', 'sad', 'tired', 'excited', 'angry', 'worried', 'stressed', 'anxious', 'depressed', 'hopeful', 'optimistic', 'pessimistic'];
  
  // Metinde İngilizce kelime var mı kontrol et
  const hasEnglishWord = englishWords.some(word => {
    // Kelime sınırları ile kontrol (basit regex)
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
  
  // İngilizce karakterlerin oranına bak (basit hesaplama)
  const englishCharCount = (lowerText.match(/[a-z]/g) || []).length;
  const turkishCharCount = (lowerText.match(/[çğıöşü]/g) || []).length;
  
  // Eğer İngilizce kelime varsa veya Türkçe karakter yoksa İngilizce kabul et
  if (hasEnglishWord || (englishCharCount > 0 && turkishCharCount === 0)) {
    return 'en';
  }
  
  return 'tr';
}

/**
 * Duygu durumuna göre özet oluşturur
 */
function generateSummary(text: string, sentiment: SentimentType): string {
  const language = detectLanguage(text);
  
  const templates = {
    tr: {
      positive: [
        'Bugün genel olarak olumlu bir gün geçirmişsin! 😊',
        'Harika bir ruh halindesin! ✨',
        'Pozitif enerjin çok güzel! 🌟'
      ],
      negative: [
        'Bugün biraz zorlu bir gün geçirmişsin. 😔',
        'Kendini şu an pek iyi hissetmiyorsun gibi görünüyor.',
        'Biraz zor bir dönemden geçiyor olabilirsin.'
      ],
      neutral: [
        'Bugün dengeli bir gün geçirmişsin.',
        'Duygusal olarak normal bir gündeydin.',
        'Sakin bir gün geçirmişsin.'
      ]
    },
    en: {
      positive: [
        'You had a generally positive day today! 😊',
        'You\'re in a great mood! ✨',
        'Your positive energy is wonderful! 🌟'
      ],
      negative: [
        'You had a bit of a challenging day today. 😔',
        'It seems like you\'re not feeling very well right now.',
        'You might be going through a difficult period.'
      ],
      neutral: [
        'You had a balanced day today.',
        'You were emotionally normal today.',
        'You had a calm day.'
      ]
    }
  };

  const sentimentTemplates = templates[language][sentiment] || templates[language].neutral;
  const randomIndex = Math.floor(Math.random() * sentimentTemplates.length);
  return sentimentTemplates[randomIndex];
}

/**
 * Duygu durumuna göre öneri oluşturur
 */
function generateSuggestion(text: string, sentiment: SentimentType): string {
  const lowerText = text.toLowerCase();
  const language = detectLanguage(text);

  // Spesifik kelime kontrolü
  if (lowerText.includes('yorgun') || lowerText.includes('tired')) {
    return language === 'en' 
      ? '💤 Take a 10-15 minute break and rest a bit.'
      : '💤 Kendine 10-15 dakikalık bir mola ver ve biraz dinlen.';
  }

  if (lowerText.includes('stresli') || lowerText.includes('stressed')) {
    return language === 'en'
      ? '🧘‍♀️ You can do deep breathing exercises or take a short walk.'
      : '🧘‍♀️ Derin nefes egzersizleri veya kısa bir yürüyüş yapabilirsin.';
  }

  if (lowerText.includes('mutlu') || lowerText.includes('happy')) {
    return language === 'en'
      ? '🎵 You can listen to a song you love to maintain this beautiful energy!'
      : '🎵 Bu güzel enerjiyi sürdürmek için sevdiğin bir şarkı dinleyebilirsin!';
  }

  // Kelime bulunamazsa sentiment'e göre template
  const suggestions = {
    tr: {
      positive: [
        '🎵 Bu güzel enerjiyi sürdürmek için sevdiğin bir aktivite yapabilirsin!',
        '✍️ Bu pozitif anı bir yere not edebilirsin.',
        '🤝 Sevdiklerinle bu mutluluğunu paylaşabilirsin.'
      ],
      negative: [
        '🚶‍♂️ Kısa bir yürüyüş yapmak iyi gelebilir.',
        '☕ Kendine sıcak bir içecek hazırlayıp 10 dakika mola verebilirsin.',
        '📝 Hissettiklerini yazmak rahatlatıcı olabilir.',
        '🎧 Rahatlatıcı müzik dinleyebilirsin.'
      ],
      neutral: [
        '📚 Bugün kendine vakit ayırabilirsin.',
        '🎯 Küçük bir hedef belirleyip üzerine odaklanabilirsin.',
        '🌿 Biraz temiz hava almak iyi olabilir.'
      ]
    },
    en: {
      positive: [
        '🎵 You can do an activity you love to maintain this beautiful energy!',
        '✍️ You can write down this positive moment somewhere.',
        '🤝 You can share this happiness with your loved ones.'
      ],
      negative: [
        '🚶‍♂️ Taking a short walk might help.',
        '☕ You can prepare a hot drink for yourself and take a 10-minute break.',
        '📝 Writing down your feelings can be relaxing.',
        '🎧 You can listen to calming music.'
      ],
      neutral: [
        '📚 You can take some time for yourself today.',
        '🎯 You can set a small goal and focus on it.',
        '🌿 Getting some fresh air might be good.'
      ]
    }
  };

  const sentimentSuggestions = suggestions[language][sentiment] || suggestions[language].neutral;
  const randomIndex = Math.floor(Math.random() * sentimentSuggestions.length);
  return sentimentSuggestions[randomIndex];
}

/**
 * Tam analiz yapar - ana fonksiyon
 */
export async function analyzeEntry(text: string): Promise<AIAnalysisResult> {
  // Validasyon
  if (!text || text.trim().length === 0) {
    throw new Error('Lütfen bir metin girin');
  }

  try {
    console.log('🤖 AI Model analiz başlatılıyor...', text);
    
    const sentimentResult = await analyzeSentiment(text);
    const summary = generateSummary(text, sentimentResult.label);
    const suggestion = generateSuggestion(text, sentimentResult.label);

    console.log('✅ AI Analiz tamamlandı');

    return {
      sentiment: sentimentResult.label,
      summary: summary,
      suggestion: suggestion,
    };
  } catch (error: any) {
    throw new Error('AI analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
  }
}
