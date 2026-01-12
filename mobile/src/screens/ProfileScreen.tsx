import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert as RNAlert,
  RefreshControl,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { cvAPI } from '../api';
import { Card, Button, SwipeToConfirm } from '../components';
import { COLORS, SPACING } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { CVStatus } from '../types';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [cvStatus, setCvStatus] = useState<CVStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCVStatus();
  }, []);

  const fetchCVStatus = async () => {
    try {
      const status = await cvAPI.getStatus();
      setCvStatus(status);
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

  const handleDelete = async () => {
    RNAlert.alert(
      'Delete CV',
      'Are you sure you want to delete your CV? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await cvAPI.delete();
              await fetchCVStatus();
              RNAlert.alert('Success', 'CV deleted successfully');
            } catch (error: any) {
              RNAlert.alert(
                'Error',
                error.response?.data?.detail || 'Failed to delete CV'
              );
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.cardSpacing}>
          <Card>
            <View style={styles.profileHeader}>
              <Ionicons name="person-circle" size={80} color={COLORS.primary} />
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </Card>
        </View>

        <View style={styles.cardSpacing}>
          <Card title="CV Management">
          {cvStatus?.has_cv ? (
            <View>
              <View style={styles.cvStatusContainer}>
                <View style={styles.statusRow}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.secondary} />
                  <Text style={styles.statusText}>CV Uploaded</Text>
                </View>
                {cvStatus.cv?.filename && (
                  <Text style={styles.fileName}>{cvStatus.cv.filename}</Text>
                )}
                {cvStatus.cv?.uploaded_at && (
                  <Text style={styles.uploadDate}>
                    Uploaded: {new Date(cvStatus.cv.uploaded_at).toLocaleDateString()}
                  </Text>
                )}
              </View>

              <View style={styles.privacyNotice}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
                <Text style={styles.privacyText}>
                  Your CV is stored securely. Uploaded files are automatically deleted from cloud storage after processing to protect your privacy.
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <Button
                  title="Upload New CV"
                  onPress={pickDocument}
                  variant="primary"
                  fullWidth={true}
                />
                <View style={{ height: SPACING.sm }} />
                <Button
                  title="Delete CV"
                  onPress={handleDelete}
                  variant="danger"
                  fullWidth={true}
                />
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.noCvContainer}>
                <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
                <Text style={styles.noCvTitle}>No CV Uploaded</Text>
                <Text style={styles.noCvDescription}>
                  Upload your CV to start using the application features
                </Text>
              </View>

              <Button
                title="Upload CV"
                onPress={pickDocument}
                variant="primary"
                fullWidth={true}
              />

              <View style={styles.privacyNotice}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
                <Text style={styles.privacyText}>
                  For your privacy, uploaded CV files are automatically deleted from cloud storage after processing.
                </Text>
              </View>
            </View>
          )}

          {selectedFile && (
            <View style={styles.selectedFileContainer}>
              <View style={styles.selectedFileHeader}>
                <Ionicons name="document" size={24} color={COLORS.primary} />
                <Text style={styles.selectedFileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
              </View>
              <View style={styles.fileActions}>
                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Button
                  title="Upload"
                  onPress={handleUpload}
                  loading={uploading}
                  disabled={uploading}
                />
              </View>
            </View>
          )}
        </Card>
        </View>

        <Card>
          <SwipeToConfirm
            onConfirm={handleLogout}
            text="Swipe to logout"
            confirmText="Release to logout"
            icon="log-out-outline"
            color={COLORS.danger}
            backgroundColor="#fff5f5"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    padding: SPACING.md,
  },
  cardSpacing: {
    marginBottom: SPACING.md,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  cvStatusContainer: {
    marginBottom: SPACING.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  fileName: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 32,
  },
  uploadDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 32,
    marginTop: SPACING.xs,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 32,
    marginTop: SPACING.xs,
  },
  privacyNotice: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
  actionButtons: {
    marginTop: SPACING.sm,
  },
  noCvContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  noCvTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  noCvDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  selectedFileContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
    marginLeft: SPACING.sm,
  },
});
