import { Typography,Layout, Image, Grid, Drawer, Button, Card, Row, Divider, Col, Space, Tag, Flex, Menu, Avatar } from 'antd';
import { MenuOutlined, UserAddOutlined, UserOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sider from 'antd/es/layout/Sider';

const { Title, Text, Link } = Typography;

const { Header, Footer, Content } = Layout;
const { useBreakpoint } = Grid;

const navItems = [
  { key: 'dashborad', label: 'Dashborad', to: '#' },
  { key: 'leases', label: 'Leases', to: '#' },
  { key: 'properties', label: 'Properties', to: '#' },
  { key: 'tenants', label: 'Tenants', to: '#' },
];

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md; // <768px = mobile

  return (
          
    <Layout>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0F172A',
          height: 64,
        }}
      >
        {/* LOGO */}
        <div style={{
          // background: '#fff',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          flexShrink: 0,
        }}>
          <Image
            preview={false}
            src="/tante-logo.svg"
            width={96}          // fixed px — never grows
            height={29}         // keeps aspect ratio locked
            style={{ display: 'block' }}
          />

        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 16,
          }}
        >
          <Avatar size={50} icon={<UserOutlined />} />
        </div>

      
        

       
      </Header>


      <Layout>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          onBreakpoint={(broken) => {
            console.log(broken);
          }}
          onCollapse={(collapsed, type) => {
            console.log(collapsed, type);
          }}
        >
          <div className="demo-logo-vertical" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashborad']} items={navItems} />
        </Sider>

        <Layout>
          <Content style={{ backgroundColor: '#fff' }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      

      {/* <Footer style={{ backgroundColor: '#0F172A' }}>
       
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Title level={2} style={{ margin: 0, color: "white" }}>
                <span style={{ color: "#14b8a6" }}>t</span>ante
              </Title>

              <Text style={{ color: "#94a3b8", display: "block", marginTop: 16 }}>
                Smart Real Estate. Better Future.
                <br />
                Built for Tanzanian property owners.
              </Text>
            </Col>

            <Col xs={24} sm={12} md={12} lg={6}>
              <Flex vertical>
                <Text strong style={{ color: "#64748b" }}>
                  PRODUCT
                </Text>
                <Flex vertical style={{ marginTop: 10 }}>
                  <Link 
                    href="#"    
                    style={{
                      color: "#94a3b8",
                      marginTop:2
                    }}
                  >
                      Features
                  </Link>
                  <Link 
                    href="#"
                    style={{
                      color: "#94a3b8",
                      marginTop:2
                    }}
                  >
                    Pricing
                  </Link>
                  <Link 
                    href="#"
                    style={{
                      color: "#94a3b8",
                      marginTop:2
                    }}
                  >
                    Mobile App
                  </Link>
                  <Link 
                    href="#"
                    style={{
                      color: "#94a3b8",
                      marginTop:2
                    }}
                  >
                    Changelog
                  </Link>
                </Flex>
              </Flex>
            </Col>

            <Col xs={24} sm={12} md={12} lg={6}>
              <Flex vertical>
                <Text strong style={{ color: "#64748b" }}>
                  COMPANY
                </Text>
                <Flex vertical style={{ marginTop: 10 }}>
                  <Link 
                    href="#"    
                    style={{
                      color: "#94a3b8",
                      marginTop:2
                    }}
                  >
                      Blog
                  </Link>
                  <Link 
                    href="#"
                    style={{
                      color: "#94a3b8",
                      marginTop:2
                    }}
                  >
                    Careers
                  </Link>
                  <Link 
                    href="#"
                    style={{
                      color: "#94a3b8",
                      marginTop:2
                    }}
                  >
                    Contact
                  </Link>
                </Flex>
              </Flex>
            </Col>

            <Col xs={24} sm={12} md={12} lg={6}>
              <Flex vertical>
                <Text strong style={{ color: "#64748b" }}>
                  LEGAL
                </Text>
                <Flex vertical style={{ marginTop: 10 }}>
                  <Link 
                    href="#"    
                    style={{
                      color: "#94a3b8",
                      marginTop:2
                    }}
                  >
                      Privacy Policy
                  </Link>
                  <Link 
                    href="#"
                    style={{
                      color: "#94a3b8",
                      marginTop:2
                    }}
                  >
                    Terms of Service
                  </Link>
                  
                </Flex>
              </Flex>
              
            </Col>
          </Row>

          <Divider style={{ borderColor: "#1e293b", margin: "32px 0 24px" }} />

          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <Text style={{ color: "#64748b" }}>
                © 2026 tante Technologies (Pty) Ltd. All rights reserved.
              </Text>
            </Col>

            <Col xs={24} md={12}>
              <Space wrap style={{ justifyContent: "flex-end", width: "100%" }}>
                <Tag color="default">🇹🇿 Made in Tanzania</Tag>
              </Space>
            </Col>
          </Row>
      </Footer> */}
    </Layout>

  );
}