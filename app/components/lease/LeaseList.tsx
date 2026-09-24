import { Button, Card, Col, Drawer, Form, Input, InputNumber, notification, Radio, Row, Select, Spin, Tabs, TabsProps, Tag, Typography } from "antd";
import { PlusOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons";
import { LeaseCreateDTO, LeaseDetailsDTO, LeaseStatus } from "../../models/lease";
import { useEffect, useState } from "react";
import { useAccount } from "../../store/account/AccountContext";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import LeasesByStatus from "./LeasesByStatus";
import { createLease } from "../../services/leaseService";





export default function LeaseList(){
    const [leaseForm] = Form.useForm<LeaseCreateDTO>();
    const [leasesLoading, setLeasesLoading] = useState(false);
    const [createLeaseModalVisible, setCreateLeaseModalVisible] = useState(false);
    const [notificationApi, contextHolder] = notification.useNotification();
    const { accountState } = useAccount();
    const { rentalProfileState } = useRentalProfile();
    const token = accountState.accountDetails?.token ?? "";
    const navigate = useNavigate();


    const leaseTabItems: TabsProps['items'] = [
        {
            key: '1',
            label: 'Active',
            children: LeasesByStatus(
                rentalProfileState?.rentalProfile?.id ?? 0,
                LeaseStatus.ACTIVE,
                token,
            ),
        },
        {
            key: '2',
            label: 'Pending Tenant',
            children: LeasesByStatus(
                rentalProfileState?.rentalProfile?.id ?? 0,
                LeaseStatus.PENDING_TENANT_APPROVAL,
                token,
            ),
        },
        {
            key: '3',
            label: 'Pending Landlord',
            children: LeasesByStatus(
                rentalProfileState?.rentalProfile?.id ?? 0,
                LeaseStatus.PENDING_LANDLORD_APPROVAL,
                token,
            ),
        },
        {
            disabled:true,
            key: '4',
            label: 'Expired',
            children: LeasesByStatus(
                rentalProfileState?.rentalProfile?.id ?? 0,
                LeaseStatus.EXPIRED,
                token,
            ),
        }
    ];

    

    const handleCreateLease = async (values: LeaseCreateDTO) => {
        const rentalProfileId = rentalProfileState.rentalProfile?.id;
        if (!token || !rentalProfileId) {
            notificationApi.error({
                message: "Authentication Required",
                description: "Please sign in again to create a lease.",
            });
            navigate("/");
            return null;
        }

        const response = await createLease(
            values,
            rentalProfileId,
            token,
            notificationApi,
        );

        if (response) {
            setCreateLeaseModalVisible(false);
            leaseForm.resetFields();
            notificationApi.success({
                message: "Lease Created",
                description: "The lease has been successfully created.",
            });
        }
    };

   

    return (
        <div>
            {contextHolder}
            <Card 
                title="Leases"
                extra={<Button type="primary" onClick={() => setCreateLeaseModalVisible(true)}><PlusOutlined /> Create Lease</Button>}
            >

                <Tabs defaultActiveKey="1" items={leaseTabItems} />
                
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
                onFinish={handleCreateLease}
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
                    name={["rent", "id"]}
                    initialValue={null}
                    hidden
                >
                    <InputNumber />
                </Form.Item>

                <Form.Item
                    name={["rent", "amount"]}
                    label="Rent Amount"
                    rules={[{ required: true, message: "Please enter the rent amount" }]}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name={["rent", "currency"]}
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
                    name={["rent", "frequency"]}
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