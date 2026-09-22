import { Card, Col, Drawer, Flex, Row, Button, Tag, Descriptions, Space, Listy, notification, Spin, Result, Badge, Alert, Modal, Form, InputNumber, Input, Avatar, Radio, TableProps, Table } from "antd";
import { UserOutlined, CalendarOutlined, DollarOutlined, FieldTimeOutlined, EditFilled, PlusCircleOutlined, PlusOutlined, AlignLeftOutlined, ArrowLeftOutlined, EditOutlined, BookOutlined, BellOutlined, ArrowRightOutlined, WalletOutlined, CreditCardFilled, ScheduleOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useEffect, useState } from "react";
import { LeaseDetailsDTO, LeaseStatus, LeaseTermsUpdateDTO, PaymentBlockStatus, PaymentBlockSummaryDTO, RentFrequency, RentSummaryDTO } from "../../models/lease";
import { TenantInvitationCreateDTO, TenantInvitationDetailsDTO } from "../../models/user";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAccount } from "../../store/account/AccountContext";
import { leaseApi, leaseInvitationApi } from "../../api/api";
import { sentInvite } from "../../services/invitationService";
import { getRentSummary, updateLeaseTerms } from "../../services/leaseService";
const { Text } = Typography;
const { Meta } = Card;



const columns: TableProps<PaymentBlockSummaryDTO>['columns'] = [
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
  },
  {
    title: 'End Date',
    dataIndex: 'endDate',
    key: 'endDate',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Paid Amount',
    dataIndex: 'paidAmount',
    key: 'paidAmount',
  },
  {
    title: 'Outstanding Amount',
    dataIndex: 'outstandingAmount',
    key: 'outstandingAmount',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (text) => <Tag color={text==PaymentBlockStatus.UNPAID ? "red":"green"} >{text}</Tag>,
  }
];


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
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLeaseForm] = Form.useForm<LeaseTermsUpdateDTO>();
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

    const openEditModal = () => {
        if (!leaseDetails) {
            notificationApi.error({
                message: "Lease data is not available",
                description: "The lease details are still loading or missing rent data.",
            });
            return;
        }

        editLeaseForm.setFieldsValue({
            startDate: leaseDetails.startDate ? leaseDetails.startDate.slice(0, 10) : "",
            endDate: leaseDetails.endDate ? leaseDetails.endDate.slice(0, 10) : "",
            rent: {
                id: leaseDetails.rent?.id ?? 0,
                amount: leaseDetails.rent?.amount ?? 0,
                currency: leaseDetails.rent?.currency ?? "TZS",
                frequency: (leaseDetails.rent?.frequency as RentFrequency) ?? RentFrequency.MONTHLY,
            },
            fullLeasePaymentRequired: leaseDetails.fullLeasePaymentRequired ?? false,
        });
        setEditModalOpen(true);
    };

    const handleEditLease = async (values: LeaseTermsUpdateDTO) => {
        if (!token) {
            notificationApi.error({
                message: "Authentication Required",
                description: "Please sign in again to edit this lease.",
            });
            navigate("/");
            return;
        }

        const payload: LeaseTermsUpdateDTO = {
        ...values,
        rent: {
            ...values.rent,
            currency: leaseDetails?.rent?.currency ?? "TZS",
        },
        };

        const updatedLease = await updateLeaseTerms(
            leaseId,
            payload,
            token,
            notificationApi
        );

        if (updatedLease) {
            setLeaseDetails(updatedLease);
            setEditModalOpen(false);
        }
       
    };

    const summaryCards = [
    { 
      title: "Total Lease Amount", 
      value: `${rentSummary?.totalExpectedAmount}`, 
      icon: <WalletOutlined />, 
      color: "#F5F9FC" ,
    },
    { 
      title: "Total Paid Amount", 
      value: `${rentSummary?.totalPaidAmount}`, 
      icon: <CreditCardFilled />, 
      color: "#F7FFF2" ,
    },
    {
      title: "Total Outstanding Amount",
      value:`${rentSummary?.totalOutstandingAmount}`,
      icon: <ScheduleOutlined />,    
      color: "#FAE6E6",
    }
];
    
    useEffect(
        () =>
        {
            loadLeaseDetails();
            loadRentSummary();
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
                            extra={[<Button disabled={leaseDetails.status==LeaseStatus.ACTIVE} onClick={openEditModal}><EditOutlined /> Edit Terms</Button>]}
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
                                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                                            {summaryCards.map((card) => (
                                            <Col xs={24} sm={12} md={6} key={card.title}>
                                                <Card 
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
                                                    </Flex>
                                                    
                                                </Card>
                                            </Col>
                                            ))}
                                        </Row>
                                       
                                        <Row>
                                            <Col span={24}>
                                                <div style={{ overflowX: "auto", width: "100%" }}>
                                                    <Table<PaymentBlockSummaryDTO>
                                                        columns={columns}
                                                        dataSource={rentSummary?.paymentBlocks ?? []}
                                                        pagination={false}
                                                        scroll={{ x: 640 }}
                                                        size="small"
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
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

                    <Modal
                        title="Edit Terms"
                        open={editModalOpen}
                        onCancel={() => setEditModalOpen(false)}
                        footer={null}
                    >
                        <Form
                            form={editLeaseForm}
                            layout="vertical"
                            onFinish={handleEditLease}
                            onFinishFailed={({ errorFields }) => {
                                notificationApi.error({
                                    message: "Unable to submit lease changes",
                                    description: errorFields.map(({ name }) => name.join(".")).join(", "),
                                });
                            }}
                        >
                            <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
                                <Input type="date" />
                            </Form.Item>
                            <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
                                <Input type="date" />
                            </Form.Item>
                            <Form.Item name={["rent", "id"]} hidden>
                                <InputNumber />
                            </Form.Item>
                            <Form.Item name={["rent", "currency"]} hidden>
                                <Input />
                            </Form.Item>
                            <Form.Item name={["rent", "amount"]} label="Rent Amount" rules={[{ required: true }]}> 
                                <InputNumber min={0} style={{ width: "100%" }} suffix="TZS"/>
                            </Form.Item>
                            <Form.Item 
                                name={["rent", "frequency"]} 
                                rules={[{ required: true }]}
                            >
                                {/* <Input /> */}
                                <Radio.Group buttonStyle="solid">
                                    <Radio.Button value="YEARLY">Per Year</Radio.Button>
                                    <Radio.Button value="MONTHLY">Per Month</Radio.Button>
                                    <Radio.Button value="WEEKLY">Per Week</Radio.Button>
                                    <Radio.Button value="DAILY">Per Day</Radio.Button>
                                </Radio.Group>
                        
                            </Form.Item>
                            <Form.Item
                                name="fullLeasePaymentRequired"
                                label="Do you need full payment"
                                rules={[{ required: true, message: "Please select whether full payment is required" }]}
                            >
                                <Radio.Group buttonStyle="solid">
                                    <Radio.Button value={true}>Yes</Radio.Button>
                                    <Radio.Button value={false}>No</Radio.Button>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item>
                                <Button htmlType="submit"  type="primary" variant="solid" color="green" block>Submit</Button>
                            </Form.Item>
                        </Form>
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