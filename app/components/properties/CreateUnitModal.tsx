import { Button, Form, Input, InputNumber, Modal, notification, Select } from "antd";
import { useState } from "react";
import { UnitCreateDTO, UnitDetailsDTO, UnitType } from "../../models/property";
import { createUnit } from "../../services/propertyService";
import { useAccount } from "../../store/account/AccountContext";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";

interface CreateUnitModalProps {
    open: boolean;
    buildingId: number;
    onCancel: () => void;
    onCreated: (unit: UnitDetailsDTO) => void;
}

export default function CreateUnitModal({
    open,
    buildingId,
    onCancel,
    onCreated,
}: CreateUnitModalProps) {
    const [form] = Form.useForm<UnitCreateDTO>();
    const [notificationApi, contextHolder] = notification.useNotification();
    const { accountState } = useAccount();
    const token = accountState.accountDetails?.token ?? "";
    const [submitting, setSubmitting] = useState(false);
    const { rentalProfileState } = useRentalProfile();

    const handleFinish = async (values: UnitCreateDTO) => {
        if (!token) {
            notificationApi.error({
                message: "Authentication Required",
                description: "Sign in again to create a unit.",
            });
            return;
        }
        
        setSubmitting(true);
        try {
            const createdUnit = await createUnit(
                buildingId,
                values,
                token,
                notificationApi,
            );

            if (createdUnit) {
                form.resetFields();
                onCreated(createdUnit);
                onCancel();
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Modal
                title="Create Unit"
                open={open}
                onCancel={onCancel}
                footer={null}
                destroyOnHidden
                width={560}
            >
                <Form<UnitCreateDTO>
                    form={form}
                    layout="vertical"
                    initialValues={{
                        numberOfBedrooms: 0,
                        numberOfBathrooms: 0,
                        numberParkingSpots: 0,
                        rentalProfileId: rentalProfileState.rentalProfile?.id ?? 0,
                    }}
                    onFinish={handleFinish}
                >
                    <Form.Item
                        hidden
                        name="rentalProfileId"
                        label="Rental Profile"
                        rules={[{ required: true, message: "Rental Profile is required" }]}
                    >
                        <InputNumber />
                    </Form.Item>

                    <Form.Item
                        name="unitNumber"
                        label="Unit Number"
                        rules={[{ required: true, message: "Enter the unit number." }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Unit Type"
                        rules={[{ required: true, message: "Select a unit type." }]}
                    >
                        <Select
                            options={Object.values(UnitType).map((type) => ({
                                value: type,
                                label: type.toLowerCase().replaceAll("_", " "),
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="rentAmount"
                        label="Rent Amount"
                        rules={[{ required: true, message: "Enter the rent amount." }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        name="roomSize"
                        label="Room Size"
                        rules={[{ required: true, message: "Enter the room size." }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        name="sizeUnit"
                        label="Size Unit"
                        rules={[{ required: true, message: "Enter the size unit." }]}
                    >
                        <Input placeholder="e.g. square metres" />
                    </Form.Item>
                    <Form.Item name="numberOfBedrooms" label="Bedrooms">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="numberOfBathrooms" label="Bathrooms">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="numberParkingSpots" label="Parking Spaces">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={submitting} block>
                            Create Unit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
