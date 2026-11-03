
import {Button, Card, Col, Empty, Modal, Row, Spin, Typography, notification} from "antd";
import {ArrowRightOutlined, PlusOutlined} from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AccountState } from "../models/user";
import { useAccount } from "../store/account/AccountContext";
import { useEffect, useState } from "react";
import { RentalProfileDetailsDTO } from "../models/rentalprofile";
import CreateRentalProfile from "./rentalprofile/CreateRentalProfile";
import { useRentalProfile } from "../store/rentalprofile/RentalProfileContext";
import { getRentalProfilesByUserOrOrganization } from "../services/rentalProfileService";
import { isTokenExpired, navigateToAuth } from "../utilities/auth";

const { Title, Paragraph, Text } = Typography;

// ─── Brand tokens ───────────────────────────────────────────
const NAVY = "#0F172A";
const TEAL = "#0F766E";
const TEAL_L = "#14B8A6";
const AMBER = "#D4A017";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const OFF = "#F8FAFC";

export default function HomePage() 
{
  const [searchParams] = useSearchParams();
  const accountStateString = searchParams.get("state");
  const [notificationApi, contextHolder] = notification.useNotification();
  const { accountState, dispatchAccountState } = useAccount();
  const [rentalProfiles, setRentalProfiles] = useState<RentalProfileDetailsDTO[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [createProfileModalOpen, setCreateProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const { dispatchRentalProfileState } = useRentalProfile();
  


  const getRentalProfiles = async (userId: number, organizationId: number, token?: string) => {
    if (!token) {
      console.warn("No token available for membership request, skipping call.");
      setLoadingProfiles(false);
      return;
    }

    setLoadingProfiles(true);
    try {
      const profiles = await getRentalProfilesByUserOrOrganization(
        userId,
        organizationId,
        token,
        notificationApi,
      );
      setRentalProfiles(profiles);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const navigateToRentalProfile = (profile: RentalProfileDetailsDTO) => {
    dispatchRentalProfileState({
      type: "SET_RENTAL_PROFILE",
      payload: profile,
    });
    navigate(`/rental-profile`);
  }

  useEffect(() => {
    let userId: number;
    let organizationId: number;
    let token: string;
    let accountDetails = accountState.accountDetails;

    if (accountStateString) {
      const receivedAccountState: AccountState = JSON.parse(accountStateString);
      const newDetails = receivedAccountState.accountDetails;
      
      if (newDetails && newDetails.userDetails) {
        dispatchAccountState({ type: "FETCH_SUCCESS", payload: newDetails });
        accountDetails = newDetails;
      }
    }

    userId = accountDetails?.userDetails?.id ?? 0;
    organizationId = accountDetails?.userDetails?.memberships[0]?.organizationId ?? 0;
    token = accountDetails?.token ?? "";
    

    if (isTokenExpired(token)) {
      notificationApi.error({
        message: "Session expired",
        description: "Your sign-in session has expired. Please sign in again.",
      });
      dispatchAccountState({ type: "LOGOUT" });
      navigateToAuth();
      return;
    }

      

    getRentalProfiles(
      userId,
      organizationId,
      token
    );
      
    
  }, []);

 

  

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {contextHolder}
      <Col
        span={24}
      >

        <Card
          title={<Title level={3} style={{ color: NAVY, marginBottom: 0 }}>Your Rental Profiles</Title>}
          extra={<Button type="primary" onClick={() => setCreateProfileModalOpen(true)}>C
          reate Profile <PlusOutlined /></Button>}
        >
          {loadingProfiles ? (
            <Spin />
          ) : rentalProfiles.length > 0 ? (
            rentalProfiles.map((profile) => (
              <Card
                key={profile.id}
                style={{ marginBottom: "10px", cursor: "pointer" }}
                hoverable
                onClick={() => {navigateToRentalProfile(profile)}}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    {profile.name} <ArrowRightOutlined style={{ color: TEAL_L, marginLeft: 8 }} />
                  </Col>
                </Row>
              </Card>
            ))
          ) : (
            <Empty description="No rental profiles yet." />
          )}
        </Card>

        <Modal
          open={createProfileModalOpen}
          onCancel={() => setCreateProfileModalOpen(false)}
          footer={null}
          destroyOnHidden
          width={600}
        >
          <CreateRentalProfile />
        </Modal>

      </Col>
    </div>

  );
}
