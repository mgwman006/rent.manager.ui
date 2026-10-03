import {
  Typography,
  Layout,
  Image,
  Grid,
  Drawer,
  Button,
  Menu,
  Avatar} from 'antd';

import {
  DashboardFilled,
  DashboardOutlined,
  FileDoneOutlined,
  FileFilled,
  HomeFilled,
  MenuOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { Outlet, Link } from 'react-router-dom';
import { useState } from 'react';
import Sider from 'antd/es/layout/Sider';

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const navItems = [
  { key: 'dashborad', label: <Link to="/rental-profile"><Avatar size="small" icon={<DashboardFilled />}/> Dash borad</Link>, to: '/rental-profile' },
  { key: 'leases', label: <Link to="/rental-profile/leases"><Avatar size={'small'} icon={<FileFilled />}/> Leases</Link>, to: '/rental-profile/leases' },
  { key: 'properties', label: <Link to="/rental-profile/properties" ><Avatar size="small" icon={<HomeFilled />}/> Properties</Link> , to: '/rental-profile/properties' },
];

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const screens = useBreakpoint();

  // lg = 992px
  const isMobile = !screens.lg;

  const handleMenuClick = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const menu = (
    <Menu
      mode="inline"
      defaultSelectedKeys={['home']}
      style={{
        height: '100%',
        borderInlineEnd: 0,
      }}
      items={navItems}
      onClick={handleMenuClick}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* HEADER */}
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          background: '#0F172A',
          height: 64,
        }}
      >

        {/* LOGO */}
        <div
          style={{
            background: '#fff',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            flexShrink: 0,
          }}
        >
          <Image
            preview={false}
            src="/tante-logo.svg"
            width={96}
            height={29}
            style={{ display: 'block' }}
          />
        </div>

        {/* MOBILE MENU BUTTON */}
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            style={{
              color: '#fff',
              fontSize: 20,
              marginLeft: 8,
            }}
          />
        )}

        {/* DESKTOP HEADER MENU */}
        {!isMobile && (
          <Menu
            theme="dark"
            mode="horizontal"
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
            }}
          />
        )}
      </Header>

      <Layout>

        {/* DESKTOP SIDEBAR */}
        {!isMobile && (
          <Sider
            width={240}
            style={{
              position: 'sticky',
              top: 64,
              height: 'calc(100vh - 64px)',
              overflow: 'auto',
            }}
          >
            {menu}
          </Sider>
        )}

        {/* MOBILE DRAWER */}
        <Drawer
          title="Tante"
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          {menu}
        </Drawer>

        {/* CONTENT */}
        <Layout
          style={{
            padding: isMobile
              ? '0 12px 16px'
              : '0 24px 24px',
            minWidth: 0,
          }}
        >
          <Content>
            <Outlet />
          </Content>
        </Layout>

      </Layout>
    </Layout>
  );
}