import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Result, Spin, Tabs, TabsProps, Tag, Typography, notification } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { leaseApi } from "../../api/api";
import { LeaseDetailsDTO, LeaseStatus } from "../../models/lease";
import { useAccount } from "../../store/account/AccountContext";
import LeaseUnitView from "./LeaseUnitView";
import LeaseTermView from "./LeaseTermView";
import RentCollectionSummaryView from "./RentCollectionSummaryView";
import TenantView from "./TenantView";

const statusColor: Record<LeaseStatus, string> = {
    [LeaseStatus.ACTIVE]: "green",
    [LeaseStatus.ENDED]: "default",
    [LeaseStatus.TERMINATED]: "red",
    [LeaseStatus.PENDING]: "gold",
    [LeaseStatus.PENDING_LANDLORD_APPROVAL]: "processing",
    [LeaseStatus.PENDING_TENANT_APPROVAL]: "processing",
};

export default function LeaseDetails() {
    const { leaseIdParam } = useParams();
    const leaseId = Number(leaseIdParam);
    const [notificationApi, contextHolder] = notification.useNotification();
    const [leaseDetails, setLeaseDetails] = useState<LeaseDetailsDTO | null>(null);
    const [leaseLoading, setLeaseLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const { accountState } = useAccount();
    const navigate = useNavigate();
    const token = accountState.accountDetails?.token ?? "";

    useEffect(() => {
        if (!Number.isSafeInteger(leaseId) || leaseId <= 0) {
            setLeaseLoading(false);
            setLoadError("The lease ID is invalid.");
            return;
        }

        if (!token) {
            setLeaseLoading(false);
            setLoadError("Sign in again to view this lease.");
            return;
        }

        let cancelled = false;
        setLeaseLoading(true);
        setLoadError(null);
        leaseApi.getLeaseById(leaseId, token)
            .then((data) => {
                if (!cancelled) setLeaseDetails(data);
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                const message = error instanceof Error ? error.message : "Unable to fetch lease details.";
                setLoadError(message);
                notificationApi.error({
                    message: "Failed to load lease",
                    description: message,
                });
            })
            .finally(() => {
                if (!cancelled) setLeaseLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [leaseId, notificationApi, token]);

    const tabItems: TabsProps["items"] = [
        {
            key: "tenant",
            label: "Tenant",
            children: TenantView(
                leaseId,
                leaseDetails?.tenant ?? null,
                leaseDetails?.invitations ?? [],
                token,
                notificationApi,
            ),
        },
        {
            key: "unit",
            label: "Unit",
            children: leaseDetails ? (
                <LeaseUnitView
                    leaseDetails={leaseDetails}
                    token={token}
                    notificationApi={notificationApi}
                />
            ) : null,
        },
        {
            key: "dates",
            label: "Dates",
            children: leaseDetails ? (
                <LeaseTermView
                    section="dates"
                    leaseDetails={leaseDetails}
                    setLeaseDetails={setLeaseDetails}
                    token={token}
                    notificationApi={notificationApi}
                />
            ) : null,
        },
        {
            key: "rent",
            label: "Rent",
            children: leaseDetails ? (
                <LeaseTermView
                    section="rent"
                    leaseDetails={leaseDetails}
                    setLeaseDetails={setLeaseDetails}
                    token={token}
                    notificationApi={notificationApi}
                />
            ) : null,
        },
        {
            key: "lease-terms",
            label: "Terms and conditions",
            children: leaseDetails ? (
                <LeaseTermView
                    section="terms"
                    leaseDetails={leaseDetails}
                    setLeaseDetails={setLeaseDetails}
                    token={token}
                    notificationApi={notificationApi}
                />
            ) : null,
        },
        {
            key: "payment",
            label: "Payment",
            children: (
                <RentCollectionSummaryView
                    leaseId={leaseDetails?.id}
                    leaseStatus={leaseDetails?.status ?? LeaseStatus.PENDING}
                    token={token}
                    notificationApi={notificationApi}
                />
            ),
        },
    ];

    return (
        <div style={{ width: "100%", minWidth: 0 }}>
            {contextHolder}
            <Flex vertical gap="middle">
                <Button
                    icon={<ArrowLeftOutlined />}
                    type="text"
                    onClick={() => navigate(-1)}
                    style={{ alignSelf: "flex-start" }}
                >
                    Back
                </Button>

                {leaseLoading ? (
                    <Flex justify="center" style={{ padding: 48 }}>
                        <Spin size="large" />
                    </Flex>
                ) : loadError || !leaseDetails ? (
                    <Result
                        status="warning"
                        title="Lease details unavailable"
                        subTitle={loadError ?? "The lease could not be found."}
                    />
                ) : (
                    <>
                        <Card size="small">
                            <Flex justify="space-between" align="center" gap="middle" wrap="wrap">
                                <div>
                                    <Typography.Title level={3} style={{ margin: 0 }}>
                                        Lease details
                                    </Typography.Title>
                                    <Typography.Text type="secondary">
                                        Reference {leaseDetails.referenceNumber || `#${leaseDetails.id}`}
                                    </Typography.Text>
                                </div>
                                <Tag color={statusColor[leaseDetails.status]}>
                                    {leaseDetails.status.replaceAll("_", " ")}
                                </Tag>
                            </Flex>
                        </Card>

                        <Card styles={{ body: { padding: "8px 16px" } }}>
                            <Tabs
                                defaultActiveKey="tenant"
                                items={tabItems}
                                size="large"
                                tabBarGutter={24}
                                destroyOnHidden
                            />
                        </Card>
                    </>
                )}
            </Flex>
        </div>
    );
}
