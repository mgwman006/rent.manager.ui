import { CalendarOutlined, ReloadOutlined } from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Descriptions,
    Flex,
    Form,
    Input,
    Modal,
    Popconfirm,
    Result,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    notification,
} from "antd";
import type { TableProps } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "../../store/account/AccountContext";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import {
    RecordViewingOutcomeDTO,
    ViewingBookingDetailsDTO,
    ViewingBookingStatus,
    ViewingOutcomeType,
    ViewingPaymentStatus,
} from "../../models/viewing";
import {
    approveViewingBooking,
    cancelViewingBooking,
    getViewingBookings,
    recordViewingOutcome,
    rejectViewingBooking,
} from "../../services/viewingService";

const { Title, Text } = Typography;

const statusColors: Record<ViewingBookingStatus, string> = {
    [ViewingBookingStatus.DRAFT]: "default",
    [ViewingBookingStatus.PENDING]: "gold",
    [ViewingBookingStatus.CONFIRMED]: "blue",
    [ViewingBookingStatus.REJECTED]: "red",
    [ViewingBookingStatus.CANCELLED]: "default",
    [ViewingBookingStatus.CLOSED]: "green",
    [ViewingBookingStatus.EXPIRED]: "default",
    [ViewingBookingStatus.RESCHEDULED]: "purple",
};

const paymentColors: Record<ViewingPaymentStatus, string> = {
    [ViewingPaymentStatus.NOT_REQUIRED]: "default",
    [ViewingPaymentStatus.AWAITING_PAYMENT]: "gold",
    [ViewingPaymentStatus.PAID]: "green",
    [ViewingPaymentStatus.FAILED]: "red",
    [ViewingPaymentStatus.REFUNDED]: "purple",
};

const formatDateTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
};

const formatEnum = (value: string) => value.replaceAll("_", " ").toLowerCase();

