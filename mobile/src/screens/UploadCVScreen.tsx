import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert as RNAlert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { cvAPI } from '../api';
import { Card, Alert, Button } from '../components';
import { COLORS, SPACING } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function UploadCVScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setUploadSuccess(false);
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
      
      setUploadSuccess(true);
      setSelectedFile(null);
      
      // Update user status
      if (user) {
        updateUser({ ...user, has_cv: true });
      }

      RNAlert.alert(
        'Success',
        'CV uploaded successfully! It will be processed shortly.',
        [
          {
            text: 'Go to Dashboard',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]
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
              
              // Update user status
              if (user) {
                updateUser({ ...user, has_cv: false });
              }

              RNAlert.alert('Success', 'CV deleted successfully');
              navigation.navigate('Dashboard');
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card title="Upload Your CV">
        <Text style={styles.description}>
          Upload your CV in PDF format. It will be processed and vectorized for AI-powered analysis.
        </Text>

        {uploadSuccess && (
          <Alert
            type="success"
            message="CV Uploaded Successfully!"
            description="Your CV is being processed. You can now use all our services."
          />
        )}

        <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
          <Ionicons name="cloud-upload-outline" size={48} color={COLORS.primary} />
          <Text style={styles.uploadText}>
            {selectedFile ? selectedFile.name : 'Tap to select PDF file'}
          </Text>
          {selectedFile && (
            <View style={styles.fileInfo}>
              <Ionicons name="document" size={20} color={COLORS.secondary} />
              <Text style={styles.fileName}>{selectedFile.name}</Text>
            </View>
          )}
        </TouchableOpacity>

        {selectedFile && (
          <View style={styles.buttonContainer}>
            <Button
              title="Upload CV"
              onPress={handleUpload}
              loading={uploading}
              fullWidth
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSelectedFile(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {user?.has_cv && (
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <Text style={styles.dangerDescription}>
              Delete your current CV and all associated data
            </Text>
            <Button
              title="Delete CV"
              onPress={handleDelete}
              variant="danger"
              fullWidth
            />
          </View>
        )}
      </Card>

      <Card title="Requirements">
        <View style={styles.requirement}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
          <Text style={styles.requirementText}>PDF format only</Text>
        </View>
        <View style={styles.requirement}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
          <Text style={styles.requirementText}>Maximum file size: 10MB</Text>
        </View>
        <View style={styles.requirement}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
          <Text style={styles.requirementText}>Clear, readable text</Text>
        </View>
        <View style={styles.requirement}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
          <Text style={styles.requirementText}>Processing takes 10-30 seconds</Text>
        </View>
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
  uploadArea: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: '#f0f5ff',
  },
  uploadText: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  buttonContainer: {
    marginTop: SPACING.md,
  },
  cancelButton: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  dangerZone: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: '#fff1f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
    marginBottom: SPACING.xs,
  },
  dangerDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
});
