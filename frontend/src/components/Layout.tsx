import React from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
  HomeOutlined,
  MessageOutlined,
  FileTextOutlined,
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import type { MenuProps } from 'antd';

const { Header, Content, Footer } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'email',
      label: user?.email,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const menuItems: MenuProps['items'] = user
    ? [
        {
          key: '/',
          icon: <HomeOutlined />,
          label: 'Home',
          onClick: () => router.push('/'),
        },
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
          onClick: () => router.push('/dashboard'),
        },
        {
          key: '/upload',
          icon: <UploadOutlined />,
          label: 'Upload CV',
          onClick: () => router.push('/upload'),
        },
        {
          key: '/chat',
          icon: <MessageOutlined />,
          label: 'Chat',
          onClick: () => router.push('/chat'),
        },
        {
          key: '/application',
          icon: <FileTextOutlined />,
          label: 'Generate Application',
          onClick: () => router.push('/application'),
        },
      ]
    : [
        {
          key: '/',
          icon: <HomeOutlined />,
          label: 'Home',
          onClick: () => router.push('/'),
        },
        {
          key: '/login',
          label: 'Login',
          onClick: () => router.push('/login'),
        },
        {
          key: '/signup',
          label: 'Sign Up',
          onClick: () => router.push('/signup'),
        },
      ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 50px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div
            style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              marginRight: '50px',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/')}
          >
            RAG CV Assistant
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[router.pathname]}
            items={menuItems}
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none' }}
          />
        </div>
        {user && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar
              icon={<UserOutlined />}
              style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
            />
          </Dropdown>
        )}
      </Header>
      <Content style={{ padding: '50px', background: 'white' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center', background: '#001529', color: 'white' }}>
        RAG CV Assistant ©{new Date().getFullYear()} - TM Sachith
      </Footer>
    </AntLayout>
  );
}
