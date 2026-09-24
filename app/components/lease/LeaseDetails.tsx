import { Card, Col, Drawer, Flex, Row, Button, Tag, Descriptions, Space, Listy, notification, Spin, Result, Badge, Alert, Modal, Form, InputNumber, Input, Avatar, Radio, TableProps, Table, Tabs, TabsProps } from "antd";
import { UserOutlined, CalendarOutlined, DollarOutlined, FieldTimeOutlined, EditFilled, PlusCircleOutlined, PlusOutlined, AlignLeftOutlined, ArrowLeftOutlined, EditOutlined, BookOutlined, BellOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useEffect, useState } from "react";
import { LeaseDetailsDTO, LeaseStatus, LeaseTermsUpdateDTO, PaymentBlockSummaryDTO, RentSummaryDTO } from "../../models/lease";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAccount } from "../../store/account/AccountContext";
import { leaseApi, leaseInvitationApi } from "../../api/api";
import { sentInvite } from "../../services/invitationService";
import { getRentSummary, updateLeaseTerms } from "../../services/leaseService";
import TenantView from "./TenantView";
import LeaseTermView from "./LeaseTermView";
import RentCollectionSummaryView from "./RentCollectionSummaryView";
const { Text } = Typography;
const { Meta } = Card;


export default function LeaseDetails()
{
    const { leaseIdParam } = useParams();
    const [notificationApi, contextHolder] = notification.useNotification();
    const [leaseDetails, setLeaseDetails] = useState<LeaseDetailsDTO | null>(null);
    const [leaseId, setLeaseId] = useState<number>(leaseIdParam ? parseInt(leaseIdParam, 10) : 0);
    const { accountState } = useAccount();
    const [leaseLoading, setLeaseLoading] = useState(false);
    const navigate = useNavigate();

    const token = accountState.accountDetails?.token ?? "";

    if (isNaN(leaseId)) {
        return <div>Invalid lease id</div>;
    }


    const loadLeaseDetails = async () => 
    {
        if (!token) {
          notificationApi.error({
            message: "Authentication Required",
            description: "Please sign in again to load rental profile details.",
          });
          return;
        }
        setLeaseLoading(true);
        try {
          const data = await leaseApi.getLeaseById(leaseId, token);
          setLeaseDetails(data);
        } catch (error: any) {
          notificationApi.error({
            message: "Failed to load Lease",
            description: error?.message ?? "Unable to fetch lease details.",
          });
        } finally {
            setLeaseLoading(false);
        }
      };

    

    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: 'Tenant',
            children: TenantView (
                leaseId,
                leaseDetails?.tenant ? leaseDetails.tenant : null, 
                leaseDetails?.invitations ? leaseDetails.invitations : [], 
                token,notificationApi),
        },
        {
            key: '2',
            label: 'Property',
            children: 'No propert Linked',
        },
        {
            key: '3',
            label: 'Terms',
            children: leaseDetails ? (
                <LeaseTermView
                    leaseDetails={leaseDetails}
                    setLeaseDetails={setLeaseDetails}
                    token={token}
                    notificationApi={notificationApi}
                />
            ) : null,
        },
        {
            key: '4',
            label: 'Payment',
            children: <RentCollectionSummaryView 
                leaseId={leaseDetails?.id}
                token={token}
                notificationApi={notificationApi}
             />,
        },
    ];
    
    useEffect(
        () =>
        {
            loadLeaseDetails();
        },[]
    )

    
    if(leaseLoading) {
    return (
      <div style={{ textAlign: "center", paddingTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  
    return (
        <div>
            {contextHolder}
            {leaseDetails && (
                <>
                    <Row>
                        <Col span={24}>
                            <Button color="default" variant="text" onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back</Button>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Typography.Title level={3}>Lease Details</Typography.Title>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Tabs defaultActiveKey="1" items={tabItems} />
                        </Col>
                    </Row>              

                </>
            )}
      
        </div>
    );
}