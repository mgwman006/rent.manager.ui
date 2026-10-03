import { useEffect, useState } from "react";
import { Alert, Card, Descriptions, Flex, Spin, Tag } from "antd";
import { LeaseDetailsDTO } from "../../models/lease";
import { PropertyDetailsDTO, UnitDetailsDTO } from "../../models/property";
import { getPropertiesByRentalProfileId } from "../../services/propertyService";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import { NotificationInstance } from "antd/es/notification/interface";

interface LeaseUnitViewProps {
    leaseDetails: LeaseDetailsDTO;
    token: string;
    notificationApi: NotificationInstance;
}

export default function LeaseUnitView({
    leaseDetails,
    token,
    notificationApi,
}: LeaseUnitViewProps) {
    const [properties, setProperties] = useState<PropertyDetailsDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const { rentalProfileState } = useRentalProfile();
    const rentalProfileId = rentalProfileState.rentalProfile?.id;

    useEffect(() => {
        if (!rentalProfileId || !token) {
            setProperties([]);
            return;
        }

        let cancelled = false;
        setLoading(true);
        getPropertiesByRentalProfileId(rentalProfileId, token, notificationApi)
            .then((result) => {
                if (!cancelled) {
                    setProperties(result);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [rentalProfileId, token]);

    if (loading) {
        return <Flex justify="center" style={{ padding: 32 }}><Spin /></Flex>;
    }

    if (!leaseDetails.unitId) {
        return (
            <Alert
                type="info"
                showIcon
                title="No property or unit assigned"
                description="This lease is not linked to a property unit."
            />
        );
    }

    let relatedProperty: PropertyDetailsDTO | undefined;
    let relatedBuildingName: string | undefined;
    let relatedUnit: UnitDetailsDTO | undefined;

    for (const property of properties) {
        for (const building of property.buildings ?? []) {
            const unit = building.units?.find(({ id }) => id === leaseDetails.unitId);
            if (unit) {
                relatedProperty = property;
                relatedBuildingName = building.name || building.code;
                relatedUnit = unit;
                break;
            }
        }
        if (relatedUnit) break;
    }

    if (!relatedProperty || !relatedUnit) {
        return (
            <Alert
                type="warning"
                showIcon
                title="Related property details not found"
                description={`Lease references unit ${leaseDetails.unitId}, but that unit was not found in the selected rental profile's property list.`}
            />
        );
    }

    const address = relatedProperty.location?.address;
    const addressText = address
        ? [address.streetNumber, address.streetName, address.ward, address.city, address.region, address.country]
            .filter(Boolean)
            .join(", ")
        : "Address not available";

    return (
        <Flex vertical gap="middle">
            <Card title="Property" size="small">
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                    <Descriptions.Item label="Name">{relatedProperty.name}</Descriptions.Item>
                    <Descriptions.Item label="Code">{relatedProperty.code || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Type">{relatedProperty.type?.replaceAll("_", " ") || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Building">{relatedBuildingName || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Address" span={2}>{addressText}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Assigned Unit" size="small">
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                    <Descriptions.Item label="Unit">{relatedUnit.unitNumber}</Descriptions.Item>
                    <Descriptions.Item label="Type">{relatedUnit.type}</Descriptions.Item>
                    <Descriptions.Item label="Bedrooms">{relatedUnit.numberOfBedrooms}</Descriptions.Item>
                    <Descriptions.Item label="Bathrooms">{relatedUnit.numberOfBathrooms}</Descriptions.Item>
                    <Descriptions.Item label="Rent">{relatedUnit.rentAmount}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={relatedUnit.status === "AVAILABLE" ? "green" : relatedUnit.status === "OCCUPIED" ? "red" : "orange"}>
                            {relatedUnit.status}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </Flex>
    );
}