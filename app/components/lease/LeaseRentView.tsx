import { DollarOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Form, Input, InputNumber, Modal, Radio, Tag, Typography } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";
import { Dispatch, SetStateAction, useState } from "react";
import {
    LeaseDetailsDTO,
    LeaseStatus,
    RentFrequency,
    UpdateLeaseRentDTO,
} from "../../models/lease";
import { updateLeaseRent } from "../../services/leaseService";

interface LeaseRentViewProps {
    leaseDetails: LeaseDetailsDTO;
    setLeaseDetails: Dispatch<SetStateAction<LeaseDetailsDTO | null>>;
    token: string;
    notificationApi: NotificationInstance;
}

const formatRent = (lease: LeaseDetailsDTO) =>
    new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: lease.rent?.currency ?? "TZS",
        maximumFractionDigits: 2,
    }).format(lease.rent?.amount ?? 0);

export default function LeaseRentView({
    leaseDetails,
    setLeaseDetails,
    token,
    notificationApi,
}: LeaseRentViewProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<UpdateLeaseRentDTO>();
    const canEdit = leaseDetails.status !== LeaseStatus.ACTIVE
        && leaseDetails.status !== LeaseStatus.ENDED;

    const openEditor = () => {
        form.setFieldsValue({
            rent: {
                id: leaseDetails.rent?.id,
                amount: leaseDetails.rent?.amount ?? 0,
                currency: leaseDetails.rent?.currency ?? "TZS",
                frequency: (leaseDetails.rent?.frequency as RentFrequency) ?? RentFrequency.MONTHLY,
            },
            fullLeasePaymentRequired: leaseDetails.fullLeasePaymentRequired ?? false,
        });
        setEditOpen(true);
    };

    const handleSubmit = async (values: UpdateLeaseRentDTO) => {
        if (!token) {
            notificationApi.error({
                message: "Authentication Required",
                description: "Please sign in again to edit this lease.",
            });
            return;
        }

        setSaving(true);
        try {
            const request: UpdateLeaseRentDTO = {
                ...values,
                rent: {
                    ...values.rent,
                    id: leaseDetails.rent?.id,
                },
            };
            const updatedLease = await updateLeaseRent(
                leaseDetails.id,
                request,
                token,
                notificationApi,
            );
            if (!updatedLease) return;

            setLeaseDetails((currentLease) => currentLease
                ? { ...currentLease, ...updatedLease }
                : updatedLease);
            notificationApi.success({ message: "Rent details updated" });
            setEditOpen(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Card
                title="Rent and payment"
                extra={
                    <Button icon={<EditOutlined />} disabled={!canEdit} onClick={openEditor}>
                        Edit rent
                    </Button>
                }
            >
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                    <Descriptions.Item label="Rent">
                        <Typography.Text strong>{formatRent(leaseDetails)}</Typography.Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment frequency">
                        {leaseDetails.rent?.frequency?.replaceAll("_", " ") ?? "Not specified"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Full lease payment">
                        <Tag color={leaseDetails.fullLeasePaymentRequired ? "blue" : "default"}>
                            {leaseDetails.fullLeasePaymentRequired ? "Required" : "Not required"}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Modal
                title={<><DollarOutlined /> Edit rent and payment</>}
                open={editOpen}
                onCancel={() => setEditOpen(false)}
                footer={null}
                destroyOnHidden
                width={560}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
                    <Form.Item name={["rent", "id"]} hidden><InputNumber /></Form.Item>
                    <Form.Item name={["rent", "currency"]} hidden><Input /></Form.Item>
                    <Form.Item name={["rent", "amount"]} label="Rent amount" rules={[{ required: true }]}>
                        <InputNumber
                            min={0}
                            suffix={leaseDetails.rent?.currency ?? "TZS"}
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <Form.Item name={["rent", "frequency"]} label="Payment frequency" rules={[{ required: true }]}>
                        <Radio.Group optionType="button" buttonStyle="solid">
                            <Radio.Button value={RentFrequency.YEARLY}>Yearly</Radio.Button>
                            <Radio.Button value={RentFrequency.MONTHLY}>Monthly</Radio.Button>
                            <Radio.Button value={RentFrequency.WEEKLY}>Weekly</Radio.Button>
                            <Radio.Button value={RentFrequency.DAILY}>Daily</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        name="fullLeasePaymentRequired"
                        label="Is full lease payment required?"
                        rules={[{ required: true, message: "Choose whether full payment is required." }]}
                    >
                        <Radio.Group optionType="button" buttonStyle="solid">
                            <Radio.Button value={true}>Yes</Radio.Button>
                            <Radio.Button value={false}>No</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={saving} block>
                        Save rent details
                    </Button>
                </Form>
            </Modal>
        </>
    );
}
