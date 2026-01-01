import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { applicationAPI } from '@/lib/api';
import {
  Card,
  List,
  Button,
  Space,
  Typography,
  Spin,
  Empty,
  Modal,
  message,
  Popconfirm,
  Tag,
  Divider,
} from 'antd';
import {
  FileTextOutlined,
  MailOutlined,
  DeleteOutlined,
  CopyOutlined,
  ClearOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface Application {
  id: number;
  job_description: string;
  application_type: string;
  subject: string | null;
  content: string;
  created_at: string;
}

export default function ApplicationHistory() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await applicationAPI.getHistory();
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching application history:', error);
      message.error('Failed to load application history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appId: number) => {
    try {
      await applicationAPI.deleteApplication(appId);
      message.success('Application deleted');
      fetchHistory();
    } catch (error) {
      message.error('Failed to delete application');
    }
  };

  const handleClearAll = async () => {
    try {
      await applicationAPI.clearHistory();
      message.success('Application history cleared');
      setApplications([]);
    } catch (error) {
      message.error('Failed to clear history');
    }
  };

  const handleCopy = (app: Application) => {
    const stripHtml = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    let textToCopy = '';
    const plainContent = stripHtml(app.content);

    if (app.application_type === 'email' && app.subject) {
      textToCopy = `Subject: ${app.subject}\n\n${plainContent}`;
    } else {
      textToCopy = plainContent;
    }

    navigator.clipboard.writeText(textToCopy);
    message.success('Copied to clipboard!');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <FileTextOutlined /> Application History
        </Title>
        {applications.length > 0 && (
          <Popconfirm
            title="Clear all application history?"
            description="This action cannot be undone."
            onConfirm={handleClearAll}
            okText="Yes, clear all"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<ClearOutlined />}>
              Clear All
            </Button>
          </Popconfirm>
        )}
      </div>

      {applications.length === 0 ? (
        <Card>
          <Empty
            description="No applications generated yet"
            image={<FileTextOutlined style={{ fontSize: '64px', color: '#bfbfbf' }} />}
          >
            <Button type="primary" onClick={() => router.push('/application')}>
              Generate Application
            </Button>
          </Empty>
        </Card>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
          dataSource={applications}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                actions={[
                  <Button
                    key="view"
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => setSelectedApp(item)}
                  >
                    View
                  </Button>,
                  <Button
                    key="copy"
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(item)}
                  >
                    Copy
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Delete this application?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag
                      icon={item.application_type === 'email' ? <MailOutlined /> : <FileTextOutlined />}
                      color={item.application_type === 'email' ? 'blue' : 'green'}
                    >
                      {item.application_type === 'email' ? 'Email' : 'Cover Letter'}
                    </Tag>
                  </div>
                  {item.application_type === 'email' && item.subject && (
                    <div>
                      <Text strong>Subject:</Text>
                      <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}>
                        {item.subject}
                      </Paragraph>
                    </div>
                  )}
                  <div>
                    <Text strong>Job Description:</Text>
                    <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 0 }}>
                      {item.job_description}
                    </Paragraph>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      )}

      <Modal
        title={
          <Space>
            {selectedApp?.application_type === 'email' ? (
              <MailOutlined style={{ color: '#1890ff' }} />
            ) : (
              <FileTextOutlined style={{ color: '#52c41a' }} />
            )}
            <span>
              {selectedApp?.application_type === 'email' ? 'Email' : 'Cover Letter'}
            </span>
          </Space>
        }
        open={!!selectedApp}
        onCancel={() => setSelectedApp(null)}
        footer={[
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={() => selectedApp && handleCopy(selectedApp)}
          >
            Copy
          </Button>,
          <Button key="close" type="primary" onClick={() => setSelectedApp(null)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedApp && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong>Job Description:</Text>
              <Paragraph style={{ marginTop: '8px', whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                {selectedApp.job_description}
              </Paragraph>
            </div>
            <Divider />
            {selectedApp.application_type === 'email' && selectedApp.subject && (
              <>
                <div>
                  <Text strong>Subject:</Text>
                  <Paragraph style={{ marginTop: '8px', fontSize: '16px' }}>
                    {selectedApp.subject}
                  </Paragraph>
                </div>
                <Divider />
              </>
            )}
            <div>
              <Text strong>{selectedApp.application_type === 'email' ? 'Body:' : 'Content:'}</Text>
              <div
                style={{
                  marginTop: '8px',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap',
                }}
                dangerouslySetInnerHTML={{ __html: selectedApp.content }}
              />
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Generated on {new Date(selectedApp.created_at).toLocaleString()}
            </Text>
          </Space>
        )}
      </Modal>
    </Space>
  );
}
