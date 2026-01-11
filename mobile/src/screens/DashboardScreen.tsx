import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { cvAPI } from '../api';
import { Card, Alert, Button } from '../components';
import { COLORS, SPACING } from '../utils/constants';
import { CVStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();
  const [cvStatus, setCvStatus] = useState<CVStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCVStatus();
  }, []);

  const fetchCVStatus = async () => {
    try {
      const status = await cvAPI.getStatus();
      setCvStatus(status);
      
      // Update user CV status
      if (user) {
        updateUser({ ...user, has_cv: status.has_cv });
      }
    } catch (error) {
      console.error('Error fetching CV status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCVStatus();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {user?.email}</Text>
      </View>

      {!cvStatus?.has_cv ? (
        <Card>
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No CV Uploaded</Text>
            <Text style={styles.emptyDescription}>
              Upload your CV to start asking questions and generate applications
            </Text>
            <Button
              title="Upload CV"
              onPress={() => navigation.navigate('UploadCV')}
              fullWidth
            />
          </View>
        </Card>
      ) : (
        <View>
          <Alert
            type="success"
            message="CV Uploaded"
            description={cvStatus.cv?.filename}
          />

          {cvStatus.cv?.processed ? (
            <Card title="Available Services">
              <Text style={styles.description}>
                Your CV has been processed and vectorized. You can now use all our AI-powered services.
              </Text>

              <View style={styles.servicesGrid}>
                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate('Chat')}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#e6f7ff' }]}>
                    <Ionicons name="chatbubbles" size={32} color={COLORS.primary} />
                  </View>
                  <Text style={styles.serviceTitle}>Chat About CV</Text>
                  <Text style={styles.serviceDescription}>
                    Ask questions about your CV
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate('Application')}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#f0f5ff' }]}>
                    <Ionicons name="document" size={32} color="#722ed1" />
                  </View>
                  <Text style={styles.serviceTitle}>Generate Application</Text>
                  <Text style={styles.serviceDescription}>
                    Create cover letters & emails
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate('UploadCV')}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#fff7e6' }]}>
                    <Ionicons name="cloud-upload" size={32} color={COLORS.warning} />
                  </View>
                  <Text style={styles.serviceTitle}>Upload New CV</Text>
                  <Text style={styles.serviceDescription}>
                    Replace your current CV
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate('History')}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#f6ffed' }]}>
                    <Ionicons name="time" size={32} color={COLORS.secondary} />
                  </View>
                  <Text style={styles.serviceTitle}>View History</Text>
                  <Text style={styles.serviceDescription}>
                    See past chats & applications
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <Alert
              type="warning"
              message="Processing Your CV"
              description="Your CV is being processed. This may take a few moments. Pull down to refresh."
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
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
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    margin: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  serviceDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
