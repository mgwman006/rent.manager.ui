import { useEffect, useState } from "react";
import { Avatar, Card, Empty, Listy, notification, Spin, Tag } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import {  } from "../../api/api";
import { LeaseInvitationDetailsDTO } from "../../models/user";
import { getActiveInvitations } from "../../services/invitationService";

const { Meta } = Card;

export default function Invitations({
  phoneNumber,
  jwtToken,
}: {
  phoneNumber: string;
  jwtToken: string | undefined;
}) {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<LeaseInvitationDetailsDTO[]>([]);
  const [loading, setLoading] = useState(false);
    const [notificationApi, notificationContextHolder] = notification.useNotification();


  const loadInvitations = async () => {
    if (!phoneNumber || !jwtToken) {
      setInvitations([]);
      return;
    }

    setLoading(true);
    try {
      const res = await getActiveInvitations(phoneNumber, jwtToken,notificationApi);
      setInvitations(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Failed to load invitations", error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInvitations();
  }, [phoneNumber, jwtToken]);

  if (loading && invitations.length === 0) {
    return (
      <div style={{ minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" tip="Loading invitations..." />
      </div>
    );
  }

  return (
    <div>
      {notificationContextHolder}
      {invitations.length === 0 ? (
        <div style={{ padding: "24px 0", textAlign: "center", color: "#666" }}>
          
            <Empty description="No invitations found."/>

        </div>
      ) : (
        <Listy<LeaseInvitationDetailsDTO>
          items={invitations}
          rowKey="id"
          itemRender={(item) => (
            <Card
              onClick={() => navigate(`/rental-profile/invitations/${item.invitationToken}`)}
              style={{ cursor: "pointer" }}
            >
              <Meta
                avatar={
                  <Avatar
                    size={52}
                    style={{ backgroundColor: "#fff1f0", color: "#cf1322" }}
                  >
                    <MailOutlined style={{ fontSize: 28 }} />
                  </Avatar>
                }
                title={
                  item.status === "ACCEPTED" ? (
                    <Tag color="success">Accepted</Tag>
                  ) : item.status === "PENDING" ? (
                    <Tag color="warning">Pending</Tag>
                  ) : (
                    <Tag color="error">{item.status}</Tag>
                  )
                }
                description={
                  <div>
                    <div>Sent: {item.sentAt ?? "-"}</div>
                    <div>Expires: {item.expiresAt ?? "-"}</div>
                  </div>
                }
              />
            </Card>
          )}
        />
      )}
    </div>
  );
}
