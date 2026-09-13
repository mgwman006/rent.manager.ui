import { Button, Card, Col, Drawer, Form, Input, InputNumber, notification, Radio, Row, Select, Spin, Tag, Typography } from "antd";
import { PlusOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons";
import { LeaseCreateDTO, LeaseDetailsDTO, LeaseStatus } from "../../models/lease";
import { useEffect, useState } from "react";
import { leaseApi } from "../../api/api";
import { useAccount } from "../../store/account/AccountContext";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
const { Meta } = Card;
const { Title, Text } = Typography;



export default function LeaseList(){
    const navigate = useNavigate();
    const [leaseForm] = Form.useForm<LeaseCreateDTO>();
    const [leases, setLeases] = useState<LeaseDetailsDTO[]>([]);
    const [leasesLoading, setLeasesLoading] = useState(false);
    const [createLeaseModalVisible, setCreateLeaseModalVisible] = useState(false);
    const [displayCount, setDisplayCount] = useState<number>(5);
    const [notificationApi, contextHolder] = notification.useNotification();
    const { accountState } = useAccount();
    const { rentalProfileState } = useRentalProfile();
    const token = accountState.accountDetails?.token ?? "";


    const loadMore = () => setDisplayCount((c) => c + 5);


    const loadLeases = async (rentalProfileId:number) => {
    
        setLeasesLoading(true);
        try {
          const data = await leaseApi.getLeasesByRentalProfile(rentalProfileId, token);
          setLeases(data);
        } catch (error: any) {
          notificationApi.error({ message: "Failed to load leases", description: error?.message ?? "" });
        } finally {
          setLeasesLoading(false);
        }
      };

    const handleCreateLease = async (values: LeaseCreateDTO) => 
    {
        const rentalProfileId = rentalProfileState.rentalProfile?.id;
        if (!token || !rentalProfileId) {
            notificationApi.error({
                message: "Authentication Required",
                description: "Please sign in again to create a lease.",
            });
            return;
        }

        try 
        {
            const newLease: LeaseCreateDTO = {
                ...values,
                rentalProfileId: rentalProfileId,
            };

            const response = await leaseApi.createLease(newLease, token);

        
            setCreateLeaseModalVisible(false);
            loadLeases(rentalProfileId); // Refresh the leases list
            notificationApi.success({
                message: "Lease Created",
                description: "The lease has been successfully created.",
            });
        } catch (error: any) {
            notificationApi.error({
                message: error.message ?? "Failed to create lease",
                description: error?.data ?? "Unable to create lease.",
            });
        }
    };

   useEffect(() => {
        const rentalProfileId = rentalProfileState.rentalProfile?.id;
        if (!token || !rentalProfileId) {
            return;
        }
        loadLeases(rentalProfileId);
    }, [token, rentalProfileState.rentalProfile, notificationApi]);

    return (
        <div>
            {contextHolder}
            <Card style={{ marginTop: 24 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={5}>Leases</Title>
                    </Col>
                    <Col>
                        <Button type="primary" onClick={() => setCreateLeaseModalVisible(true)}><PlusOutlined /> Create Lease</Button>
                    </Col>
                </Row>

                <div style={{ marginTop: 16 }}>
                    {leasesLoading ? (
                    <div style={{ textAlign: 'center', padding: 24 }}>
                        <Spin />
                    </div>
                    ) : (
                    <Row gutter={[16, 16]}>
                        {leases.slice(0, displayCount).map((lease) => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={8} key={lease.id}>
                            <Card
                            title={
                                <Tag 
                                    color={lease.status.toString() === LeaseStatus.ACTIVE.toString() ? "green" : 
                                        lease.status.toString() === LeaseStatus.PENDING.toString() ? "warning" : 
                                        lease.status.toString() === LeaseStatus.ENDED.toString() ? "error" : 
                                        lease.status.toString() === LeaseStatus.TERMINATED.toString() ? "error" :
                                        "default"}>
                                    {lease.status}
                                </Tag>
                                }
                            style={{ height: '100%' }}
                            extra={<MoreOutlined onClick={() => {navigate(`leases/${lease.id}`);}} />}
                            >
                            <Meta
                                title={<Text strong>{lease.tenant?.firstName && lease.tenant?.lastName ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : "No Tenant Assigned"}</Text>}
                                description={<Text type="secondary">{lease.startDate} → {lease.endDate}</Text>}
                            />
                            </Card>
                        </Col>
                        ))}
                    </Row>
                    )}

                    {displayCount < leases.length && (
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                        <Button onClick={loadMore}>Load more</Button>
                    </div>
                    )}
                </div>
            </Card>


            <Drawer
                title="Create Lease"
                placement="right"
                open={createLeaseModalVisible}
                onClose={() => setCreateLeaseModalVisible(false)}
                size="large"
                extra={
                    <Button onClick={() => setCreateLeaseModalVisible(false)}>Cancel</Button>
                }
            >
                <Form
                form={leaseForm}
                layout="vertical"
                onFinish={async (values) => {handleCreateLease(values);}}
                >
                <Form.Item
                    hidden={true}
                    name="rentalProfileId"
                    label="Rental Profile ID"
                    rules={[{ required: false, message: "Please enter the rental profile ID" }]}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    hidden={true}
                    name="unitId"
                    label="Unit ID"
                    rules={[{ required: false, message: "Please enter the unit ID" }]}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    hidden={true}
                    name="tenantId"
                    label="Tenant ID"
                    rules={[{ required: false, message: "Please enter the tenant ID" }]}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="tenantFirstName"
                    label="Tenant First Name"
                    rules={[{ required: true, message: "Please enter the tenant's first name" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="tenantLastName"
                    label="Tenant Last Name"
                    rules={[{ required: true, message: "Please enter the tenant's last name" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="tenantPhoneNumber"
                    label="Tenant Phone Number"
                    rules={[{ required: true, message: "Please enter the tenant's phone number" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="startDate"
                    label="Start Date"
                    rules={[{ required: true, message: "Please enter the lease start date" }]}
                >
                    <Input type="date"/>
                </Form.Item>

                <Form.Item
                    name="endDate"
                    label="End Date"
                    rules={[{ required: true, message: "Please enter the lease end date" }]}
                >
                    <Input type="date" />
                </Form.Item>

                <Form.Item
                    name="rentAmount"
                    label="Rent Amount"
                    rules={[{ required: true, message: "Please enter the rent amount" }]}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="currency"
                    label="Currency"
                    rules={[{ required: true, message: "Please enter the currency" }]}
                >
                    <Select
                    options={[
                        { value: "TZS", label: "TZS" },
                        // { value: "USD", label: "USD" },
                        // { value: "EUR", label: "EUR" },
                        // Add more currencies as needed
                    ]}
                    />
                </Form.Item>

                <Form.Item
                    name="rentFrequency"
                    label="Rent Frequency"
                    rules={[{ required: true, message: "Please select the rent period" }]}
                >
                    <Select
                    options={[
                        { value: "DAILY", label: "Daily" },
                        { value: "WEEKLY", label: "Weekly" },
                        { value: "MONTHLY", label: "Monthly" },
                        { value: "YEARLY", label: "Yearly" },
                    ]}
                    />
                </Form.Item>

                <Form.Item
                    name="fullLeasePaymentRequired"
                    label="Do you need full payment"
                    initialValue={false}
                    rules={[{ required: true, message: "Please select whether full payment is required" }]}
                >
                    <Radio.Group buttonStyle="solid">
                        <Radio.Button value={true}>Yes</Radio.Button>
                        <Radio.Button value={false}>No</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Create Lease <RightOutlined />
                    </Button>
                </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
}