import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert as RNAlert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
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
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

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

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      RNAlert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      RNAlert.alert('Error', 'Please select a PDF file first');
      return;
    }

    setUploading(true);
    try {
      await cvAPI.upload(selectedFile.uri, selectedFile.name, selectedFile.mimeType);
      
      setSelectedFile(null);
      await fetchCVStatus();

      RNAlert.alert(
        'Success',
        'CV uploaded successfully! It will be processed shortly.\n\nNote: For your privacy, the CV file is automatically deleted from cloud storage after processing.'
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      RNAlert.alert(
        'Upload Failed',
        error.response?.data?.detail || 'Failed to upload CV. Please try again.'
      );
    } finally {
      setUploading(false);
    }
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
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerIconContainer}>
            <Ionicons name="briefcase" size={40} color="#ffffff" />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>RAG CV System</Text>
            <Text style={styles.bannerSubtitle}>AI-Powered Career Assistant</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {!cvStatus?.has_cv ? (
          <Card>
            <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No CV Uploaded</Text>
            <Text style={styles.emptyDescription}>
              Upload your CV to start asking questions and generate applications
            </Text>
            
            {selectedFile ? (
              <View style={styles.selectedFileContainer}>
                <View style={styles.fileInfo}>
                  <Ionicons name="document" size={24} color={COLORS.primary} />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                </View>
                <View style={styles.fileActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.outlineButton]}
                    onPress={pickDocument}
                  >
                    <Text style={styles.outlineButtonText}>Change File</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleUpload}
                    disabled={uploading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {uploading ? 'Uploading...' : 'Upload CV'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickDocument}
              >
                <Ionicons name="cloud-upload" size={20} color="#ffffff" style={styles.uploadIcon} />
                <Text style={styles.uploadButtonText}>Select CV (PDF)</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.privacyNotice}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.secondary} />
              <Text style={styles.privacyText}>
                For your privacy, uploaded CV files are automatically deleted from cloud storage after processing.
              </Text>
            </View>
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
    padding: 0,
  },
  banner: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    padding: SPACING.md,
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
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
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
  selectedFileContainer: {
    width: '100%',
    marginTop: SPACING.md,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  fileActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  uploadIcon: {
    marginRight: SPACING.sm,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.lg,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    lineHeight: 16,
  },
});
