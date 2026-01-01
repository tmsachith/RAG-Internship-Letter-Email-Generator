import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI } from '@/lib/api';
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
  Avatar,
  Divider,
} from 'antd';
import {
  MessageOutlined,
  DeleteOutlined,
  UserOutlined,
  RobotOutlined,
  ClearOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface ChatMessage {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

export default function ChatHistory() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
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
      const response = await chatAPI.getHistory();
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      message.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId: number) => {
    try {
      await chatAPI.deleteMessage(messageId);
      message.success('Message deleted');
      fetchHistory();
    } catch (error) {
      message.error('Failed to delete message');
    }
  };

  const handleClearAll = async () => {
    try {
      await chatAPI.clearHistory();
      message.success('Chat history cleared');
      setMessages([]);
    } catch (error) {
      message.error('Failed to clear history');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <MessageOutlined /> Chat History
        </Title>
        {messages.length > 0 && (
          <Popconfirm
            title="Clear all chat history?"
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

      {messages.length === 0 ? (
        <Card>
          <Empty
            description="No chat history yet"
            image={<MessageOutlined style={{ fontSize: '64px', color: '#bfbfbf' }} />}
          >
            <Button type="primary" onClick={() => router.push('/chat')}>
              Start Chatting
            </Button>
          </Empty>
        </Card>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
          dataSource={messages}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => setSelectedMessage(item)}
                extra={
                  <Popconfirm
                    title="Delete this conversation?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(item.id);
                    }}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'start' }}>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginRight: '12px' }} />
                    <div style={{ flex: 1 }}>
                      <Text strong>You:</Text>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0, marginTop: '4px' }}>
                        {item.question}
                      </Paragraph>
                    </div>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', alignItems: 'start' }}>
                    <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a', marginRight: '12px' }} />
                    <div style={{ flex: 1 }}>
                      <Text strong>Assistant:</Text>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0, marginTop: '4px' }}>
                        {item.answer}
                      </Paragraph>
                    </div>
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
        title="Conversation Details"
        open={!!selectedMessage}
        onCancel={() => setSelectedMessage(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedMessage(null)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedMessage && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Space align="start">
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <div>
                  <Text strong>You:</Text>
                  <Paragraph style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.question}
                  </Paragraph>
                </div>
              </Space>
            </div>
            <Divider />
            <div>
              <Space align="start">
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
                <div>
                  <Text strong>Assistant:</Text>
                  <Paragraph style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.answer}
                  </Paragraph>
                </div>
              </Space>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {new Date(selectedMessage.created_at).toLocaleString()}
            </Text>
          </Space>
        )}
      </Modal>
    </Space>
  );
}
