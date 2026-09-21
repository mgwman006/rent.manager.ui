import { Card, Col, Drawer, Flex, Row, Button, Tag, Descriptions, Space, Listy, notification, Spin, Result, Badge, Alert, Modal, Form, InputNumber, Input, Avatar } from "antd";
import { UserOutlined, CalendarOutlined, DollarOutlined, FieldTimeOutlined, EditFilled, PlusCircleOutlined, PlusOutlined, AlignLeftOutlined, ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useEffect, useState } from "react";
import { LeaseDetailsDTO, LeaseStatus, RentSummaryDTO } from "../../models/lease";
import { TenantInvitationCreateDTO, TenantInvitationDetailsDTO } from "../../models/user";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAccount } from "../../store/account/AccountContext";
import { leaseApi, leaseInvitationApi } from "../../api/api";
import { sentInvite } from "../../services/invitationService";
import { getRentSummary } from "../../services/leaseService";
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
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [sendInviteDrawerOpen, setSendInviteDrawerOpen] = useState(false);
    const [tenantInvitationForm] = Form.useForm<TenantInvitationCreateDTO>();
    const [rentSummary,setRentSummary] = useState<RentSummaryDTO|null>();
    const navigate = useNavigate();

    const token = accountState.accountDetails?.token ?? "";

    if (isNaN(leaseId)) {
        return <div>Invalid lease id</div>;
    }

    const sendTenantInvite = async (formValues:TenantInvitationCreateDTO) =>
    {
        if (!token) {
          notificationApi.error({
            message: "Authentication Required",
            description: "Please sign in again to load rental profile details.",
          });
          return;
        }

        try
        {
            const res = await sentInvite(formValues,token,notificationApi);
            if(res)
            {
              leaseDetails?.tenantInvitations?.push(res);
            }
        }
        finally
        {
            setSendInviteDrawerOpen(false);
        }
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

    const loadRentSummary = async () => {
        const resp = await getRentSummary(leaseId, token, notificationApi);
        setRentSummary(resp);
    }
    
    useEffect(
        () =>
        {
            loadLeaseDetails();
            loadRentSummary();
        },[leaseId]
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
                            <Button color="green" variant="text" onClick={() => navigate(-1)}><ArrowLeftOutlined /> Back</Button>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Flex
                                justify="space-between"
                            >

                            <Typography.Title level={3}>Lease Details</Typography.Title>
                            <Button disabled={leaseDetails.status==LeaseStatus.ACTIVE} ><EditOutlined /> Edit Lease</Button>

                            </Flex>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card 
                                variant="borderless"
                                title="Tenant" 
                                style={{ marginBottom: 16 }}>

                                    {
                                        leaseDetails.tenant != null ? (
                                            <Meta
                                                avatar={<Avatar size={52}><UserOutlined style={{ fontSize: '25px' }} /></Avatar>}
                                                title={leaseDetails.tenant?.firstName && leaseDetails.tenant?.lastName ? `${leaseDetails.tenant.firstName} ${leaseDetails.tenant.lastName}` : "No Tenant Assigned"}
                                                description={`${leaseDetails.tenant?.phoneNumber ?? "No Phone Provided"}`}
                                            />

                                        ):(
                                            <Alert
                                                title="No tenant accepted this lease"
                                                description={
                                                    <Flex vertical gap="small">
                                                        <Text>Please follow up with your tenant or send a new invite.</Text>
                                                        <Flex wrap="wrap" gap="small">
                                                            <Badge count={leaseDetails.tenantInvitations?.length ?? 0}>
                                                                <Button onClick={() => setInviteModalOpen(true)} variant="filled">
                                                                    Invitations
                                                                </Button>
                                                            </Badge>
                                                            <Button type="primary" onClick={() => setSendInviteDrawerOpen(true)}>
                                                                Send new Invite <PlusOutlined />
                                                            </Button>
                                                        </Flex>
                                                    </Flex>
                                                }
                                                type="warning"
                                            />
                                            
                                        )
                                    }
                                
                            </Card>
                        </Col>

                    {/* <Col span={24}>
                        <Card size="small" title="Property" style={{ marginBottom: 16 }}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Unit ID">{selectedLease.unitId ?? "Not assigned"}</Descriptions.Item>
                            <Descriptions.Item label="Property">{selectedLease.unitId ? `Unit ${selectedLease.unitId}` : "No property linked"}</Descriptions.Item>
                            <Descriptions.Item label="Rental Profile ID">{selectedLease.rentalProfileId ?? rentalProfileId}</Descriptions.Item>
                        </Descriptions>
                        </Card>
                    </Col> */}

                    <Col span={24}>
                        <Card 
                            variant="borderless"
                            title="Lease Terms" 
                            style={{ marginBottom: 16 }}
                        >
                        <Flex vertical gap={8}>

                            <Flex gap={"medium"}>
                                <Meta 
                                    avatar={
                                        <CalendarOutlined
                                        style={{ color: '#14b8a6' }} 
                                        />
                                    }
                                    title={<Text strong>Start Date:</Text>}
                                />
                            
                                <Text>{leaseDetails.startDate}</Text>
                            </Flex>

                            <Flex gap={"medium"}>
                                <Meta 
                                    avatar={
                                        <CalendarOutlined
                                        style={{ color: 'red' }} 
                                        />
                                    }
                                    title={<Text strong>End Date:</Text>}
                                />
                                <Text>{leaseDetails.endDate}</Text>
                            </Flex>

                            <Flex gap={"medium"}>
                                <Meta 
                                    avatar={
                                        <DollarOutlined
                                        style={{ color: '#14b8a6' }} 
                                        />
                                    }
                                    title={<Text strong>Rent Amount:</Text>}
                                />
                                <Text>{leaseDetails.rent?.amount ?? "Not specified"} {leaseDetails.rent?.currency}</Text>
                            </Flex>

                            <Flex gap={"medium"}>
                                <Meta 
                                    avatar={
                                        <FieldTimeOutlined
                                        style={{ color: '#14b8a6' }} 
                                        />
                                    }
                                    title={<Text strong>Rent Period:</Text>}
                                />
                                <Text>{leaseDetails.rent?.frequency ?? "Not specified"}</Text>
                            </Flex>

                        </Flex>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card 
                            variant="borderless"
                            title="Rent Collection Summary" 
                            style={{ marginBottom: 16 }}
                        >
                            {
                                rentSummary?.paymentBlocks.length==0 ? (
                                    <Row>
                                        <Col span={24}>
                                            <Alert
                                        title="Error Text"
                                        showIcon
                                        description="No payment blocks"
                                        type="warning"
                                    />
                                        </Col>
                                    </Row>
                                
                                ):(
                                    <div>
                                        <Descriptions
                                            size="small"
                                            column={1}
                                            layout="horizontal"
                                        >
                                        
                                            <Descriptions.Item label="Total Rent Amount (TZS)">
                                            {rentSummary?.totalExpectedAmount}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Amount Paid (TZS)">
                                            {rentSummary?.totalPaidAmount}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Outstanding Amount (TZS)">
                                            {rentSummary?.totalOutstandingAmount}
                                            </Descriptions.Item>
                                        
                                        </Descriptions>
                                    </div>
                                )
                            }
                        </Card>
                    </Col>

                
                    </Row>

                    <Modal
                        title="Existing Invites"
                        open={inviteModalOpen}
                        onCancel={() => setInviteModalOpen(false)}
                        footer={null}
                    >
                        {leaseDetails.tenantInvitations && leaseDetails.tenantInvitations.length > 0 ? (
                            <Listy<TenantInvitationDetailsDTO>
                                items={leaseDetails.tenantInvitations}
                                rowKey={'id'}
                                itemRender={(invite) => (
                                    <Flex justify='space-between'>
                                        <Meta
                                            title={`${invite.firstName} ${invite.lastName}`}
                                            description={<Text>{invite.email} | {invite.phoneNumber}</Text>}
                                        />

                                        <Tag color={invite.status === "PENDING" ? "gold" : invite.status === "ACCEPTED" ? "green" : invite.status === "EXPIRED" ? "red" : "default"}>
                                            {invite.status}
                                        </Tag>
                                    </Flex>
                                )}
                            />
                        ) : (
                            <Text type="secondary">No invites have been sent for this lease yet.</Text>
                        )}
                    </Modal>

                    <Drawer
                        title="Send New Invite"
                        placement="right"
                        open={sendInviteDrawerOpen}
                        onClose={() => setSendInviteDrawerOpen(false)}
                    >
                        <Form
                            layout="vertical"
                            form={tenantInvitationForm}
                            onFinish={sendTenantInvite}
                            size="large"
                            initialValues={{
                                leaseId : leaseDetails.id
                            }}
                        >
                            <Form.Item
                                name="leaseId"
                                label="leaseId"
                                required
                            >
                                <Input disabled/>
                            </Form.Item>

                            <Form.Item
                                name="firstName"
                                label="firstName"
                                required
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="lastName"
                                label="lastName"
                                required
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="phoneNumber"
                                label="Phone Number"
                                required
                            >
                                <Input type='phone' />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                            >
                                <Input type='email' />
                            </Form.Item>

                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>

                        </Form>
                    </Drawer>

                </>
            )}
      
        </div>
    );
}