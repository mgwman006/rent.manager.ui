import { Avatar, Alert, Card, Col, Row, Table, TableProps, Tag, Typography, Button, Modal, Form, Radio, Input } from "antd";
import { CreditCardFilled, CreditCardOutlined, ScheduleOutlined, WalletOutlined } from "@ant-design/icons";
import { PaymentBlockStatus, PaymentBlockSummaryDTO, RentSummaryDTO } from "../../models/lease";
import { NotificationInstance } from "antd/es/notification/interface";
import { useEffect, useState } from "react";
import { getRentSummary } from "../../services/leaseService";
import { PaymentTransactionCreateDTO } from "../../models/payments";
import { recordPayment } from "../../services/paymentService";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";

const { Text } = Typography;
const { Meta } = Card;



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
    const [isPaymentModalOpen,setIsPaymentModalOpen] = useState<boolean>(false);
    const [paymetTransactionForm] = Form.useForm<PaymentTransactionCreateDTO>();
    const [selectedPaymentBlockId,setSelectedPaymentBlockId] = useState<number>(0);
    const { rentalProfileState } = useRentalProfile();
    


    const loadRentSummary = async () => {
        const resp = await getRentSummary(leaseId??0, token, notificationApi);
        setRentSummary(resp);
    }
    const summaryCards = [
        {
            title: "Total Lease Amount",
            value: <div>{new Intl.NumberFormat("en-TZ").format(rentSummary?.totalExpectedAmount ?? 0)} TZS</div> ,
            icon: <WalletOutlined />,
            color: "#F5F9FC",
        },
        {
            title: "Total Paid Amount",
            value: <div>{new Intl.NumberFormat("en-TZ").format(rentSummary?.totalPaidAmount ?? 0)} TZS</div> ,
            icon: <CreditCardFilled />,
            color: "#F7FFF2",
        },
        {
            title: "Total Outstanding Amount",
            value: <div>{new Intl.NumberFormat("en-TZ").format(rentSummary?.totalOutstandingAmount ?? 0)} TZS</div> ,
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

    const openPaymentTransactionModal = (paymentBlockId:number) =>{
        setIsPaymentModalOpen(true);
        setSelectedPaymentBlockId(paymentBlockId);
    }

    const handleOnFinishPaymentForm = (values:PaymentTransactionCreateDTO) => {
        const rentalProfileId = rentalProfileState.rentalProfile?.id;

        if(!rentalProfileId){
            notificationApi.error({
                description:`Rental profile value is ${rentalProfileId}`,
                message:"Invalid Rental Profile Id"
            });
            return;
        }
        recordPayment(values,rentalProfileId,token,notificationApi);
    }
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
        title: "Amount (TZS)",
        dataIndex: "amount",
        key: "amount",
        render: (amount: number) =>
            `${new Intl.NumberFormat("en-TZ").format(amount)}`,
    },
    {
        title: "Paid Amount (TZS)",
        dataIndex: "paidAmount",
        key: "paidAmount",
        render: (paidAmount: number) =>
            `${new Intl.NumberFormat("en-TZ").format(paidAmount)}`,
    },
    {
        title: "Outstanding Amount (TZS)",
        dataIndex: "outstandingAmount",
        key: "outstandingAmount",
        render: (outstandingAmount: number) =>
            `${new Intl.NumberFormat("en-TZ").format(outstandingAmount)}`,
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
            <Tag color={status === PaymentBlockStatus.UNPAID ? "red" : "green"} variant="solid">
                {status}
            </Tag>
        ),
    },
    {
        title: "Action",
        render: (_, record) => (
            <Button onClick={() => openPaymentTransactionModal(record.id)} color="primary" variant="solid" disabled={record.status === PaymentBlockStatus.PAID}> <CreditCardOutlined/> Record Payment</Button>
        ),
    },
];

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

                        <Modal
                            title="Record Payment"
                            centered
                            open={isPaymentModalOpen}
                            onCancel={() => setIsPaymentModalOpen(false)}
                            width={{
                            xs: '90%',
                            sm: '90%',
                            md: '60%',
                            lg: '50%',
                            xl: '50%',
                            xxl: '50%',
                            }}
                            footer={[null]}
                        >
                            <Form
                                size="large"
                                layout={'vertical'}
                                form={paymetTransactionForm}
                                initialValues={{ 
                                    paymentBlockId: selectedPaymentBlockId,
                                    method:"CASH",
                                    currency:"TZS",
                                    payerUserId:0
                                }}
                                onFinish={handleOnFinishPaymentForm}
                            >
                                <Form.Item 
                                    rules={[{ required: true }]}
                                    label="Payment Block Id" 
                                    name="paymentBlockId" 
                                    hidden>
                                    <Input />
                                </Form.Item>
                                
                                <Form.Item 
                                    rules={[{ required: true }]}
                                    label="User" 
                                    name="payerUserId" 
                                    hidden>
                                    <Input  />
                                </Form.Item>

                                <Form.Item         
                                    rules={[{ required: true }]}
                                    label="Amount" name="amount">
                                    <Input type={'number'} suffix="TZS" />
                                </Form.Item>

                                <Form.Item         
                                    rules={[{ required: true }]}
                                    label="Currency" name="currency" hidden>
                                    <Input />
                                </Form.Item>

                                <Form.Item        
                                    rules={[{ required: true }]}
                                    label="Patment Method" name="method" >
                                    <Radio.Group buttonStyle="solid" >
                                    <Radio.Button value="CASH">Cash</Radio.Button>
                                    <Radio.Button value="BANK_TRANSFER">Bank Transfer</Radio.Button>
                                    <Radio.Button value="MOBILE_MONEY">Mobile Money</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item         
                                    rules={[{ required: true }]}
                                    label="Reference" name="reference">
                                    <Input placeholder="input placeholder" />
                                </Form.Item>

                                <Form.Item label="Note (Optional)" name="note">
                                    <Input placeholder="Enter payment description" />
                                </Form.Item>

                                
                                <Form.Item>
                                    <Button variant="solid" block type="primary" htmlType="submit" color="green">Submit</Button>
                                </Form.Item>
                            </Form>
                        </Modal>

                    </div>
                </>
            )}
        </Card>
    );
}
