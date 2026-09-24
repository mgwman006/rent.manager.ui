import { Alert, Avatar, Badge, Button, Card, Col, Drawer, Flex, Form, Input, Listy, Modal, Row, Tag, Typography } from "antd";
import { LeaseInvitationCreateDTO, LeaseInvitationDetailsDTO, TenantDetailsDTO } from "../../models/user";
import { UserOutlined, CalendarOutlined, DollarOutlined, FieldTimeOutlined, EditFilled, PlusCircleOutlined, PlusOutlined, AlignLeftOutlined, ArrowLeftOutlined, EditOutlined, BookOutlined, BellOutlined, ArrowRightOutlined, WalletOutlined, CreditCardFilled, ScheduleOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationInstance } from "antd/es/notification/interface";
import { sentInvite } from "../../services/invitationService";
const { Meta } = Card;

export default function TenantView (leaseId:number,tenant:TenantDetailsDTO | null, leaseInvitations: LeaseInvitationDetailsDTO[], token:string,notificationApi:NotificationInstance)
{
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [sendInviteDrawerOpen, setSendInviteDrawerOpen] = useState(false);
    const [tenantInvitationForm] = Form.useForm<LeaseInvitationCreateDTO>();
    const navigate = useNavigate();


    const sendTenantInvite = async (formValues:LeaseInvitationCreateDTO) =>{
        if (!token) {
            notificationApi.error({
            message: "Authentication Required",
            description: "Please sign in again to load rental profile details.",
            });
            return;
        }

        const res = await sentInvite(formValues,token,notificationApi);
        setSendInviteDrawerOpen(false);
    }
    return (
        <Row>
            <Col span={24}>
                <Card 
                    variant="borderless"
                    style={{ marginBottom: 16 }}>

                        {
                            tenant != null ? (
                                <Meta
                                    avatar={<Avatar size={52}><UserOutlined style={{ fontSize: '25px' }} /></Avatar>}
                                    title={tenant.firstName && tenant.lastName ? `${tenant.firstName} ${tenant.lastName}` : "No Tenant Assigned"}
                                    description={`${tenant?.phoneNumber ?? "No Phone Provided"}`}
                                />

                            ):(
                                <Alert
                                    title="No tenant accepted this lease"
                                    description={
                                        <Flex vertical gap="small">
                                            <Typography.Text>Please follow up with your tenant or send a new invite.</Typography.Text>
                                            <Flex wrap="wrap" gap="small">
                                                <Badge count={leaseInvitations?.length ?? 0}>
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
                                leaseId : leaseId
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

                <Modal
                        title="Existing Invites"
                        open={inviteModalOpen}
                        onCancel={() => setInviteModalOpen(false)}
                        footer={null}
                    >
                        {leaseInvitations && leaseInvitations.length > 0 ? (
                            <Listy<LeaseInvitationDetailsDTO>
                                items={leaseInvitations}
                                rowKey={'id'}
                                itemRender={(invite) => (
                                    <Flex justify='space-between'>
                                        <Meta
                                            title={`${invite.firstName} ${invite.lastName}`}
                                            description={<Typography.Text>{invite.email} | {invite.phoneNumber}</Typography.Text>}
                                        />

                                        <Tag color={invite.status === "PENDING" ? "gold" : invite.status === "ACCEPTED" ? "green" : invite.status === "EXPIRED" ? "red" : "default"}>
                                            {invite.status}
                                        </Tag>
                                    </Flex>
                                )}
                            />
                        ) : (
                            <Typography.Text type="secondary">No invites have been sent for this lease yet.</Typography.Text>
                        )}
                </Modal>

            </Col>
        </Row>
    );
}