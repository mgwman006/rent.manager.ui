import { Button, Card, Col, Descriptions, Form, Input, InputNumber, Modal, Radio, Row } from "antd";
import { LeaseDetailsDTO, LeaseStatus, LeaseTermsUpdateDTO, RentFrequency } from "../../models/lease";
import { UserOutlined, CalendarOutlined, DollarOutlined, FieldTimeOutlined, EditFilled, PlusCircleOutlined, PlusOutlined, AlignLeftOutlined, ArrowLeftOutlined, EditOutlined, BookOutlined, BellOutlined, ArrowRightOutlined, WalletOutlined, CreditCardFilled, ScheduleOutlined } from "@ant-design/icons";
import { NotificationInstance } from "antd/es/notification/interface";
import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateLeaseTerms } from "../../services/leaseService";

interface LeaseTermViewProps {
    leaseDetails: LeaseDetailsDTO;
    setLeaseDetails: Dispatch<SetStateAction<LeaseDetailsDTO | null>>;
    token: string;
    notificationApi: NotificationInstance;
}

export default function LeaseTermView({
    leaseDetails,
    setLeaseDetails,
    token,
    notificationApi,
}: LeaseTermViewProps){
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLeaseForm] = Form.useForm<LeaseTermsUpdateDTO>();
    const navigate = useNavigate();

    
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
                leaseDetails.id,
                payload,
                token,
                notificationApi
            );
    
            if (updatedLease) {
                setLeaseDetails(updatedLease);
                setEditModalOpen(false);
            }
           
    };

    return (
        <Row>
            <Col span={24}>
                <Card 
                    title={<Button color="primary" variant="solid" disabled={leaseDetails.status==LeaseStatus.ACTIVE} onClick={openEditModal}><EditOutlined /> Edit Terms</Button>}
                    variant="borderless"
                    style={{ marginBottom: 16 }}
                >
                    <Descriptions
                        column={{ xs: 1, sm: 1, md: 2 }}
                        size="small"
                        layout="horizontal"
                        styles={{
                            label: { whiteSpace: "normal" },
                            content: { wordBreak: "break-word" },
                        }}
                    >
                        <Descriptions.Item label="Start Date">{leaseDetails.startDate}</Descriptions.Item>
                        <Descriptions.Item label="End Date">{leaseDetails.endDate}</Descriptions.Item>
                        <Descriptions.Item label="Rent Amount">{leaseDetails.rent?.amount ?? "Not specified"} {leaseDetails.rent?.currency}</Descriptions.Item>
                        <Descriptions.Item label="Rent Period">{leaseDetails.rent?.frequency ?? "Not specified"}</Descriptions.Item>
                        <Descriptions.Item label="Is Full payment required">{leaseDetails.fullLeasePaymentRequired}</Descriptions.Item>
                    </Descriptions>
                </Card>

                <Modal
                        title="Edit Terms"
                        open={editModalOpen}
                        onCancel={() => setEditModalOpen(false)}
                        footer={null}>
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
            </Col>
        </Row>
    );
}