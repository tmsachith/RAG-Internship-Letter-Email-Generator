import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert as RNAlert,
} from 'react-native';
import { Card, Button } from '../components';
import { COLORS, SPACING } from '../utils/constants';
import { ApplicationHistory } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { applicationAPI } from '../api';

export default function ApplicationDetailScreen({ route, navigation }: any) {
  const application: ApplicationHistory = route.params.application;

  const stripHtml = (html: string) => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '$1')
      .replace(/<em>(.*?)<\/em>/gi, '$1')
      .replace(/<[^>]*>/g, '');
  };

  const handleCopy = () => {
    const textToCopy = application.subject
      ? `Subject: ${application.subject}\n\n${stripHtml(application.content)}`
      : stripHtml(application.content);
    Clipboard.setString(textToCopy);
    RNAlert.alert('Success', 'Copied to clipboard!');
  };

  const handleDelete = () => {
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
              await applicationAPI.deleteApplication(application.id);
              RNAlert.alert('Success', 'Application deleted');
              navigation.goBack();
            } catch (error) {
              RNAlert.alert('Error', 'Failed to delete application');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <Ionicons
              name={application.application_type === 'email' ? 'mail' : 'document-text'}
              size={24}
              color={COLORS.primary}
            />
            <Text style={styles.type}>
              {application.application_type === 'email' ? 'Email' : 'Cover Letter'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleCopy}>
            <Ionicons name="copy-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.date}>
          {new Date(application.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </Card>

      <Card title="Job Description">
        <Text style={styles.jobDescription}>{application.job_description}</Text>
      </Card>

      {application.subject && (
        <Card title="Subject">
          <Text style={styles.subject}>{application.subject}</Text>
        </Card>
      )}

      <Card title="Content">
        <ScrollView style={styles.contentScroll} nestedScrollEnabled>
          <Text style={styles.content}>{stripHtml(application.content)}</Text>
        </ScrollView>
      </Card>

      <View style={styles.actions}>
        <Button title="Delete" onPress={handleDelete} variant="danger" fullWidth />
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  subject: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  contentScroll: {
    maxHeight: 400,
  },
  actions: {
    marginTop: SPACING.md,
  },
});
