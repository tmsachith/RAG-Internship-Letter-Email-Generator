import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { applicationAPI, cvAPI } from '@/lib/api';
import {
  Card,
  Input,
  Button,
  Radio,
  Space,
  Typography,
  Spin,
  Alert,
  Row,
  Col,
  Divider,
  message,
  List,
  Tag,
  Modal,
  Popconfirm,
} from 'antd';
import {
  FileTextOutlined,
  MailOutlined,
  CopyOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface HistoryApplication {
  id: number;
  job_description: string;
  application_type: string;
  subject: string | null;
  content: string;
  created_at: string;
}

export default function Application() {
  const { user, loading: authLoading } = useAuth();
  const [jobDescription, setJobDescription] = useState('');
  const [applicationType, setApplicationType] = useState<'cover_letter' | 'email'>('cover_letter');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject?: string; content: string } | null>(null);
  const [cvProcessed, setCvProcessed] = useState(false);
  const [checkingCV, setCheckingCV] = useState(true);
  const [history, setHistory] = useState<HistoryApplication[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedApp, setSelectedApp] = useState<HistoryApplication | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      checkCVStatus();
    }
  }, [user]);

  useEffect(() => {
    if (cvProcessed) {
      fetchHistory();
    }
  }, [cvProcessed]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await applicationAPI.getHistory();
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const checkCVStatus = async () => {
    try {
      const response = await cvAPI.getStatus();
      if (!response.data.has_cv) {
        router.push('/upload');
      } else if (!response.data.cv.processed) {
        setCvProcessed(false);
        setCheckingCV(false);
      } else {
        setCvProcessed(true);
        setCheckingCV(false);
      }
    } catch (error) {
      console.error('Error checking CV status:', error);
      setCheckingCV(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await applicationAPI.generate(jobDescription, applicationType);
      setResult(response.data);
      message.success('Application generated successfully!');
      fetchHistory(); // Refresh history
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error generating application');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, subject?: string) => {
    // Strip HTML tags for plain text copy
    const stripHtml = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    let textToCopy = '';
    const plainContent = stripHtml(content);

    if (subject) {
      textToCopy = `Subject: ${subject}\n\n${plainContent}`;
    } else {
      textToCopy = plainContent;
    }

    navigator.clipboard.writeText(textToCopy);
    message.success('Copied to clipboard!');
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

  if (authLoading || checkingCV) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={2}>
          <ThunderboltOutlined /> Application Generator
        </Title>
        <Text type="secondary">
          Generate personalized cover letters and emails based on your CV and job descriptions
        </Text>
      </div>

      {!cvProcessed && (
        <Alert
          message="CV Processing"
          description="Your CV is still being processed. Please wait a moment and refresh the page."
          type="warning"
          showIcon
        />
      )}

      {cvProcessed && (
        <>
          <Row gutter={24}>
            {/* Input Section */}
            <Col xs={24} lg={12}>
              <Card title="Create Application" extra={<FileTextOutlined />}>
                <form onSubmit={handleGenerate}>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Application Type Selection */}
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                        Application Type
                      </Text>
                      <Radio.Group
                        value={applicationType}
                        onChange={(e) => setApplicationType(e.target.value)}
                        disabled={loading}
                      >
                        <Radio.Button value="cover_letter">
                          <FileTextOutlined /> Cover Letter
                        </Radio.Button>
                        <Radio.Button value="email">
                          <MailOutlined /> Email
                        </Radio.Button>
                      </Radio.Group>
                    </div>

                    {/* Job Description Input */}
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                        Job Description
                      </Text>
                      <TextArea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={12}
                        placeholder="Paste the full job description here including requirements, responsibilities, and company information..."
                        disabled={loading}
                      />
                    </div>

                    {/* Generate Button */}
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<ThunderboltOutlined />}
                      loading={loading}
                      disabled={!jobDescription.trim()}
                      block
                    >
                      Generate {applicationType === 'cover_letter' ? 'Cover Letter' : 'Email'}
                    </Button>

                    {loading && (
                      <div style={{ textAlign: 'center' }}>
                        <Spin />
                        <Paragraph type="secondary" style={{ marginTop: '8px' }}>
                          Creating your personalized application...
                        </Paragraph>
                      </div>
                    )}
                  </Space>
                </form>
              </Card>
            </Col>

            {/* Result Section */}
            <Col xs={24} lg={12}>
              <Card
                title={`Generated ${applicationType === 'cover_letter' ? 'Cover Letter' : 'Email'}`}
                extra={
                  result && (
                    <Button
                      type="primary"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(result.content, result.subject)}
                      style={{ background: '#52c41a', borderColor: '#52c41a' }}
                    >
                      Copy
                    </Button>
                  )
                }
              >
                {!result ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <FileTextOutlined style={{ fontSize: '64px', color: '#bfbfbf', marginBottom: '16px' }} />
                    <Title level={4}>No Application Generated Yet</Title>
                    <Paragraph type="secondary">
                      Enter a job description and click generate to create your personalized application
                    </Paragraph>
                  </div>
                ) : (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {applicationType === 'email' && result.subject && (
                      <>
                        <div>
                          <Text strong>Subject:</Text>
                          <Paragraph style={{ marginTop: '8px', fontSize: '16px' }}>
                            {result.subject}
                          </Paragraph>
                        </div>
                        <Divider />
                      </>
                    )}

                    <div>
                      {applicationType === 'email' && <Text strong>Body:</Text>}
                      <div
                        style={{
                          marginTop: applicationType === 'email' ? '8px' : 0,
                          lineHeight: '1.8',
                        }}
                        dangerouslySetInnerHTML={{ __html: result.content }}
                      />
                    </div>
                  </Space>
                )}
              </Card>
            </Col>
          </Row>

          {/* History Section */}
          <Divider>
            <Title level={3}>Previous Applications</Title>
          </Divider>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin />
            </div>
          ) : history.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <FileTextOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
                <Paragraph type="secondary">No previous applications yet. Generate your first one above!</Paragraph>
              </div>
            </Card>
          ) : (
            <List
              dataSource={history}
              renderItem={(item) => (
                <Card
                  style={{ marginBottom: '16px' }}
                  size="small"
                  extra={
                    <Space>
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => setSelectedApp(item)}
                      >
                        View
                      </Button>
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopy(item.content, item.subject || undefined)}
                      >
                        Copy
                      </Button>
                      <Popconfirm
                        title="Delete this application?"
                        onConfirm={() => handleDelete(item.id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Tag
                        icon={item.application_type === 'email' ? <MailOutlined /> : <FileTextOutlined />}
                        color={item.application_type === 'email' ? 'blue' : 'green'}
                      >
                        {item.application_type === 'email' ? 'Email' : 'Cover Letter'}
                      </Tag>
                      {item.application_type === 'email' && item.subject && (
                        <Text strong style={{ marginLeft: '8px' }}>{item.subject}</Text>
                      )}
                      <Text type="secondary" style={{ float: 'right', fontSize: '12px' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </div>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                      {item.job_description}
                    </Paragraph>
                  </Space>
                </Card>
              )}
            />
          )}
        </>
      )}

      {/* Detail Modal */}
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
            onClick={() => selectedApp && handleCopy(selectedApp.content, selectedApp.subject || undefined)}
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
