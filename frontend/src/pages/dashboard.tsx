import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { cvAPI } from '@/lib/api';
import { Card, Button, Alert, Space, Typography, Spin, Empty } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  FormOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const [cvStatus, setCvStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCVStatus();
    }
  }, [user]);

  const fetchCVStatus = async () => {
    try {
      const response = await cvAPI.getStatus();
      setCvStatus(response.data);
    } catch (error) {
      console.error('Error fetching CV status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Dashboard</Title>

      {!cvStatus?.has_cv ? (
        <Card>
          <Empty
            image={<FileTextOutlined style={{ fontSize: '64px', color: '#bfbfbf' }} />}
            description={
              <Space direction="vertical">
                <Title level={4}>No CV Uploaded</Title>
                <Paragraph type="secondary">
                  Upload your CV to start asking questions and generate applications
                </Paragraph>
              </Space>
            }
          >
            <Button
              type="primary"
              size="large"
              icon={<FileTextOutlined />}
              onClick={() => router.push('/upload')}
            >
              Upload CV
            </Button>
          </Empty>
        </Card>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="CV Uploaded"
            description={cvStatus.cv.filename}
            type="success"
            icon={<CheckCircleOutlined />}
            showIcon
          />

          {cvStatus.cv.processed ? (
            <Card title="Available Services">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Paragraph>
                  Your CV has been processed and vectorized. You can now use all our AI-powered services.
                </Paragraph>
                <Space size="middle" wrap>
                  <Button
                    type="primary"
                    size="large"
                    icon={<MessageOutlined />}
                    onClick={() => router.push('/chat')}
                  >
                    Chat About Your CV
                  </Button>
                  <Button
                    size="large"
                    icon={<FormOutlined />}
                    onClick={() => router.push('/application')}
                  >
                    Generate Application
                  </Button>
                  <Button
                    size="large"
                    icon={<FileTextOutlined />}
                    onClick={() => router.push('/upload')}
                  >
                    Upload New CV
                  </Button>
                </Space>
              </Space>
            </Card>
          ) : (
            <Alert
              message="Processing Your CV"
              description="Your CV is being processed and vectorized. This may take a few moments. Please refresh to check status."
              type="warning"
              icon={<ClockCircleOutlined />}
              showIcon
            />
          )}
        </Space>
      )}
    </Space>
  );
}
