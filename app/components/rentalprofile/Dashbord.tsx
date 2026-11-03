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
import { Alert, Avatar, Badge, Button, Card, Col, DatePicker, Flex, Form, Input, Modal, notification, Progress, Row, Select, Tag, Typography } from "antd";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import { RentalProfileDetailsDTO, RentalProfileType } from "../../models/rentalprofile";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAccount } from "../../store/account/AccountContext";
import { rentalProfileApi } from "../../api/api";
import { handleApiError } from "../../utilities/error-handler";
import Invitations from "../invitation/Invitations";
import { getActiveInvitations } from "../../services/invitationService";
import { LeaseInvitationDetailsDTO } from "../../models/user";
import { getLeasesAllLeases, getMonthlyCollectionSummary } from "../../services/leaseService";
import { MonthlyCollectionSummaryDTO } from "../../models/lease";
import dayjs from "dayjs";
import { isTokenExpired } from "../../utilities/auth";

const { Meta } = Card;
const { Title, Text } = Typography;

const authUrl = import.meta.env.VITE_AUTH_URL?.trim();
const rentManagerUrl = import.meta.env.VITE_RENT_MANAGER_URL?.trim();

export default function Dashboard() {
  const navigate = useNavigate();
  const { accountState, dispatchAccountState } = useAccount();
  const { rentalProfileState, dispatchRentalProfileState } = useRentalProfile();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [upgradeForm] = Form.useForm<{ organizationId: number }>();
  const [rentalProfile, setRentalProfile] = useState<RentalProfileDetailsDTO | null>(null);
  const selectedProfileType = rentalProfileState.rentalProfile?.type?.trim().toUpperCase();
  const organizationMemberships = (accountState.accountDetails?.userDetails?.memberships ?? [])
    .filter((membership) => Number.isSafeInteger(membership.organizationId) && membership.organizationId > 0);
  const [leaseCount, setLeaseCount] = useState(0);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [invitesCount,setInvitesCount] = useState<number>(0);
  const [invitations, setInvitations] = useState<LeaseInvitationDetailsDTO[]>([]);
  const [monthlyCollectionSummary, setMonthlyCollectionSummary] = useState<MonthlyCollectionSummaryDTO>();


  
  
const navigateToAuth = (nextApp: string = "rent-manager", phone?: string) => {
    if (!authUrl) {
      console.error("VITE_AUTH_URL is not configured.");
      return;
    }

    const outGoingUrlValue = nextApp === "rent-manager" ? rentManagerUrl : null;
    if (!outGoingUrlValue) {
      console.error("Unable to resolve outgoing URL for auth redirect.");
      return;
    }

    const url = `${authUrl}?outGoingUrl=${encodeURIComponent(outGoingUrlValue)}&phoneNumber=${encodeURIComponent(phone ?? "")}`;
    window.location.href = url;
  };

  const handleUpgrade = async ({ organizationId }: { organizationId: number }) => {
    const profile = rentalProfileState.rentalProfile;
    const token = accountState.accountDetails?.token;
    const validMembership = organizationMemberships.some(
      (membership) => membership.organizationId === organizationId,
    );

    if (!profile || !token || !Number.isSafeInteger(organizationId) || organizationId <= 0 || !validMembership) {
      notificationApi.error({
        message: "Valid organization required",
        description: "Select an organization that belongs to your account before upgrading.",
      });
      return;
    }

    setIsUpgrading(true);
    try {
      const upgradedProfile = await rentalProfileApi.upgradeRentalProfile(
        profile.id,
        organizationId,
        token,
      );
      const updatedProfile = {
        ...profile,
        ...upgradedProfile,
        type: RentalProfileType.Business,
        organizationId,
      };
      setRentalProfile(updatedProfile);
      dispatchRentalProfileState({ type: "SET_RENTAL_PROFILE", payload: updatedProfile });
      setIsUpgradeModalOpen(false);
      notificationApi.success({
        message: "Rental profile upgraded",
        description: "Your rental profile is now a Business profile.",
      });
    } catch (error: unknown) {
      handleApiError(error, notificationApi);
    } finally {
      setIsUpgrading(false);
    }
  };

  const loadLeasesCount = async (rentalProfileId: number, jwtToken: string) => {
    const data = await getLeasesAllLeases(rentalProfileId, jwtToken, notificationApi);
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

  const loadCurrentMonthCollectionSummary = async (
    rentalProfileId: number,
    month: number,
    year: number,
    token: string
) => {
    

    const response = await getMonthlyCollectionSummary(
        rentalProfileId,
        month,
        year,
        token,
        notificationApi
    );

    if (response) {
        setMonthlyCollectionSummary(response);
    }
};

  useEffect(() => {
    const jwtToken = accountState.accountDetails?.token;
    const currentProfile = rentalProfileState.rentalProfile;

    if (!jwtToken || !currentProfile || currentProfile==null) {
      return;
    }

    if (isTokenExpired(jwtToken)) {
        notificationApi.error({
          message: "Session expired",
          description: "Your sign-in session has expired. Please sign in again.",
        });
        dispatchAccountState({ type: "LOGOUT" });
        navigateToAuth();
        return;
      }

    setRentalProfile(currentProfile);
    loadLeasesCount(currentProfile.id, jwtToken);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JS months are 0-based
    loadCurrentMonthCollectionSummary(currentProfile.id, currentMonth,currentYear,jwtToken);
  }, []);

  useEffect(() => {
    const token = accountState.accountDetails?.token;

    if (!rentalProfile?.phoneNumber || !token) {
        return;
    }

    loadInvitations(rentalProfile?.phoneNumber, token);
}, [rentalProfile?.phoneNumber, accountState.accountDetails?.token]);

const summaryCards = [
    { 
      title: "Leases", 
      value: leaseCount, 
      icon: <BookOutlined />, 
      color: "#F7FFF2" ,
      onClick: () => navigate("leases"),
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

  return (
    <div>
      {contextHolder}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            style={{ borderRadius: 16 }}
            extra={
              selectedProfileType === RentalProfileType.Individual ? (
                <Button variant="filled" color="orange" onClick={() => setIsUpgradeModalOpen(true)}>
                  Upgrade
                </Button>
              ) : null
            }
          >
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
          width={{
                    xs: '100%',
                    sm: '90%',
                    md: '80%',
                    lg: '50%',
                    xl: '50%',
                    xxl: '50%',
                }}
      >
          <Invitations phoneNumber={rentalProfile?.phoneNumber ?? ""} jwtToken={accountState.accountDetails?.token} />
      </Modal>

      <Modal
        title="Upgrade to Business"
        open={isUpgradeModalOpen}
        onCancel={() => setIsUpgradeModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        {organizationMemberships.length === 0 ? (
          <div>
            <Alert
              type="info"
              showIcon
              message="Create an organization first"
              description="A valid organization is required to upgrade this rental profile to Business."
            />
            <Button
              type="primary"
              style={{ marginTop: 16 }}
              onClick={() => navigateToAuth("rent-manager", accountState.accountDetails?.phoneNumber)}
            >
              Create organization
            </Button>
          </div>
        ) : (
          <Form
            form={upgradeForm}
            layout="vertical"
            onFinish={handleUpgrade}
          >
            <Form.Item
              name="organizationId"
              label="Organization"
              rules={[{ required: true, message: "Select an organization" }]}
            >
              <Select
                placeholder="Select an organization"
                options={organizationMemberships.map((membership) => ({
                  value: membership.organizationId,
                  label: membership.organizationName,
                }))}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={isUpgrading}>
              Upgrade profile
            </Button>
          </Form>
        )}
      </Modal>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card style={{ borderRadius: 16, border: "1px solid #eaf0f6", boxShadow: "none" }} bodyStyle={{ padding: 20 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col xs={24} sm={24} md={21} lg={21} xl={21} xxl={21}>
                <Title level={5} style={{ margin: 0 }}>Rent Collection</Title>
              </Col>
              <Col xs={24} sm={24} md={3} lg={3} xl={3} xxl={3}>
               <DatePicker
                  picker="month"
                  format="MMMM YYYY"
                  style={{ width: "100%" }}
                  defaultValue={dayjs()}

                  onChange={(date) => {
                      if (!date) return;

                      const month = date.month() + 1;
                      const year = date.year();

                      loadCurrentMonthCollectionSummary(
                          rentalProfileState?.rentalProfile?.id ?? 0,
                          month,
                          year,
                          accountState?.accountDetails?.token ?? ""

                      );
                  }}
              />
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Text type="secondary">Expected</Text>
                <div style={{ marginTop: 8, fontWeight: 700, fontSize: 24, color: "#0f172a" }}>{new Intl.NumberFormat("en-TZ").format(monthlyCollectionSummary?.totalExpectedAmount ?? 0)} TZS</div>
              </Col>
              <Col xs={24} sm={8}>
                <Text type="secondary">Collected</Text>
                <div style={{ marginTop: 8, fontWeight: 700, fontSize: 24, color: "#16a34a" }}>{new Intl.NumberFormat("en-TZ").format(monthlyCollectionSummary?.totalAmountPaid ?? 0)} TZS</div>
              </Col>
              <Col xs={24} sm={8}>
                <Text type="secondary">Outstanding</Text>
                <div style={{ marginTop: 8, fontWeight: 700, fontSize: 24, color: "#ef4444" }}>{new Intl.NumberFormat("en-TZ").format(monthlyCollectionSummary?.totalOutstandingAmount ?? 0)} TZS</div>
              </Col>
            </Row>

            <div style={{ marginTop: 20 }}>
              <Progress percent={monthlyCollectionSummary?.progressPercentage} strokeColor="#22c55e" trailColor="#e5e7eb" showInfo={false} />
              <div style={{ marginTop: 8 }}>
                <Tag color="green">{monthlyCollectionSummary?.progressPercentage}% collected</Tag>
              </div>
            </div>
          </Card>
        </Col>

      </Row>
    </div>
  );
}
