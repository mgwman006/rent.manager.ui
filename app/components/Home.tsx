import {
  Typography,
  Layout,
  Image,
  Grid,
  Drawer,
  Button,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Tag,
  notification,
} from 'antd';

import {
  DashboardFilled,
  CalendarOutlined,
  FileFilled,
  HomeFilled,
  MenuOutlined,
  DownOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sider from 'antd/es/layout/Sider';
import { useRentalProfile } from '../store/rentalprofile/RentalProfileContext';
import { useAccount } from '../store/account/AccountContext';
import { RentalProfileDetailsDTO } from '../models/rentalprofile';
import { getRentalProfilesByUserOrOrganization } from '../services/rentalProfileService';

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { accountState } = useAccount();
  const { rentalProfileState, dispatchRentalProfileState } = useRentalProfile();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [rentalProfiles, setRentalProfiles] = useState<RentalProfileDetailsDTO[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const screens = useBreakpoint();

  // lg = 992px
  const isMobile = !screens.lg;

  const accountDetails = accountState.accountDetails;
  const userDetails = accountDetails?.userDetails;
  const token = accountDetails?.token;
  const organizationId = userDetails?.memberships?.find(
    (membership) => Number.isSafeInteger(membership.organizationId) && membership.organizationId > 0,
  )?.organizationId ?? 0;
  const accountName = [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(' ') || 'Account';

  useEffect(() => {
    let cancelled = false;
    if (!userDetails?.id || !token) {
      setRentalProfiles([]);
      return () => {
        cancelled = true;
      };
    }

    setLoadingProfiles(true);
    getRentalProfilesByUserOrOrganization(userDetails.id, organizationId, token, notificationApi)
      .then((profiles) => {
        if (!cancelled) setRentalProfiles(profiles);
      })
      .finally(() => {
        if (!cancelled) setLoadingProfiles(false);
      });

    return () => {
      cancelled = true;
    };
  }, [notificationApi, organizationId, token, userDetails?.id]);

  const navItems = [
    {
      key: 'rental-profile',
      icon: <DashboardFilled />,
      label: rentalProfileState.rentalProfile?.name ?? 'Rental Profile',
      children: [
        { key: 'dashboard', icon: <DashboardFilled />, label: <Link to="/rental-profile">Dashboard</Link> },
        { key: 'leases', icon: <FileFilled />, label: <Link to="/rental-profile/leases">Leases</Link> },
        { key: 'properties', icon: <HomeFilled />, label: <Link to="/rental-profile/properties">Properties</Link> },
        { key: 'viewings', icon: <CalendarOutlined />, label: <Link to="/rental-profile/viewings">Viewing Bookings</Link> },
      ],
    },
  ];

  const profileMenuItems = loadingProfiles
    ? [{ key: 'loading', label: 'Loading rental profiles...', disabled: true }]
    : rentalProfiles.length > 0
      ? [
        { key: 'profiles-heading', label: 'Rental profiles', disabled: true },
        ...rentalProfiles.map((profile) => ({
          key: `profile-${profile.id}`,
          label: (
            <Space>
              <span>{profile.name}</span>
              {profile.id === rentalProfileState.rentalProfile?.id && <Tag color="green">Active</Tag>}
            </Space>
          ),
        })),
      ]
      : [{ key: 'no-profiles', label: 'No rental profiles found', disabled: true }];

  const selectRentalProfile = (key: string) => {
    const profileId = Number(key.replace('profile-', ''));
    const profile = rentalProfiles.find((item) => item.id === profileId);
    if (!profile) return;

    dispatchRentalProfileState({ type: 'SET_RENTAL_PROFILE', payload: profile });
    navigate('/rental-profile');
  };

  const selectedKey = pathname === '/'
    ? ''
    : pathname.startsWith('/rental-profile/leases')
      ? 'leases'
      : pathname.startsWith('/rental-profile/properties')
        ? 'properties'
        : pathname.startsWith('/rental-profile/viewings')
          ? 'viewings'
          : pathname.startsWith('/rental-profile')
            ? 'dashboard'
            : '';

  const handleMenuClick = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={selectedKey ? [selectedKey] : []}
      defaultOpenKeys={['rental-profile']}
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
      {contextHolder}

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

        <div style={{ flex: 1 }} />
        <Dropdown
          placement="bottomRight"
          menu={{
            items: profileMenuItems,
            onClick: ({ key }) => selectRentalProfile(key),
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            aria-label={`Account menu for ${accountName}`}
            style={{ color: '#fff', marginInlineEnd: 16 }}
          >
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              {!isMobile && accountName}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
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