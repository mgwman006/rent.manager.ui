
// interface PropertyDetailsStepProps {
//   leaseForm: FormInstance<LeaseCreateDTO>;
// }

// export default function PropertyDetailsStep(
// ) {
//     return (
//         <>
//             <Text type="secondary">
//                 Property details are optional. You can skip this step and assign a unit later.
//             </Text>
//             <Form.Item name="unitId" label="Unit ID (Optional)">
//                 <InputNumber style={{ width: "100%" }} min={1} />
//             </Form.Item>
//         </>
//     );
// }

import { Alert, Button, Flex, Form, List, notification, Result, Select, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { PropertyCreateDTO, PropertyDetailsDTO, UnitDetailsDTO } from "../../../models/property";
import { createProperty, getPropertiesByRentalProfileId } from "../../../services/propertyService";
import { useAccount } from "../../../store/account/AccountContext";
import { useRentalProfile } from "../../../store/rentalprofile/RentalProfileContext";
import { PlusOutlined } from "@ant-design/icons";
import CreatePropertyForm from "../../properties/CreatePropertyForm";
import CreateUnitModal from "../../properties/CreateUnitModal";

export default function PropertyDetailsStep() {
    const leaseForm = Form.useFormInstance();
    const [properties, setProperties] = useState<PropertyDetailsDTO[]>([]);
    const [propertiesLoading, setPropertiesLoading] = useState(false);
    const [createPropertyOpen, setCreatePropertyOpen] = useState(false);
    const [createUnitOpen, setCreateUnitOpen] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number>();
    const [selectedBuildingId, setSelectedBuildingId] = useState<number>();
    const [notificationApi, contextHolder] = notification.useNotification();
    const { accountState } = useAccount();
    const { rentalProfileState } = useRentalProfile();
    const token = accountState.accountDetails?.token ?? "";
    const rentalProfileId = rentalProfileState.rentalProfile?.id;
    const creatorId = accountState.accountDetails?.userDetails?.id ?? accountState.accountDetails?.id ?? 0;
    const selectedProperty = properties.find((property) => property.id === selectedPropertyId);
    const buildings = selectedProperty?.buildings ?? [];
    const selectedBuilding = buildings.find((building) => building.id === selectedBuildingId);
    const units = selectedBuilding?.units ?? [];

    const selectProperty = (propertyId?: number) => {
        setSelectedPropertyId(propertyId);
        setSelectedBuildingId(undefined);
        leaseForm.setFieldValue("unitId", undefined);
    };

    const selectBuilding = (buildingId?: number) => {
        setSelectedBuildingId(buildingId);
        leaseForm.setFieldValue("unitId", undefined);
    };

    const selectUnit = (unit: UnitDetailsDTO) => {
        leaseForm.setFieldValue("unitId", unit.id);
    };

    const handleUnitCreated = (unit: UnitDetailsDTO) => {
        setProperties((current) => current.map((property) => ({
            ...property,
            buildings: property.buildings.map((building) =>
                building.id === unit.buildingId
                    ? { ...building, units: [...(building.units ?? []), unit] }
                    : building,
            ),
        })));
        leaseForm.setFieldValue("unitId", unit.id);
    };

    useEffect(() => {
        if (!rentalProfileId || !token) {
            return;
        }

        let cancelled = false;
        setPropertiesLoading(true);
        getPropertiesByRentalProfileId(rentalProfileId, token, notificationApi)
            .then((loadedProperties) => {
                if (!cancelled) {
                    setProperties(loadedProperties);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setPropertiesLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };

    }, [rentalProfileId, token]);



    return (
        <div>
            {contextHolder}
            <Flex vertical gap="large">
                <Alert
                    title="Property details are optional. Choose a property, building, and unit, or continue without assigning one."
                    type="info"
                    showIcon
                />

                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <Typography.Title level={5} style={{ margin: 0 }}>Select Property and Unit</Typography.Title>
                    <Button variant="solid" color="green" icon={<PlusOutlined />} onClick={() => setCreatePropertyOpen(true)}>
                        Add Property
                    </Button>
                </Flex>

                {propertiesLoading ? (
                    <Spin />
                ) : properties.length === 0 ? (
                    <Result
                        status="warning"
                        title="No properties yet"
                        subTitle="Create a property to add buildings and units for this lease."
                    />
                ) : (
                    <>
                        <Flex gap="middle" wrap="wrap">
                            <Select
                                aria-label="Filter by property"
                                placeholder="Select property"
                                allowClear
                                value={selectedPropertyId}
                                onChange={selectProperty}
                                options={properties.map((property) => ({ value: property.id, label: property.name }))}
                                style={{ flex: "1 1 240px", minWidth: 220 }}
                            />
                            <Select
                                aria-label="Filter by building"
                                placeholder="Select building"
                                allowClear
                                disabled={!selectedPropertyId}
                                value={selectedBuildingId}
                                onChange={selectBuilding}
                                options={buildings.map((building) => ({
                                    value: building.id,
                                    label: building.name || building.code,
                                }))}
                                style={{ flex: "1 1 240px", minWidth: 220 }}
                            />
                        </Flex>

                        {selectedPropertyId && !buildings.length && (
                            <Alert
                                type="info"
                                showIcon
                                title="This property has no buildings yet."
                                description="A unit must belong to a building. Add a property with buildings before creating a unit."
                            />
                        )}

                        {selectedBuildingId && (
                            units.length ? (
                                <List
                                    header={<Typography.Text strong>Units in {selectedBuilding?.name || selectedBuilding?.code}</Typography.Text>}
                                    bordered
                                    dataSource={units}
                                    rowKey="id"
                                    renderItem={(unit) => {
                                        const selected = leaseForm.getFieldValue("unitId") === unit.id;
                                        return (
                                            <List.Item
                                                actions={[
                                                    <Button
                                                        key="select"
                                                        type={selected ? "primary" : "default"}
                                                        onClick={() => selectUnit(unit)}
                                                    >
                                                        {selected ? "Selected" : "Select"}
                                                    </Button>,
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    title={`Unit ${unit.unitNumber}`}
                                                    description={`${unit.type} · ${unit.numberOfBedrooms} bed · ${unit.rentAmount} rent`}
                                                />
                                            </List.Item>
                                        );
                                    }}
                                />
                            ) : (
                                <Result
                                    status="info"
                                    title="No units in this building"
                                    extra={(
                                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateUnitOpen(true)}>
                                            Create Unit
                                        </Button>
                                    )}
                                />
                            )
                        )}
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
            {selectedBuildingId && (
                <CreateUnitModal
                    open={createUnitOpen}
                    buildingId={selectedBuildingId}
                    onCancel={() => setCreateUnitOpen(false)}
                    onCreated={handleUnitCreated}
                />
            )}
        </div>
    );
}


