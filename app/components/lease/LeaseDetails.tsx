import { Card, Col, Drawer, Flex, Row, Button, Tag, Descriptions, Space, Listy, notification, Spin, Result, Badge, Alert, Modal, Form, InputNumber, Input, Avatar } from "antd";
import { UserOutlined, CalendarOutlined, DollarOutlined, FieldTimeOutlined, EditFilled, PlusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useEffect, useState } from "react";
import { LeaseDetailsDTO } from "../../models/lease";
import { TenantInvitationCreateDTO, TenantInvitationDetailsDTO } from "../../models/user";
import { useParams } from "react-router-dom";
import { useAccount } from "../../store/account/AccountContext";
import { leaseApi, leaseInvitationApi } from "../../api/api";
import { sentInvite } from "../../services/invitationService";
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
    
    useEffect(
        () =>
        {
            loadLeaseDetails();
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
                                            description="Please follow up with your tenant or send new invite"
                                            type="warning"
                                            action={
                                                <Flex vertical gap="small" >
                                                    <Badge count={leaseDetails.tenantInvitations?.length ?? 0} >
                                                        <Button onClick={()=>setInviteModalOpen(true)}  variant="filled">Invitations</Button>
                                                    </Badge>
                                                    <Button type="primary" onClick={() => setSendInviteDrawerOpen(true)}>
                                                        Send new Invite <PlusOutlined/>
                                                    </Button>
                                                </Flex>
                                            }
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

                        <Flex justify="space-between">
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

                        <Flex justify="space-between">
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

                        <Flex justify="space-between">
                        <Meta 
                            avatar={
                                <DollarOutlined
                                style={{ color: '#14b8a6' }} 
                                />
                            }
                            title={<Text strong>Rent Amount:</Text>}
                        />
                        <Text>{leaseDetails.rentAmount} {leaseDetails.currency}</Text>
                        </Flex>

                        <Flex justify="space-between">
                        <Meta 
                            avatar={
                                <FieldTimeOutlined
                                style={{ color: '#14b8a6' }} 
                                />
                            }
                            title={<Text strong>Rent Period:</Text>}
                        />
                        <Text>{leaseDetails.rentFrequency ?? "Not specified"}</Text>
                        </Flex>

                    </Flex>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card 
                        variant="borderless"
                        title="Financials Summary" 
                        style={{ marginBottom: 16 }}
                    >
                    <Flex vertical gap={8}>
                        <Flex justify="space-between">
                        <Meta 
                            avatar={
                                <FieldTimeOutlined
                                style={{ color: '#14b8a6' }} 
                                />
                            }
                            title={<Text strong>Payment Period:</Text>}
                        />
                        <Text>{leaseDetails.rentFrequency ?? "Not specified"}</Text>
                        </Flex>

                        <Flex justify="space-between">
                        <Meta 
                            avatar={
                                <DollarOutlined
                                style={{ color: '#14b8a6' }} 
                                />
                            }
                            title={<Text strong>Amount To Pay:</Text>}
                        />
                        <Text>{leaseDetails.totalAmount} {leaseDetails.currency}</Text>
                        </Flex>

                        <Flex justify="space-between">
                        <Meta 
                            avatar={
                                <DollarOutlined
                                style={{ color: '#14b8a6' }} 
                                />
                            }
                            title={<Text strong>Amount Paid:</Text>}
                        />
                        <Text>{leaseDetails.amountPaid ?? 0} {leaseDetails.currency}</Text>
                        </Flex>

                        <Flex justify="space-between">
                        <Meta 
                            avatar={
                                <DollarOutlined
                                style={{ color: 'red' }} 
                                />
                            }
                            title={<Text strong>Balance:</Text>}
                        />
                        <Text>{leaseDetails.balance ?? leaseDetails.rentAmount} {leaseDetails.currency}</Text>
                        </Flex>

                    </Flex>
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