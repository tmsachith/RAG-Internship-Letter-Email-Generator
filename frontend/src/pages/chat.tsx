import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI, cvAPI } from '@/lib/api';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
  Avatar,
  Divider,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cvProcessed, setCvProcessed] = useState(false);
  const [checkingCV, setCheckingCV] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      // Load both CV status and chat history in parallel
      checkCVStatus();
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory();
      const historyMessages = response.data.flatMap((item: any) => [
        {
          id: item.id * 2,
          type: 'user' as const,
          content: item.question,
        },
        {
          id: item.id * 2 + 1,
          type: 'assistant' as const,
          content: item.answer,
        },
      ]);
      setMessages(historyMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const checkCVStatus = async () => {
    try {
      const response = await cvAPI.getStatus();
      if (!response.data.has_cv) {
        router.push('/upload');
      } else if (!response.data.cv.processed) {
        setCvProcessed(false);
      } else {
        setCvProcessed(true);
      }
    } catch (error) {
      console.error('Error checking CV status:', error);
    } finally {
      setCheckingCV(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.ask(userMessage.content);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: error.response?.data?.detail || 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading || checkingCV) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!cvProcessed) {
    return (
      <div style={{ maxWidth: '500px', margin: '100px auto' }}>
        <Alert
          message="Processing Your CV"
          description={
            <Space direction="vertical">
              <Paragraph>
                Your CV is being analyzed and vectorized. This usually takes a few moments...
              </Paragraph>
              <Button type="link" onClick={() => router.push('/dashboard')}>
                Go back to dashboard
              </Button>
            </Space>
          }
          type="info"
          showIcon
          icon={<Spin />}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: '64px',
      left: '0',
      right: '0',
      bottom: '70px',
      display: 'flex',
      flexDirection: 'column',
      background: 'white',
      padding: '20px 50px 0 50px',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <MessageOutlined /> Chat with Your CV
        </Title>
        <Text type="secondary">
          Ask questions about your experience, skills, and education
        </Text>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: '#fafafa',
          borderRadius: '8px 8px 0 0',
          border: '1px solid #f0f0f0',
          borderBottom: 'none',
        }}
      >
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Spin size="large" />
            <Paragraph type="secondary" style={{ marginTop: '16px' }}>
              Loading chat history...
            </Paragraph>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <RobotOutlined style={{ fontSize: '64px', color: '#bfbfbf', marginBottom: '16px' }} />
            <Title level={4}>Start a conversation</Title>
            <Paragraph type="secondary">
              Ask me anything about your CV
            </Paragraph>
            <Divider />
            <Space direction="vertical" align="start" style={{ textAlign: 'left' }}>
              <Text type="secondary">Example questions:</Text>
              <Text>• What is my work experience?</Text>
              <Text>• What skills do I have?</Text>
              <Text>• What is my education background?</Text>
              <Text>• Summarize my professional experience</Text>
            </Space>
          </div>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Space
                  align="start"
                  style={{
                    maxWidth: '70%',
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: message.type === 'user' ? '#1890ff' : '#52c41a',
                    }}
                  />
                  <Card
                    size="small"
                    style={{
                      background: message.type === 'user' ? '#e6f7ff' : '#ffffff',
                      border: message.type === 'user' ? '1px solid #91d5ff' : '1px solid #d9d9d9',
                    }}
                  >
                    <Text style={{ whiteSpace: 'pre-wrap' }}>{message.content}</Text>
                  </Card>
                </Space>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Space align="start">
                  <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
                  <Card size="small">
                    <Spin size="small" />
                    <Text type="secondary" style={{ marginLeft: '8px' }}>
                      Thinking...
                    </Text>
                  </Card>
                </Space>
              </div>
            )}
            <div ref={messagesEndRef} />
          </Space>
        )}
      </div>

      <div style={{ 
        padding: '16px 24px', 
        background: 'white',
        borderRadius: '0 0 8px 8px',
        border: '1px solid #f0f0f0',
        borderTop: '1px solid #f0f0f0',
      }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question about your CV..."
            disabled={loading}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ resize: 'none' }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!input.trim() || loading}
            loading={loading}
            size="large"
          >
            Send
          </Button>
        </Space.Compact>
      </div>
    </div>
  );
}
