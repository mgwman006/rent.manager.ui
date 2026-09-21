import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Descriptions, notification, Result, Row, Spin, Tag, Typography } from "antd";
import { leaseApi, leaseInvitationApi } from "../../api/api";
import { AccountState, TenantInvitationDetailsDTO } from "../../models/user";
import { useAccount } from "../../store/account/AccountContext";
import { LeaseDetailsDTO } from "../../models/lease";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";

const { Title, Text } = Typography;

const authUrl = import.meta.env.VITE_AUTH_URL?.trim();
const tenantManagerUrl = import.meta.env.VITE_TENANT_MANAGER_URL?.trim();

export default function InvitationDetails() {
  const { invitationToken } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<TenantInvitationDetailsDTO | null>(null);
  const [lease,setLease] = useState<LeaseDetailsDTO | null> (null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [notificationApi, contextHolder] = notification.useNotification();
  const { accountState, dispatchAccountState } = useAccount();
  const jwtToken = accountState.accountDetails?.token;
  const {rentalProfileState} = useRentalProfile();
  
function isTokenExpired(token?: string): boolean 
    {
        if (!token) 
        {
            return true;
        }

        try {
            const parts = token.split(".");
            if (parts.length < 2) {return true;}

            const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
            const exp = payload?.exp;

            if (typeof exp !== "number") {
                return true;
            }

            return Date.now() >= exp * 1000;
        } catch (error) {
            return true;
        }
    }

  const navigateToAuthFromInvitation = (nextApp: string = "tenant-manager", phone?: string) => {
        if (!authUrl) {
            notificationApi.error({
            message: "Error while reading url",
            description: "VITE_AUTH_URL is not configured.",
            });
            return;
        }

        const outGoingUrlValue = nextApp === "tenant-manager" ? `tenantManagerUrl/invitation/${invitationToken}`: null;
        if (!outGoingUrlValue) {
            console.error("Unable to resolve outgoing URL for auth redirect.");
            return;
        }

        const url = `${authUrl}?outGoingUrl=${encodeURIComponent(outGoingUrlValue)}&phoneNumber=${encodeURIComponent("")}`;
        window.location.href = url;
  };



  const loadInvitation = async () => {

    if (!invitationToken) {
      notificationApi.error({
        message: "Invitation missing",
        description: "The tenant invitation token was not provided.",
      });
      setLoading(false);
      return;
    }

    if(!jwtToken)
    {
      navigateToAuthFromInvitation();
      return;
    }

    



    try {
      const data = await leaseInvitationApi.getByInvitationToken(invitationToken,jwtToken);
      setInvitation(data);

      if(data.leaseId)
      {
        const res = await leaseApi.getLeaseById(data.leaseId,jwtToken);
        setLease(res);
      }
    } catch (error: any) {
      notificationApi.error({
        message: error.message ?? "Unable to load invitation",
        description: error.details ?? "The invitation could not be loaded.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const receivedAccountState: AccountState = accountState;
    const details = receivedAccountState.accountDetails;
    if (!details) {
        console.error("Account state payload is missing accountDetails");
        return;
    }
    if (isTokenExpired(details.token)) {
        notificationApi.error({
        message: "Session expired",
        description: "Your sign-in session has expired. Please sign in again.",
        });
        dispatchAccountState({ type: "LOGOUT" });
        navigateToAuthFromInvitation();
        return;
    }

    loadInvitation();
  }, [invitationToken]);

  const handleAcceptInvitation = async () => {
    if (!jwtToken) {
      navigateToAuthFromInvitation();
      return;
    }

    if (!invitationToken) {
      notificationApi.error({
        message: "Invitation missing",
        description: "No invitation token was found to accept.",
      });
      return;
    }

    const rentalProfileId = rentalProfileState.rentalProfile?.id;
    if (!rentalProfileId) {
      notificationApi.error({
        message: "User not found",
        description: "Your account details are missing, so we cannot accept this invitation.",
      });
      return;
    }

    setAccepting(true);
    try {
      await leaseInvitationApi.acceptInvitation(invitationToken, rentalProfileId, jwtToken);
      notificationApi.success({
        message: "Invitation accepted",
        description: "Your lease details are now available.",
      });
      navigate(`/`);
    } catch (error: any) {
      notificationApi.error({
        message: error?.message ?? "Failed to accept invitation",
        description: error?.data ?? "The invitation could not be accepted.",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        {contextHolder}
        <Spin size="large" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        {contextHolder}
         <Result
            status="warning"
            title="Invitation not found or expired"
            extra={
              <Button type="primary" key="console">
                Go Home
              </Button>
            }
          />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {contextHolder}
      <Row>
          <Col span={24}>
          <Card 
        title="Lease Terms"
        >
        <Descriptions column={1} bordered style={{ marginTop: 20 }}>
          <Descriptions.Item label="Start Date">{lease?.startDate}</Descriptions.Item>
          <Descriptions.Item label="End Date">{lease?.endDate}</Descriptions.Item>
          <Descriptions.Item label="Rental Amount">{lease?.rent?.amount} {lease?.rent.currency}</Descriptions.Item>
          <Descriptions.Item label="Rental Period">{lease?.rent.frequency}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={invitation.status === "PENDING" ? "gold" : "green"}>{invitation.status}</Tag>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" size="large" loading={accepting} onClick={handleAcceptInvitation}>
            Accept invitation
          </Button>
        </div>
      </Card>
      </Col>
      </Row>
      
      
    </div>
  );
}
