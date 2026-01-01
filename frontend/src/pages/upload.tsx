import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { cvAPI } from '@/lib/api';
import {
  Upload as AntUpload,
  Button,
  Alert,
  Card,
  Typography,
  Space,
  Spin,
  Progress,
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = AntUpload;

export default function Upload() {
  const { user, loading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf',
    maxCount: 1,
    beforeUpload: (file) => {
      setFile(file);
      setError('');
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setFile(null);
    },
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await cvAPI.upload(file);
      setSuccess(true);
      setProcessing(true);

      // Poll for CV processing completion
      const checkProcessing = setInterval(async () => {
        try {
          const response = await cvAPI.getStatus();
          if (response.data.has_cv && response.data.cv.processed) {
            clearInterval(checkProcessing);
            setProcessing(false);
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking CV status:', error);
        }
      }, 2000); // Check every 2 seconds

      // Timeout after 2 minutes
      setTimeout(() => {
        clearInterval(checkProcessing);
        if (processing) {
          router.push('/dashboard');
        }
      }, 120000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
      setUploading(false);
      setProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Upload Your CV</Title>

      {error && <Alert message={error} type="error" showIcon closable />}

      {success && !processing && (
        <Alert
          message="Success"
          description="CV uploaded successfully! Redirecting..."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      )}

      {processing && (
        <Alert
          message="Processing Your CV"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                Your CV is being processed and vectorized. This may take a few moments.
              </Paragraph>
              <Progress percent={100} status="active" showInfo={false} />
            </Space>
          }
          type="info"
          showIcon
          icon={<LoadingOutlined />}
        />
      )}

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Dragger {...uploadProps} disabled={uploading || processing}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag your CV to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for PDF files only. Make sure your CV contains your work experience,
              skills, and education.
            </p>
          </Dragger>

          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={() => router.push('/dashboard')}>Cancel</Button>
            <Button
              type="primary"
              size="large"
              icon={<UploadOutlined />}
              onClick={handleUpload}
              disabled={!file || uploading || processing}
              loading={uploading || processing}
            >
              {uploading ? 'Uploading...' : processing ? 'Processing...' : 'Upload CV'}
            </Button>
          </Space>
        </Space>
      </Card>
    </Space>
  );
}
