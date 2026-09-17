
import {Card,Col,Row,Typography,notification,Form} from "antd";
import {ArrowRightOutlined} from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AccountState } from "../models/user";
import { useAccount } from "../store/account/AccountContext";
import { useEffect, useState } from "react";
import { rentalProfileApi } from "../api/api";
import { handleApiError } from "../utilities/error-handler";
import { RentalProfileDetailsDTO } from "../models/rentalprofile";
import CreateRentalProfile from "./rentalprofile/CreateRentalProfile";
import { useRentalProfile } from "../store/rentalprofile/RentalProfileContext";

const { Title, Paragraph, Text } = Typography;

// ─── Brand tokens ───────────────────────────────────────────
const NAVY = "#0F172A";
const TEAL = "#0F766E";
const TEAL_L = "#14B8A6";
const AMBER = "#D4A017";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const OFF = "#F8FAFC";

const authUrl = import.meta.env.VITE_AUTH_URL?.trim();
const rentManagerUrl = import.meta.env.VITE_RENT_MANAGER_URL?.trim();

function isTokenExpired(token?: string): boolean {
  if (!token) {
    return true;
  }

  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return true;
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const exp = payload?.exp;

    if (typeof exp !== "number") {
      return true;
    }

    return Date.now() >= exp * 1000;
  } catch (error) {
    console.error("Failed to decode JWT", error);
    return true;
  }
}

export default function HomePage() 
{
  const [searchParams] = useSearchParams();
  const accountStateString = searchParams.get("state");
  const [notificationApi, contextHolder] = notification.useNotification();
  const { accountState, dispatchAccountState } = useAccount();
  const [rentalProfiles, setRentalProfiles] = useState<RentalProfileDetailsDTO[]>([]);
  const navigate = useNavigate();
  const { dispatchRentalProfileState } = useRentalProfile();
  


  const getRentalProfiles = async (userId: number, organizationId: number, token?: string) => {
    try 
    {
      if (!token) 
      {
        console.warn("No token available for membership request, skipping call.");
        return;
      }
      const response : RentalProfileDetailsDTO[] = await rentalProfileApi.getByUserIdOrOrganizationId(userId, organizationId, token);
      setRentalProfiles(response);
    } 
    catch (error:any) 
    {
        handleApiError(error,notificationApi);
    }
  }

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

    const url = `${authUrl}?outGoingUrl=${encodeURIComponent(outGoingUrlValue)}&phoneNumber=${encodeURIComponent("")}`;
    window.location.href = url;
  };

  const navigateToRentalProfile = (profile: RentalProfileDetailsDTO) => {
    dispatchRentalProfileState({
      type: "SET_RENTAL_PROFILE",
      payload: profile,
    });
    navigate(`/rental-profile`);
  }

  useEffect(() => {
    if (!accountStateString) {
      const accountDetails = accountState.accountDetails;

      if (accountDetails && !isTokenExpired(accountDetails.token)) {
        getRentalProfiles(
          accountDetails.userDetails?.id as number,
          accountDetails.userDetails?.memberships[0]?.organizationId as number,
          accountDetails.token
        );
        return;
      }

      navigateToAuth();
      return;
    }

    try {
      const receivedAccountState: AccountState = JSON.parse(accountStateString);
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
        navigateToAuth();
        return;
      }

      if (!accountState.accountDetails || accountState.accountDetails.token !== details.token) {
        dispatchAccountState({ type: "FETCH_SUCCESS", payload: details });
      }

      getRentalProfiles(
        details.userDetails?.id as number,
        details.userDetails?.memberships[0]?.organizationId as number,
        details.token
      );
      
    } catch (error) {
      console.error("Failed to parse account state from URL", error);
    }
  }, []);

 

  

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {contextHolder}

      {
        rentalProfiles.length > 0 ? (
          <Card style={{ margin: "20px" }}>
            <Title level={4}>Select Rental Profile</Title>
            {rentalProfiles.map((profile) => (
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
            ))}
          </Card>
        )   
       : (
        <CreateRentalProfile/>
      )
     }
    </div>

  );
}
