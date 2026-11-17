import { useEffect, useState } from "react";
import { Button, Card, Col, Empty, Flex, List, notification, Row, Spin, Tag, Typography } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { LeaseDetailsDTO, LeaseStatus } from "../../models/lease";
import { getLeasesByRentalProfileAndStatus } from "../../services/leaseService";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const statusColors: Record<LeaseStatus, string> = {
    [LeaseStatus.ACTIVE]: "success",
    [LeaseStatus.ENDED]: "default",
    [LeaseStatus.TERMINATED]: "error",
    [LeaseStatus.PENDING]: "gold",
    [LeaseStatus.PENDING_LANDLORD_APPROVAL]: "gold",
    [LeaseStatus.PENDING_TENANT_APPROVAL]: "gold",
};

const formatDate = (date: string) => {
    const parsedDate = new Date(`${date.slice(0, 10)}T12:00:00`);
    return Number.isNaN(parsedDate.getTime())
        ? date
        : new Intl.DateTimeFormat("en-TZ", { dateStyle: "medium" }).format(parsedDate);
};

const formatRent = (lease: LeaseDetailsDTO) => {
    const rent = lease.rent;
    if (!rent || typeof rent.amount !== "number") {
        return "Rent details unavailable";
    }

    const currency = rent.currency || "TZS";
    const frequency = rent.frequency
        ? ` / ${rent.frequency.replaceAll("_", " ").toLowerCase()}`
        : "";
    return `${currency} ${new Intl.NumberFormat("en-TZ").format(rent.amount)}${frequency}`;
};

interface LeasesByStatusProps {
    rentalProfileId: number;
    status: LeaseStatus;
    token: string;
}

export default function LeasesByStatus({ rentalProfileId, status, token }: LeasesByStatusProps) {
    const navigate = useNavigate();
    const [leases, setLeases] = useState<LeaseDetailsDTO[]>([]);
    const [leasesLoading, setLeasesLoading] = useState(true);
    const [notificationApi, contextHolder] = notification.useNotification();
    const [displayCount, setDisplayCount] = useState(5);

    useEffect(() => {
        let cancelled = false;
        if (!rentalProfileId || !token) {
            setLeases([]);
            setLeasesLoading(false);
            return () => {
                cancelled = true;
            };
        }

        setLeasesLoading(true);
        setDisplayCount(5);
        getLeasesByRentalProfileAndStatus(rentalProfileId, status, token, notificationApi)
            .then((loadedLeases) => {
                if (!cancelled) setLeases(loadedLeases);
            })
            .finally(() => {
                if (!cancelled) setLeasesLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [notificationApi, rentalProfileId, status, token]);

    if (leasesLoading) {
        return (
            <div style={{ minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {contextHolder}
                <Spin size="large" tip="Loading leases..." />
            </div>
        );
    }

    return (
        <div>
            {contextHolder}
            {leases.length === 0 ? (
                <div style={{ padding: "24px 0", textAlign: "center" }}>
                    <Empty description="No leases found." />
                </div>
            ) : (
                <List
                    dataSource={leases.slice(0, displayCount)}
                    rowKey="id"
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                    renderItem={(lease) => (
                        <List.Item style={{ height: "100%" }}>
                            <Card
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 12,
                                    borderColor: "#e6ebf2",
                                }}
                                styles={{ body: { padding: 18 } }}
                            >
                                <Flex justify="space-between" align="center" gap={12} wrap>
                                    <Title level={5} style={{ margin: 0, overflowWrap: "anywhere" }}>
                                        Lease {lease.referenceNumber ? `#${lease.referenceNumber}` : `#${lease.id}`}
                                    </Title>
                                    <Tag color={statusColors[lease.status]}>
                                        {lease.status.replaceAll("_", " ")}
                                    </Tag>
                                </Flex>

                                <Text strong style={{ display: "block", marginTop: 16 }}>
                                    {lease.tenant?.firstName && lease.tenant?.lastName
                                        ? `${lease.tenant.firstName} ${lease.tenant.lastName}`
                                        : "No Tenant Assigned"}
                                </Text>

                                <Row gutter={[16, 12]} style={{ marginTop: 12 }}>
                                    <Col xs={24} sm={12}>
                                        <Text type="secondary">Start date</Text>
                                        <Text strong style={{ display: "block", marginTop: 4 }}>
                                            {formatDate(lease.startDate)}
                                        </Text>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Text type="secondary">End date</Text>
                                        <Text strong style={{ display: "block", marginTop: 4 }}>
                                            {formatDate(lease.endDate)}
                                        </Text>
                                    </Col>
                                    <Col span={24}>
                                        <Text type="secondary">Rent</Text>
                                        <Text strong style={{ display: "block", marginTop: 4, overflowWrap: "anywhere" }}>
                                            {formatRent(lease)}
                                        </Text>
                                    </Col>
                                </Row>

                                <Button
                                    icon={<FileTextOutlined />}
                                    onClick={() => navigate(`${lease.id}`)}
                                    style={{ marginTop: 18 }}
                                >
                                    Lease details
                                </Button>
                            </Card>
                        </List.Item>
                    )}
                />
            )}
            {displayCount < leases.length && (
                <div style={{ textAlign: "center", marginTop: 12 }}>
                    <Button onClick={() => setDisplayCount((count) => count + 5)}>Load more</Button>
                </div>
            )}
        </div>
    );
}
