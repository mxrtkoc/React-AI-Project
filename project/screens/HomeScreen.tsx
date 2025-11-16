import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, Send } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { analyzeEntry, AIAnalysisResult } from '../services/aiService';
import { entriesAPI } from '../lib/api';

const sentimentColors = {
  positive: '#34C759',
  neutral: '#FF9500',
  negative: '#FF3B30',
};

const sentimentEmojis = {
  positive: '😊',
  neutral: '😐',
  negative: '😔',
};

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [entry, setEntry] = useState('');
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleAnalyze = async () => {
    if (!entry.trim()) {
      setError(t('home.enterText'));
      return;
    }

    setError('');
    setLoading(true);
    setSaved(false);

    try {
      const result = await analyzeEntry(entry);
      setAnalysis(result);

      await entriesAPI.create({
        content: entry,
        sentiment: result.sentiment,
        summary: result.summary,
        suggestion: result.suggestion,
      });

      setSaved(true);
    } catch (err: any) {
      setError(err.message || t('home.analysisError'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewEntry = () => {
    setEntry('');
    setAnalysis(null);
    setError('');
    setSaved(false);
  };

  const backgroundColor = analysis
    ? sentimentColors[analysis.sentiment]
    : colors.background;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Sparkles size={32} color={colors.primary} />
          <Text style={[styles.title, { color: analysis ? '#fff' : colors.text }]}>{t('home.title')}</Text>
        </View>

        {!analysis ? (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('home.howFeel')}
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              multiline
              numberOfLines={6}
              value={entry}
              onChangeText={setEntry}
              placeholder={t('home.placeholder')}
              placeholderTextColor={colors.textSecondary}
              editable={!loading}
            />

            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.analyzeButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
              onPress={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Send size={20} color="#fff" />
                  <Text style={styles.analyzeButtonText}>{t('home.analyze')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <View style={[styles.sentimentBadge, { backgroundColor: colors.surface }]}>
              <Text style={styles.sentimentEmoji}>
                {sentimentEmojis[analysis.sentiment]}
              </Text>
              <Text style={[styles.sentimentText, { color: colors.text }]}>
                {analysis.sentiment === 'positive'
                  ? t('home.positive')
                  : analysis.sentiment === 'neutral'
                    ? t('home.neutral')
                    : t('home.negative')}
              </Text>
            </View>

            <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{t('home.summary')}</Text>
              <Text style={[styles.resultText, { color: colors.text }]}>{analysis.summary}</Text>
            </View>

            <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{t('home.suggestion')}</Text>
              <Text style={[styles.resultText, { color: colors.text }]}>{analysis.suggestion}</Text>
            </View>

            {saved && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedText}>{t('home.saved')}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.newEntryButton, { backgroundColor: colors.primary }]}
              onPress={handleNewEntry}
            >
              <Text style={styles.newEntryButtonText}>{t('home.newEntry')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: '500',
  },
  textInput: {
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    gap: 10,
  },
  sentimentEmoji: {
    fontSize: 40,
  },
  sentimentText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
  },
  savedBadge: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  savedText: {
    color: '#fff',
    fontWeight: '600',
  },
  newEntryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  newEntryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    textAlign: 'center',
    marginTop: 10,
  },
});
