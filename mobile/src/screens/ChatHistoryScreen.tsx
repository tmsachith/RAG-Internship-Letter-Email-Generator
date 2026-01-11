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
import { chatAPI } from '../api';
import { ChatHistory } from '../types';
import { Card } from '../components';
import { COLORS, SPACING } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';

export default function ChatHistoryScreen() {
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await chatAPI.getHistory();
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

  const handleDelete = (id: number) => {
    RNAlert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatAPI.deleteMessage(id);
              setHistory(history.filter((item) => item.id !== id));
              RNAlert.alert('Success', 'Message deleted');
            } catch (error) {
              RNAlert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    RNAlert.alert(
      'Clear All History',
      'Are you sure you want to clear all chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatAPI.clearHistory();
              setHistory([]);
              RNAlert.alert('Success', 'Chat history cleared');
            } catch (error) {
              RNAlert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ChatHistory }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <View style={styles.questionContainer}>
          <Ionicons name="person-circle" size={20} color={COLORS.primary} />
          <Text style={styles.question}>{item.question}</Text>
        </View>
        <View style={styles.answerContainer}>
          <Ionicons name="chatbox" size={20} color={COLORS.secondary} />
          <Text style={styles.answer} numberOfLines={3}>
            {item.answer}
          </Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
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
          <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Chat History</Text>
          <Text style={styles.emptyDescription}>
            Your chat conversations will appear here
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
  itemContent: {
    flex: 1,
  },
  questionContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  answerContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  answer: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
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
