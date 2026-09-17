import {
  ArrowRightOutlined,
  BankOutlined,
  BellOutlined,
  BookOutlined,
  HomeOutlined,
  HomeTwoTone,
  RightOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Card, Col, Flex, Modal, notification, Progress, Row, Tag, Typography } from "antd";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import { RentalProfileDetailsDTO } from "../../models/rentalprofile";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getLeases } from "../../services/leaseService";
import { useAccount } from "../../store/account/AccountContext";
import Invitations from "../invitation/Invitations";
import { getActiveInvitations } from "../../services/invitationService";
import { TenantInvitationDetailsDTO } from "../../models/user";

const { Meta } = Card;
const { Title, Text } = Typography;


export default function Dashboard() {
  const navigate = useNavigate();
  const { accountState } = useAccount();
  const { rentalProfileState } = useRentalProfile();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [rentalProfile, setRentalProfile] = useState<RentalProfileDetailsDTO | null>(null);
  const [leaseCount, setLeaseCount] = useState(0);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitesCount,setInvitesCount] = useState<number>(0);
  const [invitations, setInvitations] = useState<TenantInvitationDetailsDTO[]>([]);


  
  const summaryCards = [
    { 
      title: "Leases", 
      value: leaseCount, 
      icon: <BookOutlined />, 
      color: "#F7FFF2" ,
      onClick: () => {},
    },
    {
      title: "Invitations",
      value: `You have ${invitesCount} invitaions to respond`,
      icon: <Badge count={invitesCount}><BellOutlined /></Badge>,    
      color: "#EDF4FF",
      buttonStyle: { backgroundColor: "info", borderColor: "#EDF4FF", color: "#fff" },
      buttonText: "View more",
      buttonIcon: <ArrowRightOutlined />,
      onClick: () => setIsInviteModalOpen(true),
    },
    //   { title: "Tenants", value: 0, icon: <TeamOutlined />, color: "#f59e0b" },
    //   { title: "Properties", value: 0, icon: <HomeOutlined />, color: "#22c55e" },
    //   { title: "Units", value: 0, icon: <BankOutlined />, color: "#2563eb" },
    ];

  const loadLeasesCount = async (rentalProfileId: number, jwtToken: string) => {
    const data = await getLeases(rentalProfileId, jwtToken, notificationApi);
    setLeaseCount(data.length);
  };

  const loadInvitations = async (phoneNumber: string, token: string) =>
  {
    if(!phoneNumber)
    {
      notificationApi.error({
        message: "Fail to load invites", 
        description: `Phone number is ${phoneNumber}`
      });
      navigate("/");
      return;
    }

    const invites = await getActiveInvitations(phoneNumber,token ?? "",notificationApi);
    setInvitesCount(invites.length)
    setInvitations(invites);
  }

  useEffect(() => {
    const jwtToken = accountState.accountDetails?.token;
    const currentProfile = rentalProfileState.rentalProfile;

    if (!jwtToken || !currentProfile || currentProfile==null) {
      return;
    }

    setRentalProfile(currentProfile);
    loadLeasesCount(currentProfile.id, jwtToken);
    loadInvitations(currentProfile.phoneNumber, jwtToken);
  }, [accountState.accountDetails?.token, rentalProfileState.rentalProfile]);

  return (
    <div>
      {contextHolder}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card style={{ borderRadius: 16 }}>
            <Meta
              avatar={<Avatar size={52} icon={<HomeTwoTone style={{ fontSize: 26 }} />} />}
              title={rentalProfile?.name ?? "No Rental Profile"}
              description={rentalProfile?.type ?? "Unknown profile type"}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {summaryCards.map((card) => (
          <Col xs={24} sm={12} md={6} key={card.title}>
            <Card 
                onClick={card.onClick}
                hoverable 
                style={{ borderRadius: 16, border: "1px solid #eaf0f6", boxShadow: "none", backgroundColor:card.color }} 
            >
                <Flex
                    justify="space-between"
                >

                    <Meta 
                        avatar={<Avatar size={50} icon={card.icon}/>}
                        title={card.title}
                        description={card.value}
                    />
                    <RightOutlined />
                </Flex>
                
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
          title="Invitations"
          open={isInviteModalOpen}
          onCancel={() => setIsInviteModalOpen(false)}
          footer={null}
      >
          <Invitations phoneNumber={rentalProfile?.phoneNumber ?? ""} jwtToken={accountState.accountDetails?.token} />
      </Modal>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card style={{ borderRadius: 16, border: "1px solid #eaf0f6", boxShadow: "none" }} bodyStyle={{ padding: 20 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={5} style={{ margin: 0 }}>Rent Collection</Title>
              </Col>
              <Col>
                <Text type="secondary">Current month</Text>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Text type="secondary">Expected</Text>
                <div style={{ marginTop: 8, fontWeight: 700, fontSize: 24, color: "#0f172a" }}>TZS 4,500,000</div>
              </Col>
              <Col xs={24} sm={8}>
                <Text type="secondary">Collected</Text>
                <div style={{ marginTop: 8, fontWeight: 700, fontSize: 24, color: "#16a34a" }}>TZS 3,200,000</div>
              </Col>
              <Col xs={24} sm={8}>
                <Text type="secondary">Outstanding</Text>
                <div style={{ marginTop: 8, fontWeight: 700, fontSize: 24, color: "#ef4444" }}>TZS 1,300,000</div>
              </Col>
            </Row>

            <div style={{ marginTop: 20 }}>
              <Progress percent={71} strokeColor="#22c55e" trailColor="#e5e7eb" showInfo={false} />
              <div style={{ marginTop: 8 }}>
                <Tag color="green">71% collected</Tag>
              </div>
            </div>
          </Card>
        </Col>

      </Row>
    </div>
  );
}
