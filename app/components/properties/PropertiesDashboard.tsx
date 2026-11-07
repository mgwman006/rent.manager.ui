import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Collapse,
    Descriptions,
    Flex,
    Image,
    List,
    Modal,
    notification,
    Result,
    Spin,
    Tag,
    Typography,
} from "antd";
import { EyeOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useAccount } from "../../store/account/AccountContext";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import {
    BuildingDetailsDTO,
    PropertyDetailsDTO,
    UnitDetailsDTO,
    UnitStatus,
} from "../../models/property";
import { getPropertiesByRentalProfileId, updateUnitListingStatus } from "../../services/propertyService";
import CreatePropertyForm from "./CreatePropertyForm";
import CreateUnitModal from "./CreateUnitModal";

const { Title, Text } = Typography;

interface UnitPreview {
    unit: UnitDetailsDTO;
    propertyName: string;
    buildingName: string;
    address: string;
}

export default function PropertiesDashboard() {
    const [properties, setProperties] = useState<PropertyDetailsDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [createPropertyOpen, setCreatePropertyOpen] = useState(false);
    const [createUnitBuilding, setCreateUnitBuilding] = useState<BuildingDetailsDTO | null>(null);
    const [previewUnit, setPreviewUnit] = useState<UnitPreview | null>(null);
    const [updatingListingUnitIds, setUpdatingListingUnitIds] = useState<Set<number>>(new Set());
    const [notificationApi, contextHolder] = notification.useNotification();
    const { accountState } = useAccount();
    const { rentalProfileState } = useRentalProfile();
    const token = accountState.accountDetails?.token ?? "";
    const rentalProfileId = rentalProfileState.rentalProfile?.id;
    const creatorId = accountState.accountDetails?.userDetails?.id
        ?? accountState.accountDetails?.id
        ?? 0;

    const buildingCount = useMemo(
        () => properties.reduce((total, property) => total + (property.buildings?.length ?? 0), 0),
        [properties],
    );
    const unitCount = useMemo(
        () => properties.reduce(
            (total, property) => total + (property.buildings ?? []).reduce(
                (buildingTotal, building) => buildingTotal + (building.units?.length ?? 0),
                0,
            ),
            0,
        ),
        [properties],
    );
    const listedUnitCount = useMemo(
        () => properties.reduce(
            (total, property) => total + (property.buildings ?? []).reduce(
                (buildingTotal, building) => buildingTotal + (building.units ?? []).filter((unit) => unit.isListed).length,
                0,
            ),
            0,
        ),
        [properties],
    );

    useEffect(() => {
        if (!rentalProfileId || !token) {
            setProperties([]);
            return;
        }

        let cancelled = false;
        setLoading(true);
        getPropertiesByRentalProfileId(rentalProfileId, token, notificationApi)
            .then((loadedProperties) => {
                if (!cancelled) {
                    setProperties(loadedProperties);
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

    const handleUnitCreated = (unit: UnitDetailsDTO) => {
        setProperties((currentProperties) => currentProperties.map((property) => ({
            ...property,
            buildings: (property.buildings ?? []).map((building) => (
                building.id === unit.buildingId
                    ? { ...building, units: [...(building.units ?? []), unit] }
                    : building
            )),
        })));
    };

    const handleListingStatusChange = async (unit: UnitDetailsDTO) => {
        if (!token) {
            notificationApi.error({
                message: "Authentication Required",
                description: "Sign in again to update a unit listing.",
            });
            return;
        }

        const isListed = !unit.isListed;
        setUpdatingListingUnitIds((current) => new Set(current).add(unit.id));
        try {
            const updatedStatus = await updateUnitListingStatus(
                unit.id,
                isListed,
                token,
                notificationApi,
            );
            if (updatedStatus === null) return;

            setProperties((currentProperties) => currentProperties.map((property) => ({
                ...property,
                buildings: (property.buildings ?? []).map((building) => ({
                    ...building,
                    units: (building.units ?? []).map((currentUnit) => (
                        currentUnit.id === unit.id
                            ? { ...currentUnit, isListed: updatedStatus }
                            : currentUnit
                    )),
                })),
            })));
            setPreviewUnit((current) => (
                current?.unit.id === unit.id
                    ? { ...current, unit: { ...current.unit, isListed: updatedStatus } }
                    : current
            ));
            notificationApi.success({
                message: updatedStatus ? "Unit advertised" : "Unit unlisted",
                description: `Unit ${unit.unitNumber} ${updatedStatus ? "is now visible" : "is no longer visible"} in the advertising app.`,
            });
        } finally {
            setUpdatingListingUnitIds((current) => {
                const next = new Set(current);
                next.delete(unit.id);
                return next;
            });
        }
    };

    const openUnitPreview = (
        unit: UnitDetailsDTO,
        property: PropertyDetailsDTO,
        building: BuildingDetailsDTO,
    ) => {
        const address = property.location?.address;
        setPreviewUnit({
            unit,
            propertyName: property.name,
            buildingName: building.name || building.code || `Building ${building.id}`,
            address: address
                ? [address.streetNumber, address.streetName, address.ward, address.city, address.region, address.country]
                    .filter(Boolean)
                    .join(", ")
                : "Address not available",
        });
    };

    const renderUnit = (
        unit: UnitDetailsDTO,
        property: PropertyDetailsDTO,
        building: BuildingDetailsDTO,
    ) => {
        const statusColor = unit.status === UnitStatus.AVAILABLE
            ? "green"
            : unit.status === UnitStatus.OCCUPIED
                ? "red"
                : unit.status === UnitStatus.MAINTENANCE
                    ? "orange"
                    : "default";

        return (
            <List.Item
                key={unit.id}
                extra={(
                    unit.isListed ? (
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => openUnitPreview(unit, property, building)}
                        >
                            Preview
                        </Button>
                    ) : (
                            <Button
                                type="primary"
                                loading={updatingListingUnitIds.has(unit.id)}
                                disabled={updatingListingUnitIds.has(unit.id)}
                                onClick={() => handleListingStatusChange(unit)}
                            >
                                Advertise
                            </Button>
                    )
                )}
            >
                <List.Item.Meta
                    title={unit.listingTitle || `Unit ${unit.unitNumber}`}
                    description={(
                        <Flex gap="small" wrap="wrap" align="center">
                            <span>{unit.type.toLowerCase().replaceAll("_", " ")}</span>
                            <span>{unit.numberOfBedrooms} bed</span>
                            <span>{unit.numberOfBathrooms} bath</span>
                            <span>{unit.rentAmount} rent</span>
                            <Tag color={statusColor}>{unit.status}</Tag>
                            <Tag color={unit.isListed ? "blue" : "default"}>
                                {unit.isListed ? "Advertised" : "Not advertised"}
                            </Tag>
                        </Flex>
                    )}
                />
            </List.Item>
        );
    };

    const renderBuilding = (building: BuildingDetailsDTO, property: PropertyDetailsDTO) => (
        <Card
            key={building.id}
            size="small"
            title={building.name || building.code || `Building ${building.id}`}
            extra={(
                <Button
                    icon={<PlusOutlined />}
                    onClick={() => setCreateUnitBuilding(building)}
                >
                    Add Unit
                </Button>
            )}
        >
            {building.description && (
                <Text type="secondary">{building.description}</Text>
            )}
            {building.units?.length ? (
                <List
                    size="small"
                    dataSource={building.units}
                    rowKey="id"
                    renderItem={(unit) => renderUnit(unit, property, building)}
                />
            ) : (
                <Text type="secondary">No units in this building yet.</Text>
            )}
        </Card>
    );

    const propertyItems = properties.map((property) => {
        const address = property.location?.address;
        const addressText = address
            ? [address.streetNumber, address.streetName, address.ward, address.city, address.region]
                .filter(Boolean)
                .join(", ")
            : "Address not provided";
        const buildingTotal = property.buildings?.length ?? 0;
        const propertyUnits = (property.buildings ?? []).reduce(
            (total, building) => total + (building.units?.length ?? 0),
            0,
        );

        return {
            key: String(property.id),
            label: (
                <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                    <Flex vertical>
                        <Text strong>{property.name}</Text>
                        <Text type="secondary">{addressText}</Text>
                    </Flex>
                    <Flex gap="small" wrap="wrap">
                        <Tag>{buildingTotal} {buildingTotal === 1 ? "building" : "buildings"}</Tag>
                        <Tag>{propertyUnits} {propertyUnits === 1 ? "unit" : "units"}</Tag>
                    </Flex>
                </Flex>
            ),
            children: (
                <Flex vertical gap="middle">
                    <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }}>
                        <Descriptions.Item label="Property Code">{property.code || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Type">{property.type?.replaceAll("_", " ") || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Development Status">{property.developmentStatus?.replaceAll("_", " ") || "-"}</Descriptions.Item>
                        {property.description && (
                            <Descriptions.Item label="Description" span={3}>{property.description}</Descriptions.Item>
                        )}
                    </Descriptions>
                    {buildingTotal ? (
                        <Flex vertical gap="middle">
                            {(property.buildings ?? []).map((building) => renderBuilding(building, property))}
                        </Flex>
                    ) : (
                        <Alert
                            type="info"
                            showIcon
                            title="No buildings listed for this property"
                            description="The property can be managed here; add buildings through the property service when building creation is available."
                        />
                    )}
                </Flex>
            ),
        };
    });

    return (
        <div>
            {contextHolder}
            <Flex vertical gap="large">
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Properties</Title>
                        <Text type="secondary">
                            {rentalProfileState.rentalProfile?.name ?? "Selected rental profile"}
                        </Text>
                    </div>
                    <Flex gap="small">
                        <Button
                            icon={<ReloadOutlined />}
                            disabled={!rentalProfileId || loading}
                            onClick={() => {
                                if (rentalProfileId && token) {
                                    setLoading(true);
                                    getPropertiesByRentalProfileId(rentalProfileId, token, notificationApi)
                                        .then(setProperties)
                                        .finally(() => setLoading(false));
                                }
                            }}
                        >
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            disabled={!rentalProfileId}
                            onClick={() => setCreatePropertyOpen(true)}
                        >
                            Add Property
                        </Button>
                    </Flex>
                </Flex>

                {!rentalProfileId ? (
                    <Alert
                        type="warning"
                        showIcon
                        title="No rental profile selected"
                        description="Select a rental profile to view and manage its properties."
                    />
                ) : loading ? (
                    <Flex justify="center" style={{ padding: 40 }}><Spin size="large" /></Flex>
                ) : properties.length === 0 ? (
                    <Result
                        status="info"
                        title="No properties yet"
                        subTitle="Create a property to start organizing its buildings and rental units."
                        extra={(
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreatePropertyOpen(true)}>
                                Create Property
                            </Button>
                        )}
                    />
                ) : (
                    <>
                        <Flex gap="small" wrap="wrap">
                            <Tag>{properties.length} {properties.length === 1 ? "property" : "properties"}</Tag>
                            <Tag>{buildingCount} {buildingCount === 1 ? "building" : "buildings"}</Tag>
                            <Tag>{unitCount} {unitCount === 1 ? "unit" : "units"}</Tag>
                            <Tag color="blue">{listedUnitCount} advertised</Tag>
                        </Flex>
                        <Collapse items={propertyItems} />
                    </>
                )}
            </Flex>

            <CreatePropertyForm
                open={createPropertyOpen}
                setOpen={setCreatePropertyOpen}
                createdByUserId={creatorId}
                onCancel={() => setCreatePropertyOpen(false)}
                notificationApi={notificationApi}
                setProperties={setProperties}
            />
            {createUnitBuilding && (
                <CreateUnitModal
                    open={Boolean(createUnitBuilding)}
                    buildingId={createUnitBuilding.id}
                    onCancel={() => setCreateUnitBuilding(null)}
                    onCreated={(unit) => {
                        handleUnitCreated(unit);
                        notificationApi.success({
                            message: "Unit created",
                            description: `Unit ${unit.unitNumber} was added to ${createUnitBuilding.name || createUnitBuilding.code}.`,
                        });
                    }}
                />
            )}
            <Modal
                title="Unit advertisement preview"
                open={Boolean(previewUnit)}
                onCancel={() => setPreviewUnit(null)}
                footer={null}
                destroyOnHidden
            >
                {previewUnit && (
                    <Flex vertical gap="middle">
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                {previewUnit.unit.listingTitle || `Unit ${previewUnit.unit.unitNumber}`}
                            </Title>
                            <Text type="secondary">
                                {previewUnit.propertyName} · {previewUnit.buildingName}
                            </Text>
                        </div>
                        <Text>{previewUnit.address}</Text>
                        {previewUnit.unit.description && <Text>{previewUnit.unit.description}</Text>}
                        {previewUnit.unit.images?.some((image) => image.imageUrl || image.url) && (
                            <Image.PreviewGroup>
                                <Flex gap="small" wrap="wrap">
                                    {previewUnit.unit.images
                                        .filter((image) => image.imageUrl || image.url)
                                        .map((image) => (
                                            <Image
                                                key={image.id}
                                                width={120}
                                                height={90}
                                                style={{ objectFit: "cover" }}
                                                src={image.imageUrl || image.url}
                                                alt={previewUnit.unit.listingTitle || `Unit ${previewUnit.unit.unitNumber}`}
                                            />
                                        ))}
                                </Flex>
                            </Image.PreviewGroup>
                        )}
                        <Descriptions size="small" column={{ xs: 1, sm: 2 }} bordered>
                            <Descriptions.Item label="Rent">{previewUnit.unit.rentAmount}</Descriptions.Item>
                            <Descriptions.Item label="Type">
                                {previewUnit.unit.type.toLowerCase().replaceAll("_", " ")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Bedrooms">{previewUnit.unit.numberOfBedrooms}</Descriptions.Item>
                            <Descriptions.Item label="Bathrooms">{previewUnit.unit.numberOfBathrooms}</Descriptions.Item>
                            <Descriptions.Item label="Size">
                                {previewUnit.unit.roomSize} {previewUnit.unit.sizeUnit}
                            </Descriptions.Item>
                            <Descriptions.Item label="Parking">{previewUnit.unit.numberParkingSpots}</Descriptions.Item>
                            <Descriptions.Item label="Availability">
                                <Tag color={previewUnit.unit.status === UnitStatus.AVAILABLE ? "green" : "default"}>
                                    {previewUnit.unit.status}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Flex>
                )}
            </Modal>
        </div>
    );
}
