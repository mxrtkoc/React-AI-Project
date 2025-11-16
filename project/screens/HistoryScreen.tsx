import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { History as HistoryIcon } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { entriesAPI } from '../lib/api';

type Entry = {
  id: number;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  suggestion: string;
  created_at: string;
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

export default function HistoryScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchEntries = async () => {
    try {
      const entries = await entriesAPI.getAll();
      setEntries(entries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('history.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('history.yesterday');
    } else {
      const locale = t('history.today') === 'Today' ? 'en-US' : 'tr-TR';
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  const renderEntry = ({ item }: { item: Entry }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.entryCard,
          { 
            borderLeftColor: sentimentColors[item.sentiment],
            backgroundColor: colors.surface,
          },
        ]}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryHeaderLeft}>
            <Text style={styles.entryEmoji}>
              {sentimentEmojis[item.sentiment]}
            </Text>
            <View>
              <Text style={[styles.entryDate, { color: colors.text }]}>{formatDate(item.created_at)}</Text>
              <Text style={[styles.entrySentiment, { color: colors.textSecondary }]}>
                {item.sentiment === 'positive'
                  ? t('home.positive')
                  : item.sentiment === 'neutral'
                    ? t('home.neutral')
                    : t('home.negative')}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={[styles.entryContent, { color: colors.textSecondary }]}
          numberOfLines={isExpanded ? undefined : 2}
        >
          {item.content}
        </Text>

        {isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t('home.summary')}</Text>
              <Text style={[styles.detailText, { color: colors.text }]}>{item.summary}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t('home.suggestion')}</Text>
              <Text style={[styles.detailText, { color: colors.text }]}>{item.suggestion}</Text>
            </View>
          </View>
        )}

        <Text style={[styles.tapHint, { color: colors.textSecondary }]}>
          {isExpanded ? (t('history.today') === 'Today' ? 'Tap to close' : 'Kapatmak için dokun') : (t('history.today') === 'Today' ? 'Tap for details' : 'Detaylar için dokun')}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <HistoryIcon size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>{t('history.title')}</Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('history.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
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
  listContent: {
    padding: 15,
  },
  entryCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  entryEmoji: {
    fontSize: 32,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  entrySentiment: {
    fontSize: 12,
  },
  entryContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  detailSection: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tapHint: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
