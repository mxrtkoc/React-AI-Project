import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BarChart3 } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { weeklyAPI } from '../lib/api';

type WeeklySummary = {
  totalEntries: number;
  positive: number;
  neutral: number;
  negative: number;
  dominantSentiment: 'positive' | 'neutral' | 'negative';
  startDate: string;
  endDate: string;
};

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

export default function WeeklyScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeeklySummary = async () => {
    try {
      const data = await weeklyAPI.getSummary();
      
      setSummary({
        totalEntries: data.totalEntries,
        positive: data.positive,
        neutral: data.neutral,
        negative: data.negative,
        dominantSentiment: data.dominantSentiment,
        startDate: data.startDate,
        endDate: data.endDate,
      });
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeeklySummary();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeeklySummary();
  };

  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const getDominantSentimentMessage = (sentiment: string) => {
    const messages = {
      tr: {
        positive: 'Harika! Bu hafta genelde pozitif bir ruh hali içindesin. Böyle devam et!',
        neutral: 'Bu hafta dengeli bir hafta geçirmişsin. Duygusal durumun stabil görünüyor.',
        negative: 'Bu hafta biraz zorlandığın anlaşılıyor. Kendine iyi bak ve destek almayı unutma.',
      },
      en: {
        positive: 'Great! You\'ve been in a generally positive mood this week. Keep it up!',
        neutral: 'You\'ve had a balanced week. Your emotional state seems stable.',
        negative: 'It seems like you\'ve had a bit of a tough week. Take care of yourself and don\'t forget to seek support.',
      },
    };
    return messages[t('weekly.title') === 'Weekly Summary' ? 'en' : 'tr'][sentiment as keyof typeof messages.tr];
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <BarChart3 size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>{t('weekly.title')}</Text>
      </View>

      {!summary || summary.totalEntries === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('weekly.empty')}
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={[styles.dateRange, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dateRangeText, { color: colors.textSecondary }]}>
              {new Date(summary.startDate).toLocaleDateString(t('weekly.title') === 'Weekly Summary' ? 'en-US' : 'tr-TR')} - {new Date(summary.endDate).toLocaleDateString(t('weekly.title') === 'Weekly Summary' ? 'en-US' : 'tr-TR')}
            </Text>
          </View>

          <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.totalLabel}>{t('weekly.total')} {t('weekly.entries')}</Text>
            <Text style={styles.totalNumber}>{summary.totalEntries}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View
              style={[
                styles.statCard,
                { 
                  borderLeftColor: sentimentColors.positive,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <LinearGradient
                colors={[sentimentColors.positive + '40', sentimentColors.positive + '00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.glowOverlay}
              />
              <Text style={styles.statEmoji}>{sentimentEmojis.positive}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('weekly.positive')}</Text>
              <Text style={[styles.statNumber, { color: colors.text }]}>{summary.positive}</Text>
              <Text style={[styles.statPercentage, { color: colors.textSecondary }]}>
                {getPercentage(summary.positive, summary.totalEntries)}%
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { 
                  borderLeftColor: sentimentColors.neutral,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <LinearGradient
                colors={[sentimentColors.neutral + '40', sentimentColors.neutral + '00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.glowOverlay}
              />
              <Text style={styles.statEmoji}>{sentimentEmojis.neutral}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('weekly.neutral')}</Text>
              <Text style={[styles.statNumber, { color: colors.text }]}>{summary.neutral}</Text>
              <Text style={[styles.statPercentage, { color: colors.textSecondary }]}>
                {getPercentage(summary.neutral, summary.totalEntries)}%
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { 
                  borderLeftColor: sentimentColors.negative,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <LinearGradient
                colors={[sentimentColors.negative + '40', sentimentColors.negative + '00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.glowOverlay}
              />
              <Text style={styles.statEmoji}>{sentimentEmojis.negative}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('weekly.negative')}</Text>
              <Text style={[styles.statNumber, { color: colors.text }]}>{summary.negative}</Text>
              <Text style={[styles.statPercentage, { color: colors.textSecondary }]}>
                {getPercentage(summary.negative, summary.totalEntries)}%
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.messageCard,
              {
                backgroundColor:
                  sentimentColors[summary.dominantSentiment] + '20',
              },
            ]}
          >
            <Text style={[styles.messageTitle, { color: colors.text }]}>
              {t('weekly.title') === 'Weekly Summary' ? 'Weekly Evaluation' : 'Haftalık Değerlendirme'}
            </Text>
            <Text style={[styles.messageText, { color: colors.text }]}>
              {getDominantSentimentMessage(summary.dominantSentiment)}
            </Text>
          </View>

          <View style={styles.visualBar}>
            {summary.positive > 0 && (
              <View
                style={[
                  styles.barSegment,
                  {
                    flex: summary.positive,
                    backgroundColor: sentimentColors.positive,
                  },
                ]}
              />
            )}
            {summary.neutral > 0 && (
              <View
                style={[
                  styles.barSegment,
                  {
                    flex: summary.neutral,
                    backgroundColor: sentimentColors.neutral,
                  },
                ]}
              />
            )}
            {summary.negative > 0 && (
              <View
                style={[
                  styles.barSegment,
                  {
                    flex: summary.negative,
                    backgroundColor: sentimentColors.negative,
                  },
                ]}
              />
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    padding: 15,
  },
  dateRange: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalCard: {
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  totalNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderLeftWidth: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  glowOverlay: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: 0,
    bottom: -2,
    borderRadius: 15,
    pointerEvents: 'none',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  statPercentage: {
    fontSize: 12,
  },
  messageCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  visualBar: {
    flexDirection: 'row',
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  barSegment: {
    height: '100%',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