export default function ViewingsDashboard() {
    const [notificationApi, contextHolder] = notification.useNotification();
    const { accountState } = useAccount();
    const { rentalProfileState } = useRentalProfile();
    const token = accountState.accountDetails?.token ?? "";
    const rentalProfileId = rentalProfileState.rentalProfile?.id;
    const [bookings, setBookings] = useState<ViewingBookingDetailsDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const [statusFilter, setStatusFilter] = useState<ViewingBookingStatus | "ALL">("ALL");
    const [updatingBookingIds, setUpdatingBookingIds] = useState<Set<number>>(new Set());
    const [outcomeBooking, setOutcomeBooking] = useState<ViewingBookingDetailsDTO | null>(null);
    const [outcomeForm] = Form.useForm<RecordViewingOutcomeDTO>();
    const [savingOutcome, setSavingOutcome] = useState(false);

    const loadBookings = useCallback(async () => {
        if (!rentalProfileId || !token) {
            setBookings([]);
            setLoadFailed(false);
            return;
        }

        setLoading(true);
        const result = await getViewingBookings(rentalProfileId, token, notificationApi);
        setBookings(result ?? []);
        setLoadFailed(result === null);
        setLoading(false);
    }, [notificationApi, rentalProfileId, token]);

    useEffect(() => {
        let cancelled = false;
        if (!rentalProfileId || !token) {
            setBookings([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        getViewingBookings(rentalProfileId, token, notificationApi)
            .then((result) => {
                if (!cancelled) {
                    setBookings(result ?? []);
                    setLoadFailed(result === null);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [notificationApi, rentalProfileId, token]);

    const updateBooking = async (
        booking: ViewingBookingDetailsDTO,
        action: "approve" | "reject" | "cancel",
    ) => {
        setUpdatingBookingIds((current) => new Set(current).add(booking.id));
        try {
            const updated = action === "approve"
                ? await approveViewingBooking(booking.id, token, notificationApi)
                : action === "reject"
                    ? await rejectViewingBooking(booking.id, token, notificationApi)
                    : await cancelViewingBooking(booking.id, token, notificationApi);

            if (!updated) return;
            setBookings((current) => current.map((item) => item.id === updated.id ? updated : item));
            notificationApi.success({
                message: `Viewing booking ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "cancelled"}`,
            });
        } finally {
            setUpdatingBookingIds((current) => {
                const next = new Set(current);
                next.delete(booking.id);
                return next;
            });
        }
    };

    const openOutcomeModal = (booking: ViewingBookingDetailsDTO) => {
        outcomeForm.resetFields();
        setOutcomeBooking(booking);
    };

    const saveOutcome = async (values: RecordViewingOutcomeDTO) => {
        if (!outcomeBooking) return;
        setSavingOutcome(true);
        try {
            const updated = await recordViewingOutcome(
                outcomeBooking.id,
                values,
                token,
                notificationApi,
            );
            if (!updated) return;
            setBookings((current) => current.map((item) => item.id === updated.id ? updated : item));
            setOutcomeBooking(null);
            notificationApi.success({ message: "Viewing outcome recorded" });
        } finally {
            setSavingOutcome(false);
        }
    };

    const filteredBookings = useMemo(
        () => statusFilter === "ALL"
            ? bookings
            : bookings.filter((booking) => booking.status === statusFilter),
        [bookings, statusFilter],
    );

    const columns: TableProps<ViewingBookingDetailsDTO>["columns"] = [
        {
            title: "Viewing",
            key: "viewing",
            render: (_, booking) => (
                <Flex vertical>
                    <Text strong>{formatDateTime(booking.startTime)}</Text>
                    <Text type="secondary">Until {formatDateTime(booking.endTime)}</Text>
                    <Text type="secondary">Reference: {booking.reference}</Text>
                </Flex>
            ),
        },
        {
            title: "Unit",
            dataIndex: "unitId",
            key: "unitId",
            render: (unitId: number) => `Unit #${unitId}`,
            responsive: ["sm"],
        },
        {
            title: "Requester",
            dataIndex: "requesterUserId",
            key: "requesterUserId",
            render: (requesterUserId: number) => `User #${requesterUserId}`,
            responsive: ["md"],
        },
        {
            title: "Fee",
            dataIndex: "serviceFee",
            key: "serviceFee",
            render: (fee: number) => new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "TZS",
            }).format(fee),
            responsive: ["md"],
        },
        {
            title: "Payment",
            dataIndex: "paymentStatus",
            key: "paymentStatus",
            render: (status: ViewingPaymentStatus) => (
                <Tag color={paymentColors[status]}>{formatEnum(status)}</Tag>
            ),
            responsive: ["sm"],
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: ViewingBookingStatus) => (
                <Tag color={statusColors[status]}>{formatEnum(status)}</Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, booking) => {
                const updating = updatingBookingIds.has(booking.id);
                if (booking.status === ViewingBookingStatus.PENDING) {
                    return (
                        <Space wrap>
                            <Popconfirm
                                title="Approve this viewing?"
                                onConfirm={() => updateBooking(booking, "approve")}
                            >
                                <Button
                                    type="primary"
                                    size="small"
                                    loading={updating}
                                    disabled={booking.paymentStatus !== ViewingPaymentStatus.PAID}
                                    title={booking.paymentStatus !== ViewingPaymentStatus.PAID
                                        ? "Payment must be completed before approval."
                                        : undefined}
                                >
                                    Approve
                                </Button>
                            </Popconfirm>
                            <Popconfirm
                                title="Reject this viewing?"
                                onConfirm={() => updateBooking(booking, "reject")}
                            >
                                <Button danger size="small" loading={updating}>Reject</Button>
                            </Popconfirm>
                        </Space>
                    );
                }

                if (booking.status === ViewingBookingStatus.CONFIRMED) {
                    return (
                        <Space wrap>
                            <Button size="small" onClick={() => openOutcomeModal(booking)} disabled={updating}>
                                Record outcome
                            </Button>
                            <Popconfirm
                                title="Cancel this confirmed viewing?"
                                onConfirm={() => updateBooking(booking, "cancel")}
                            >
                                <Button danger size="small" loading={updating}>Cancel</Button>
                            </Popconfirm>
                        </Space>
                    );
                }

                return booking.outcome
                    ? <Text type="secondary">{formatEnum(booking.outcome.type)}</Text>
                    : <Text type="secondary">—</Text>;
            },
        },
    ];

    const outcomeOptions = Object.values(ViewingOutcomeType).map((outcome) => ({
        value: outcome,
        label: formatEnum(outcome),
    }));

    return (
        <div>
            {contextHolder}
            <Flex vertical gap="middle">
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Viewing bookings</Title>
                        <Text type="secondary">
                            {rentalProfileState.rentalProfile?.name ?? "Selected rental profile"}
                        </Text>
                    </div>
                    <Button
                        icon={<ReloadOutlined />}
                        disabled={!rentalProfileId || loading}
                        onClick={loadBookings}
                    >
                        Refresh
                    </Button>
                </Flex>

                {!rentalProfileId ? (
                    <Alert
                        type="warning"
                        showIcon
                        title="No rental profile selected"
                        description="Select a rental profile to view its viewing bookings."
                    />
                ) : loadFailed && !loading ? (
                    <Result
                        status="warning"
                        title="Bookings could not be loaded"
                        extra={<Button onClick={loadBookings}>Try again</Button>}
                    />
                ) : (
                    <Card>
                        <Flex justify="space-between" align="center" wrap="wrap" gap="middle" style={{ marginBottom: 16 }}>
                            <Text>{filteredBookings.length} bookings</Text>
                            <Select
                                aria-label="Filter bookings by status"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: 220 }}
                                options={[
                                    { value: "ALL", label: "All statuses" },
                                    ...Object.values(ViewingBookingStatus).map((status) => ({
                                        value: status,
                                        label: formatEnum(status),
                                    })),
                                ]}
                            />
                        </Flex>
                        <Table<ViewingBookingDetailsDTO>
                            rowKey="id"
                            columns={columns}
                            dataSource={filteredBookings}
                            loading={loading}
                            locale={{ emptyText: "No viewing bookings found." }}
                            expandable={{
                                expandedRowRender: (booking) => (
                                    <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
                                        <Descriptions.Item label="Notes">{booking.notes || "—"}</Descriptions.Item>
                                        <Descriptions.Item label="Payment updated">
                                            {booking.paymentUpdatedAt ? formatDateTime(booking.paymentUpdatedAt) : "—"}
                                        </Descriptions.Item>
                                        {booking.holdExpiresAt && (
                                            <Descriptions.Item label="Hold expires">
                                                {formatDateTime(booking.holdExpiresAt)}
                                            </Descriptions.Item>
                                        )}
                                        {booking.outcome?.notes && (
                                            <Descriptions.Item label="Outcome notes">{booking.outcome.notes}</Descriptions.Item>
                                        )}
                                    </Descriptions>
                                ),
                                rowExpandable: (booking) => Boolean(
                                    booking.notes || booking.paymentUpdatedAt || booking.holdExpiresAt || booking.outcome?.notes,
                                ),
                            }}
                            scroll={{ x: 900 }}
                            pagination={{ pageSize: 10, showSizeChanger: true }}
                        />
                    </Card>
                )}
            </Flex>

            <Modal
                title={<><CalendarOutlined /> Record viewing outcome</>}
                open={Boolean(outcomeBooking)}
                onCancel={() => setOutcomeBooking(null)}
                footer={null}
                destroyOnHidden
            >
                {outcomeBooking && (
                    <Form
                        form={outcomeForm}
                        layout="vertical"
                        onFinish={saveOutcome}
                    >
                        <Form.Item
                            name="outcome"
                            label="Outcome"
                            rules={[{ required: true, message: "Select the viewing outcome." }]}
                        >
                            <Select options={outcomeOptions} />
                        </Form.Item>
                        <Form.Item name="notes" label="Notes">
                            <Input.TextArea rows={4} maxLength={1000} showCount />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={savingOutcome} block>
                            Save outcome
                        </Button>
                    </Form>
                )}
            </Modal>
        </div>
    );
}
