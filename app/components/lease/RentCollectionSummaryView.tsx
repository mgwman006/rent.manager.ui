import { Avatar, Alert, Card, Col, Row, Table, TableProps, Tag, Typography } from "antd";
import { CreditCardFilled, ScheduleOutlined, WalletOutlined } from "@ant-design/icons";
import { PaymentBlockStatus, PaymentBlockSummaryDTO, RentSummaryDTO } from "../../models/lease";
import { NotificationInstance } from "antd/es/notification/interface";
import { useEffect, useState } from "react";
import { getRentSummary } from "../../services/leaseService";

const { Text } = Typography;
const { Meta } = Card;

const columns: TableProps<PaymentBlockSummaryDTO>["columns"] = [
    {
        title: "Start Date",
        dataIndex: "startDate",
        key: "startDate",
    },
    {
        title: "End Date",
        dataIndex: "endDate",
        key: "endDate",
    },
    {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
    },
    {
        title: "Paid Amount",
        dataIndex: "paidAmount",
        key: "paidAmount",
    },
    {
        title: "Outstanding Amount",
        dataIndex: "outstandingAmount",
        key: "outstandingAmount",
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
            <Tag color={status === PaymentBlockStatus.UNPAID ? "red" : "green"}>
                {status}
            </Tag>
        ),
    },
];

interface RentCollectionSummaryViewProps {
    leaseId: number | null | undefined;
    token:string;
    notificationApi: NotificationInstance;

}

export default function RentCollectionSummaryView({
    leaseId,
    token,
    notificationApi
}: RentCollectionSummaryViewProps) {
    const [rentSummary,setRentSummary] = useState<RentSummaryDTO|null>();


    const loadRentSummary = async () => {
        const resp = await getRentSummary(leaseId??0, token, notificationApi);
        setRentSummary(resp);
    }
    const summaryCards = [
        {
            title: "Total Lease Amount",
            value: rentSummary?.totalExpectedAmount,
            icon: <WalletOutlined />,
            color: "#F5F9FC",
        },
        {
            title: "Total Paid Amount",
            value: rentSummary?.totalPaidAmount,
            icon: <CreditCardFilled />,
            color: "#F7FFF2",
        },
        {
            title: "Total Outstanding Amount",
            value: rentSummary?.totalOutstandingAmount,
            icon: <ScheduleOutlined />,
            color: "#FAE6E6",
        },
    ];

     useEffect(
            () =>
            {
                loadRentSummary();
            },[]
    )

    return (
        <Card 
            variant="borderless" 
            >
            {!rentSummary || rentSummary.paymentBlocks.length === 0 ? (
                <Alert
                    title="No payment blocks"
                    showIcon
                    description="There are no rent payment blocks for this lease."
                    type="warning"
                />
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        {summaryCards.map((card) => (
                            <Col xs={24} sm={12} md={8} key={card.title}>
                                <Card hoverable style={{ backgroundColor: card.color }}>
                                    <Meta
                                        avatar={<Avatar size={50} icon={card.icon} />}
                                        title={
                                            <Text
                                                strong
                                                style={{
                                                    display: "block",
                                                    whiteSpace: "normal",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {card.title}
                                            </Text>
                                        }
                                        description={
                                            <Text
                                                style={{
                                                    display: "block",
                                                    whiteSpace: "normal",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {card.value}
                                            </Text>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div style={{ overflowX: "auto", width: "100%", marginTop: 16 }}>
                        <Table<PaymentBlockSummaryDTO>
                            columns={columns}
                            dataSource={rentSummary.paymentBlocks}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 640 }}
                            size="small"
                        />
                    </div>
                </>
            )}
        </Card>
    );
}
