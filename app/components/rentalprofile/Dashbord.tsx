import {
  ArrowRightOutlined,
  BankOutlined,
  BookOutlined,
  HomeOutlined,
  HomeTwoTone,
  TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Card, Col, notification, Progress, Row, Tag, Typography } from "antd";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import { RentalProfileDetailsDTO } from "../../models/rentalprofile";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getLeases } from "../../services/leaseService";
import { useAccount } from "../../store/account/AccountContext";

const { Meta } = Card;
const { Title, Text } = Typography;


export default function Dashboard() {
  const navigate = useNavigate();
  const { accountState } = useAccount();
  const { rentalProfileState } = useRentalProfile();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [rentalProfile, setRentalProfile] = useState<RentalProfileDetailsDTO | null>(null);
  const [leaseCount, setLeaseCount] = useState(0);

  
  const summaryCards = [
    { title: "Leases", value: leaseCount, icon: <BookOutlined />, color: "#a78bfa" },
    //   { title: "Tenants", value: 0, icon: <TeamOutlined />, color: "#f59e0b" },
    //   { title: "Properties", value: 0, icon: <HomeOutlined />, color: "#22c55e" },
    //   { title: "Units", value: 0, icon: <BankOutlined />, color: "#2563eb" },
    ];

  const loadLeasesCount = async (rentalProfileId: number, jwtToken: string) => {
    const data = await getLeases(rentalProfileId, jwtToken, notificationApi);
    setLeaseCount(data.length);
  };

  useEffect(() => {
    const jwtToken = accountState.accountDetails?.token;
    const currentProfile = rentalProfileState.rentalProfile;

    if (!jwtToken || !currentProfile) {
      navigate("/");
      return;
    }


    setRentalProfile(currentProfile);
    loadLeasesCount(currentProfile.id, jwtToken!);
  }, [rentalProfileState.rentalProfile, accountState.accountDetails?.token, navigate, notificationApi]);

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
            <Card hoverable style={{ borderRadius: 16, border: "1px solid #eaf0f6", boxShadow: "none" }} bodyStyle={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${card.color}1A`,
                    color: card.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {card.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ display: "block", fontSize: 13 }}>{card.title}</Text>
                  <Title level={3} style={{ margin: "6px 0 0" }}>{card.value}</Title>
                </div>
              </div>

              <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: "#2563eb", fontWeight: 600 }}>View {card.title.toLowerCase()}</Text>
                <ArrowRightOutlined style={{ color: "#2563eb" }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

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
