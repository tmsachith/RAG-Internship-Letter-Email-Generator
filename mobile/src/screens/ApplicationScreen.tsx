import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert as RNAlert,
  Clipboard,
} from 'react-native';
import { applicationAPI } from '../api';
import { Card, Button, Alert } from '../components';
import { COLORS, SPACING } from '../utils/constants';
import { ApplicationResult, ApplicationHistory } from '../types';
import { Ionicons } from '@expo/vector-icons';

export default function ApplicationScreen({ navigation }: any) {
  const [jobDescription, setJobDescription] = useState('');
  const [applicationType, setApplicationType] = useState<'cover_letter' | 'email'>('cover_letter');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplicationResult | null>(null);
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await applicationAPI.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      RNAlert.alert('Error', 'Please enter a job description');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await applicationAPI.generate(jobDescription, applicationType);
      setResult(data);
      fetchHistory(); // Refresh history
    } catch (error: any) {
      RNAlert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to generate application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      const textToCopy = result.subject
        ? `Subject: ${result.subject}\n\n${result.content}`
        : result.content;
      Clipboard.setString(textToCopy);
      RNAlert.alert('Success', 'Copied to clipboard!');
    }
  };

  const handleViewHistory = (item: ApplicationHistory) => {
    navigation.navigate('ApplicationDetail', { application: item });
  };

  const stripHtml = (html: string) => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '$1')
      .replace(/<em>(.*?)<\/em>/gi, '$1')
      .replace(/<[^>]*>/g, '');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card title="Generate Application">
        <Text style={styles.description}>
          Create a personalized cover letter or email based on your CV and the job description.
        </Text>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              applicationType === 'cover_letter' && styles.typeButtonActive,
            ]}
            onPress={() => setApplicationType('cover_letter')}
          >
            <Ionicons
              name="document-text"
              size={24}
              color={applicationType === 'cover_letter' ? '#ffffff' : COLORS.primary}
            />
            <Text
              style={[
                styles.typeButtonText,
                applicationType === 'cover_letter' && styles.typeButtonTextActive,
              ]}
            >
              Cover Letter
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              applicationType === 'email' && styles.typeButtonActive,
            ]}
            onPress={() => setApplicationType('email')}
          >
            <Ionicons
              name="mail"
              size={24}
              color={applicationType === 'email' ? '#ffffff' : COLORS.primary}
            />
            <Text
              style={[
                styles.typeButtonText,
                applicationType === 'email' && styles.typeButtonTextActive,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Job Description</Text>
        <TextInput
          style={styles.textArea}
          value={jobDescription}
          onChangeText={setJobDescription}
          placeholder="Paste the job description here..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <Button
          title={loading ? 'Generating...' : 'Generate Application'}
          onPress={handleGenerate}
          loading={loading}
          fullWidth
        />

        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Generated Result</Text>
              <TouchableOpacity onPress={handleCopy}>
                <Ionicons name="copy-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {result.subject && (
              <View style={styles.subjectContainer}>
                <Text style={styles.subjectLabel}>Subject:</Text>
                <Text style={styles.subjectText}>{result.subject}</Text>
              </View>
            )}

            <ScrollView style={styles.contentScroll} nestedScrollEnabled>
              <Text style={styles.contentText}>{stripHtml(result.content)}</Text>
            </ScrollView>
          </View>
        )}
      </Card>

      <Card title="Recent Applications">
        {loadingHistory ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>No applications yet</Text>
        ) : (
          <View>
            {history.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyItem}
                onPress={() => handleViewHistory(item)}
              >
                <View style={styles.historyIcon}>
                  <Ionicons
                    name={item.application_type === 'email' ? 'mail' : 'document-text'}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyType}>
                    {item.application_type === 'email' ? 'Email' : 'Cover Letter'}
                  </Text>
                  <Text style={styles.historyDescription} numberOfLines={2}>
                    {item.job_description}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}

            {history.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('History', { screen: 'ApplicationHistory' })}
              >
                <Text style={styles.viewAllText}>View All Applications</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>
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
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 14,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    minHeight: 150,
    marginBottom: SPACING.md,
  },
  resultContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  subjectContainer: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: '#e6f7ff',
    borderRadius: 6,
  },
  subjectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  contentScroll: {
    maxHeight: 300,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  historyContent: {
    flex: 1,
  },
  historyType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  historyDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  viewAllButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
