import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert as RNAlert,
} from 'react-native';
import { applicationAPI } from '../api';
import { ApplicationHistory } from '../types';
import { COLORS, SPACING } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ApplicationHistoryScreen() {
  const navigation = useNavigation();
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await applicationAPI.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleViewDetail = (item: ApplicationHistory) => {
    (navigation as any).navigate('ApplicationDetail', { application: item });
  };

  const handleDelete = (id: number) => {
    RNAlert.alert(
      'Delete Application',
      'Are you sure you want to delete this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await applicationAPI.deleteApplication(id);
              setHistory(history.filter((item) => item.id !== id));
              RNAlert.alert('Success', 'Application deleted');
            } catch (error) {
              RNAlert.alert('Error', 'Failed to delete application');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    RNAlert.alert(
      'Clear All History',
      'Are you sure you want to clear all application history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await applicationAPI.clearHistory();
              setHistory([]);
              RNAlert.alert('Success', 'Application history cleared');
            } catch (error) {
              RNAlert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ApplicationHistory }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleViewDetail(item)}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.application_type === 'email' ? 'mail' : 'document-text'}
          size={24}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.type}>
            {item.application_type === 'email' ? 'Email' : 'Cover Letter'}
          </Text>
          {item.subject && <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.job_description}
        </Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {history.length > 0 && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Applications</Text>
          <Text style={styles.emptyDescription}>
            Your generated applications will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
    marginLeft: SPACING.xs,
  },
  list: {
    padding: SPACING.md,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    marginBottom: SPACING.xs,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  subject: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
