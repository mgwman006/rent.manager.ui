import { Card, Col, Drawer, Flex, Row, Button, Tag, Descriptions, Space, Listy, notification, Spin, Result, Badge, Alert, Modal, Form, InputNumber, Input, Avatar, Radio, TableProps, Table, Tabs, TabsProps } from "antd";
import { UserOutlined, CalendarOutlined, DollarOutlined, FieldTimeOutlined, EditFilled, PlusCircleOutlined, PlusOutlined, AlignLeftOutlined, ArrowLeftOutlined, EditOutlined, BookOutlined, BellOutlined, ArrowRightOutlined, WalletOutlined, CreditCardFilled, ScheduleOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useEffect, useState } from "react";
import { LeaseDetailsDTO, LeaseStatus, LeaseTermsUpdateDTO, PaymentBlockStatus, PaymentBlockSummaryDTO, RentFrequency, RentSummaryDTO } from "../../models/lease";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAccount } from "../../store/account/AccountContext";
import { leaseApi, leaseInvitationApi } from "../../api/api";
import { sentInvite } from "../../services/invitationService";
import { getRentSummary, updateLeaseTerms } from "../../services/leaseService";
import TenantView from "./TenantView";
import LeaseTermView from "./LeaseTermView";
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
    const [rentSummary,setRentSummary] = useState<RentSummaryDTO|null>();
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

    const loadRentSummary = async () => {
        const resp = await getRentSummary(leaseId, token, notificationApi);
        setRentSummary(resp);
    }

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
            label: 'Rent Collection Summarys',
            children: 'Content of Tab Pane 3',
        },
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

                    <Row>
                        <Col span={24}>
                            <Tabs defaultActiveKey="1" items={tabItems} />
                        </Col>
                    </Row>              

                    

                    <Row>
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
                                            <Row gutter={[16, 16]} >
                                                {summaryCards.map((card) => (
                                                <Col xs={24} sm={12} md={6} key={card.title}>
                                                    <Card 
                                                        hoverable 
                                                        style={{ backgroundColor:card.color ,marginBottom: 16}} 
                                                    >
                                                        

                                                            <Meta 
                                                            avatar={<Avatar size={50} icon={card.icon} />} 
                                                            title={
                                                                <Text strong style={{ display: "block", whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                    {card.title}
                                                                </Text>
                                                            }
                                                            description={
                                                                <Text style={{ display: "block", whiteSpace: "normal", wordBreak: "break-word" }}>
                                                                    {card.value}
                                                                </Text>
                                                            }
                                                        />
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


                </>
            )}
      
        </div>
    );
}