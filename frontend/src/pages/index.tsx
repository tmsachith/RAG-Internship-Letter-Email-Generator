import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Typography, Space, Card, Row, Col } from 'antd';
import {
  RocketOutlined,
  FileTextOutlined,
  MessageOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const features = [
    {
      icon: <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: 'CV Analysis',
      description: 'Upload your CV and let AI analyze your experience and skills',
    },
    {
      icon: <MessageOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      title: 'Interactive Chat',
      description: 'Ask questions about your CV and get instant AI-powered answers',
    },
    {
      icon: <RocketOutlined style={{ fontSize: '48px', color: '#fa8c16' }} />,
      title: 'Application Generator',
      description: 'Generate personalized cover letters and emails for job applications',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '48px', color: '#eb2f96' }} />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and stored securely with user authentication',
    },
  ];

  return (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={1} style={{ fontSize: '48px', marginBottom: '16px' }}>
            RAG CV Assistant
          </Title>
          <Paragraph style={{ fontSize: '20px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            Leverage the power of AI to analyze your CV, chat about your experience, and generate professional applications
          </Paragraph>
        </div>

        <Space size="middle">
          <Button
            type="primary"
            size="large"
            onClick={() => router.push('/login')}
            style={{ height: '48px', padding: '0 40px', fontSize: '16px' }}
          >
            Login
          </Button>
          <Button
            size="large"
            onClick={() => router.push('/signup')}
            style={{ height: '48px', padding: '0 40px', fontSize: '16px' }}
          >
            Sign Up
          </Button>
        </Space>

        <Row gutter={[24, 24]} style={{ marginTop: '60px' }}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                style={{ height: '100%', textAlign: 'center' }}
                bodyStyle={{ padding: '32px 24px' }}
              >
                <Space direction="vertical" size="middle">
                  {feature.icon}
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph style={{ color: '#666', margin: 0 }}>
                    {feature.description}
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
    </div>
  );
}
