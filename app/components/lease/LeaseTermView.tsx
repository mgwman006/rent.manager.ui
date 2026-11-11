import { CalendarOutlined, DollarOutlined, EditOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Flex, Form, Input, InputNumber, Modal, Radio, Row, Tag, Typography } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";
import { Dispatch, SetStateAction, useState } from "react";
import {
    LeaseDetailsDTO,
    LeaseStatus,
    LeaseTermsUpdateDTO,
    RentCreateDTO,
    RentFrequency,
    UpdateLeaseDatesDTO,
    UpdateLeaseRentDTO,
} from "../../models/lease";
import { updateLeaseDates, updateLeaseRent, updateLeaseTerms } from "../../services/leaseService";
import RichTextEditor, { sanitizeRichText } from "./RichTextEditor";

const { Text } = Typography;

interface LeaseTermViewProps {
    section: "dates" | "rent" | "terms";
    leaseDetails: LeaseDetailsDTO;
    setLeaseDetails: Dispatch<SetStateAction<LeaseDetailsDTO | null>>;
    token: string;
    notificationApi: NotificationInstance;
}

interface LeaseDatesForm {
    startDate: string;
    endDate: string;
}

interface LeaseRentForm {
    rent: RentCreateDTO;
    fullLeasePaymentRequired: boolean;
}

const formatDate = (date: string) => {
    const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);
    return Number.isNaN(parsedDate.getTime())
        ? date
        : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(parsedDate);
};

const formatRent = (lease: LeaseDetailsDTO) =>
    new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: lease.rent?.currency ?? "TZS",
        maximumFractionDigits: 2,
    }).format(lease.rent?.amount ?? 0);

