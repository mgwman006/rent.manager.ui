import { Alert, Card, Descriptions, Flex, Image, Spin, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { NotificationInstance } from "antd/es/notification/interface";
import { LeaseDetailsDTO } from "../../models/lease";
import { UnitDetailsDTO, UnitStatus } from "../../models/property";
import { getUnitDetails } from "../../services/propertyService";

interface LeaseUnitViewProps {
    leaseDetails: LeaseDetailsDTO;
    token: string;
    notificationApi: NotificationInstance;
}

const formatType = (value?: string) => value?.replaceAll("_", " ") || "-";

export default function LeaseUnitView({
    leaseDetails,
    token,
    notificationApi,
}: LeaseUnitViewProps) {
    const [unit, setUnit] = useState<UnitDetailsDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const unitId = leaseDetails.unitId;

    useEffect(() => {
        if (!unitId || !token) {
            setUnit(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setUnit(null);
        setLoadFailed(false);
        setLoading(true);
        getUnitDetails(unitId, token, notificationApi)
            .then((result) => {
                if (!cancelled) {
                    setUnit(result);
                    setLoadFailed(!result);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [unitId, token, notificationApi]);

    if (!unitId) {
        return (
            <Alert
                type="info"
                showIcon
                title="No property or unit assigned"
                description="This lease is not linked to a property unit."
            />
        );
    }

    if (!token) {
        return (
            <Alert
                type="warning"
                showIcon
                title="Authentication required"
                description="Sign in again to view the unit details."
            />
        );
    }

    if (loading) {
        return <Flex justify="center" style={{ padding: 32 }}><Spin /></Flex>;
    }

    if (!unit) {
        return (
            <Alert
                type="warning"
                showIcon
                title={loadFailed ? "Unit details unavailable" : "Unit not found"}
                description={loadFailed
                    ? "The property manager could not load this unit. Try again later."
                    : `Lease references unit ${unitId}, but no unit details were returned.`}
            />
        );
    }

    const address = unit.building?.property?.location?.address;
    const addressText = address
        ? [
            address.streetNumber,
            address.streetName,
            address.ward,
            address.city,
            address.region,
            address.country,
        ].filter(Boolean).join(", ")
        : "Address not available";
    const imageUrls = unit.images
        ?.map((image) => image.url || image.imageUrl)
        .filter((url): url is string => Boolean(url)) ?? [];

    return (
        <Flex vertical gap="middle">
            {unit.building?.property && (
                <Card title="Property" size="small">
                    <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                        <Descriptions.Item label="Name">{unit.building.property.name || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Code">{unit.building.property.code || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Type">{formatType(unit.building.property.type)}</Descriptions.Item>
                        <Descriptions.Item label="Building">
                            {unit.building.name || unit.building.code || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address" span={2}>{addressText}</Descriptions.Item>
                        {unit.building.property.description && (
                            <Descriptions.Item label="Description" span={2}>
                                {unit.building.property.description}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Card>
            )}

            <Card title="Assigned Unit" size="small">
                {imageUrls.length > 0 && (
                    <Image.PreviewGroup>
                        <Flex gap="small" wrap="wrap" style={{ marginBottom: 16 }}>
                            {imageUrls.map((url, index) => (
                                <Image
                                    key={`${url}-${index}`}
                                    src={url}
                                    alt={`Unit ${unit.unitNumber}`}
                                    width={160}
                                    height={120}
                                    style={{ objectFit: "cover", borderRadius: 6 }}
                                />
                            ))}
                        </Flex>
                    </Image.PreviewGroup>
                )}
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                    <Descriptions.Item label="Unit">{unit.unitNumber}</Descriptions.Item>
                    <Descriptions.Item label="Type">{formatType(unit.type)}</Descriptions.Item>
                    <Descriptions.Item label="Bedrooms">{unit.numberOfBedrooms}</Descriptions.Item>
                    <Descriptions.Item label="Bathrooms">{unit.numberOfBathrooms}</Descriptions.Item>
                    <Descriptions.Item label="Parking spaces">{unit.numberParkingSpots}</Descriptions.Item>
                    <Descriptions.Item label="Rent">
                        <Typography.Text strong>{unit.rentAmount}</Typography.Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Size">
                        {unit.roomSize} {unit.sizeUnit}
                    </Descriptions.Item>
                    <Descriptions.Item label="Floor">{unit.floorNumber ?? "-"}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={unit.status === UnitStatus.AVAILABLE
                            ? "green"
                            : unit.status === UnitStatus.OCCUPIED
                                ? "red"
                                : "orange"}
                        >
                            {unit.status ?? "Unknown"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Listing">
                        <Tag color={unit.isListed ? "blue" : "default"}>
                            {unit.isListed ? "Advertised" : "Not advertised"}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </Flex>
    );
}
