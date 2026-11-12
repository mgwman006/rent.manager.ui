import { CalendarOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Form, Input, Modal, Row } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";
import { Dispatch, SetStateAction, useState } from "react";
import { LeaseDetailsDTO, LeaseStatus, UpdateLeaseDatesDTO } from "../../models/lease";
import { updateLeaseDates } from "../../services/leaseService";

interface LeaseDatesViewProps {
    leaseDetails: LeaseDetailsDTO;
    setLeaseDetails: Dispatch<SetStateAction<LeaseDetailsDTO | null>>;
    token: string;
    notificationApi: NotificationInstance;
}

const formatDate = (date: string) => {
    const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);
    return Number.isNaN(parsedDate.getTime())
        ? date
        : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(parsedDate);
};

export default function LeaseDatesView({
    leaseDetails,
    setLeaseDetails,
    token,
    notificationApi,
}: LeaseDatesViewProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<UpdateLeaseDatesDTO>();
    const canEdit = leaseDetails.status !== LeaseStatus.ACTIVE
        && leaseDetails.status !== LeaseStatus.ENDED;

    const openEditor = () => {
        form.setFieldsValue({
            startDate: leaseDetails.startDate?.slice(0, 10) ?? "",
            endDate: leaseDetails.endDate?.slice(0, 10) ?? "",
        });
        setEditOpen(true);
    };

    const handleSubmit = async (values: UpdateLeaseDatesDTO) => {
        if (!token) {
            notificationApi.error({
                message: "Authentication Required",
                description: "Please sign in again to edit this lease.",
            });
            return;
        }

        setSaving(true);
        try {
            const updatedLease = await updateLeaseDates(
                leaseDetails.id,
                values,
                token,
                notificationApi,
            );
            if (!updatedLease) return;

            setLeaseDetails((currentLease) => currentLease
                ? { ...currentLease, ...updatedLease }
                : updatedLease);
            notificationApi.success({ message: "Lease dates updated" });
            setEditOpen(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Card
                title="Lease dates"
                extra={
                    <Button icon={<EditOutlined />} disabled={!canEdit} onClick={openEditor}>
                        Edit dates
                    </Button>
                }
            >
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                    <Descriptions.Item label="Starts">{formatDate(leaseDetails.startDate)}</Descriptions.Item>
                    <Descriptions.Item label="Ends">{formatDate(leaseDetails.endDate)}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Modal
                title={<><CalendarOutlined /> Edit lease dates</>}
                open={editOpen}
                onCancel={() => setEditOpen(false)}
                footer={null}
                destroyOnHidden
                width={560}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="startDate" label="Start date" rules={[{ required: true }]}>
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="endDate"
                                label="End date"
                                dependencies={["startDate"]}
                                rules={[
                                    { required: true },
                                    ({ getFieldValue }) => ({
                                        validator(_, value: string) {
                                            if (!value || !getFieldValue("startDate") || value > getFieldValue("startDate")) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("End date must be after the start date."));
                                        },
                                    }),
                                ]}
                            >
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" htmlType="submit" loading={saving} block>
                        Save dates
                    </Button>
                </Form>
            </Modal>
        </>
    );
}