export default function LeaseTermView({
    section,
    leaseDetails,
    setLeaseDetails,
    token,
    notificationApi,
}: LeaseTermViewProps) {
    const [datesModalOpen, setDatesModalOpen] = useState(false);
    const [rentModalOpen, setRentModalOpen] = useState(false);
    const [termsModalOpen, setTermsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [datesForm] = Form.useForm<LeaseDatesForm>();
    const [rentForm] = Form.useForm<LeaseRentForm>();
    const [termsForm] = Form.useForm<{ leaseTerms?: string }>();
    const canEdit = leaseDetails.status !== LeaseStatus.ACTIVE
        && leaseDetails.status !== LeaseStatus.ENDED;

    const openDatesModal = () => {
        datesForm.setFieldsValue({
            startDate: leaseDetails.startDate?.slice(0, 10) ?? "",
            endDate: leaseDetails.endDate?.slice(0, 10) ?? "",
        });
        setDatesModalOpen(true);
    };

    const openRentModal = () => {
        rentForm.setFieldsValue({
            rent: {
                amount: leaseDetails.rent?.amount ?? 0,
                currency: leaseDetails.rent?.currency ?? "TZS",
                frequency: (leaseDetails.rent?.frequency as RentFrequency) ?? RentFrequency.MONTHLY,
            },
            fullLeasePaymentRequired: leaseDetails.fullLeasePaymentRequired ?? false,
        });
        setRentModalOpen(true);
    };

    const openTermsModal = () => {
        termsForm.setFieldsValue({ leaseTerms: leaseDetails.leaseTerms ?? "" });
        setTermsModalOpen(true);
    };

    const saveLeaseChanges = async (
        updateRequest: () => Promise<LeaseDetailsDTO | null>,
        section: "dates" | "rent" | "terms",
    ) => {
        if (!token) {
            notificationApi.error({
                message: "Authentication Required",
                description: "Please sign in again to edit this lease.",
            });
            return;
        }

        setSaving(true);
        try {
            const updatedLease = await updateRequest();
            if (!updatedLease) return;

            setLeaseDetails((currentLease) => currentLease
                ? {
                    ...currentLease,
                    ...updatedLease,
                    leaseTerms: updatedLease.leaseTerms ?? currentLease.leaseTerms,
                }
                : updatedLease);
            notificationApi.success({
                message: section === "terms"
                    ? "Terms and conditions updated"
                    : section === "rent"
                        ? "Rent details updated"
                        : "Lease dates updated",
            });
            setDatesModalOpen(false);
            setRentModalOpen(false);
            setTermsModalOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDatesSubmit = (values: LeaseDatesForm) => {
        const request: UpdateLeaseDatesDTO = values;
        return saveLeaseChanges(
            () => updateLeaseDates(leaseDetails.id, request, token, notificationApi),
            "dates",
        );
    };

    const handleRentSubmit = (values: LeaseRentForm) => {
        const request: UpdateLeaseRentDTO = {
            rent: values.rent,
            fullLeasePaymentRequired: values.fullLeasePaymentRequired,
        };
        return saveLeaseChanges(
            () => updateLeaseRent(leaseDetails.id, request, token, notificationApi),
            "rent",
        );
    };

    const handleTermsSubmit = (values: { leaseTerms?: string }) => {
        const request: LeaseTermsUpdateDTO = {
            leaseTerms: sanitizeRichText(values.leaseTerms ?? ""),
        };
        return saveLeaseChanges(
            () => updateLeaseTerms(leaseDetails.id, request, token, notificationApi),
            "terms",
        );
    };

    const tabs = [
        {
            key: "dates",
            label: <Flex align="center" gap="small"><CalendarOutlined /> Dates</Flex>,
            children: (
                <Card
                    title="Lease dates"
                    extra={
                        <Button icon={<EditOutlined />} disabled={!canEdit} onClick={openDatesModal}>
                            Edit dates
                        </Button>
                    }
                >
                    <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                        <Descriptions.Item label="Starts">{formatDate(leaseDetails.startDate)}</Descriptions.Item>
                        <Descriptions.Item label="Ends">{formatDate(leaseDetails.endDate)}</Descriptions.Item>
                    </Descriptions>
                </Card>
            ),
        },
        {
            key: "rent",
            label: <Flex align="center" gap="small"><DollarOutlined /> Rent</Flex>,
            children: (
                <Card
                    title="Rent and payment"
                    extra={
                        <Button icon={<EditOutlined />} disabled={!canEdit} onClick={openRentModal}>
                            Edit rent
                        </Button>
                    }
                >
                    <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                        <Descriptions.Item label="Rent">
                            <Text strong>{formatRent(leaseDetails)}</Text>
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
            ),
        },
        {
            key: "terms",
            label: <Flex align="center" gap="small"><FileTextOutlined /> Terms and conditions</Flex>,
            children: (
                <Card
                    title="Terms and conditions"
                    extra={
                        <Button icon={<EditOutlined />} disabled={!canEdit} onClick={openTermsModal}>
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
            ),
        },
    ];
    const activeSection = tabs.find((tab) => tab.key === section)?.children;

    return (
        <>
            {activeSection}

            <Modal
                title="Edit lease dates"
                open={datesModalOpen}
                onCancel={() => setDatesModalOpen(false)}
                footer={null}
                destroyOnHidden
                width={560}
            >
                <Form form={datesForm} layout="vertical" onFinish={handleDatesSubmit} requiredMark="optional">
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

            <Modal
                title="Edit rent and payment"
                open={rentModalOpen}
                onCancel={() => setRentModalOpen(false)}
                footer={null}
                destroyOnHidden
                width={560}
            >
                <Form form={rentForm} layout="vertical" onFinish={handleRentSubmit} requiredMark="optional">
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

            <Modal
                title="Edit terms and conditions"
                open={termsModalOpen}
                onCancel={() => setTermsModalOpen(false)}
                footer={null}
                destroyOnHidden
                width={720}
            >
                <Form form={termsForm} layout="vertical" onFinish={handleTermsSubmit} requiredMark="optional">
                    <Form.Item name="leaseTerms" label="Lease terms">
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
