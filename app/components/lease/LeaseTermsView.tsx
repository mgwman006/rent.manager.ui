import { EditOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Card, Form, Modal, Typography } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";
import { Dispatch, SetStateAction, useState } from "react";
import { LeaseDetailsDTO, LeaseStatus, LeaseTermsUpdateDTO } from "../../models/lease";
import { updateLeaseTerms } from "../../services/leaseService";
import RichTextEditor, { sanitizeRichText } from "./RichTextEditor";

const { Text } = Typography;

interface LeaseTermsViewProps {
    leaseDetails: LeaseDetailsDTO;
    setLeaseDetails: Dispatch<SetStateAction<LeaseDetailsDTO | null>>;
    token: string;
    notificationApi: NotificationInstance;
}

export default function LeaseTermsView({
    leaseDetails,
    setLeaseDetails,
    token,
    notificationApi,
}: LeaseTermsViewProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm<LeaseTermsUpdateDTO>();
    const canEdit = leaseDetails.status !== LeaseStatus.ACTIVE
        && leaseDetails.status !== LeaseStatus.ENDED;

    const openEditor = () => {
        form.setFieldsValue({ leaseTerms: leaseDetails.leaseTerms ?? "" });
        setEditOpen(true);
    };

    const handleSubmit = async (values: LeaseTermsUpdateDTO) => {
        if (!token) {
            notificationApi.error({
                message: "Authentication Required",
                description: "Please sign in again to edit this lease.",
            });
            return;
        }

        const request: LeaseTermsUpdateDTO = {
            leaseTerms: sanitizeRichText(values.leaseTerms),
        };
        setSaving(true);
        try {
            const updatedLease = await updateLeaseTerms(
                leaseDetails.id,
                request,
                token,
                notificationApi,
            );
            if (!updatedLease) return;

            setLeaseDetails((currentLease) => currentLease
                ? {
                    ...currentLease,
                    ...updatedLease,
                    leaseTerms: updatedLease.leaseTerms ?? request.leaseTerms,
                }
                : updatedLease);
            notificationApi.success({ message: "Terms and conditions updated" });
            setEditOpen(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Card
                title="Terms and conditions"
                extra={
                    <Button icon={<EditOutlined />} disabled={!canEdit} onClick={openEditor}>
                        Edit terms
                    </Button>
                }
            >
                {leaseDetails.leaseTerms?.trim() ? (
                    <div
                        style={{ overflowWrap: "anywhere" }}
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(leaseDetails.leaseTerms) }}
                    />
                ) : (
                    <Text type="secondary">No terms and conditions have been added.</Text>
                )}
            </Card>

            <Modal
                title={<><FileTextOutlined /> Edit terms and conditions</>}
                open={editOpen}
                onCancel={() => setEditOpen(false)}
                footer={null}
                destroyOnHidden
                width={720}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
                    <Form.Item
                        name="leaseTerms"
                        label="Lease terms"
                        rules={[{ required: true, message: "Enter the lease terms and conditions." }]}
                    >
                        <RichTextEditor />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={saving} block>
                        Save terms
                    </Button>
                </Form>
            </Modal>
        </>
    );
}
