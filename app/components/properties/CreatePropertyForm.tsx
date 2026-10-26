import { Button, Form, Input, InputNumber, Modal, Select } from "antd";
import { DevelopmentStatus, PropertyCreateDTO, PropertyDetailsDTO, PropertyType } from "../../models/property";
import { useEffect } from "react";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import { useAccount } from "../../store/account/AccountContext";
import { NotificationInstance } from "antd/es/notification/interface";
import { createProperty } from "../../services/propertyService";

interface CreatePropertyFormProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    createdByUserId: number;
    onCancel: () => void;
    notificationApi: NotificationInstance;
    setProperties: React.Dispatch<React.SetStateAction<PropertyDetailsDTO[]>>;
}

export default function CreatePropertyForm({
    open,
    setOpen,
    createdByUserId,
    onCancel,
    notificationApi,
    setProperties
}: CreatePropertyFormProps) {
    const [form] = Form.useForm<PropertyCreateDTO>();
    const { rentalProfileState } = useRentalProfile();
    const { accountState } = useAccount();
    

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                createdByUserId,
                numberOfBuildings: 1,
            });
        }
    }, [createdByUserId, form, open]);

    const handleFinish = async (values: PropertyCreateDTO) => {
        const created = await handleCreateProperty({ ...values, createdByUserId });
        if (created) {
            form.resetFields();
            onCancel();
        }
    };


    const handleCreateProperty = async (property: PropertyCreateDTO) => {
        const rentalProfileId = rentalProfileState.rentalProfile?.id;
        const token = accountState.accountDetails?.token ?? "";
        if (!rentalProfileId || !token) {
            notificationApi.error({
                message: "Unable to create property",
                description: "A rental profile and valid session are required.",
            });
            return false;
        }

        const createdProperty = await createProperty(
            rentalProfileId,
            property,
            token,
            notificationApi,
        );

        if (!createdProperty) {
            return false;
        }

        setProperties((currentProperties) => [...currentProperties, createdProperty]);
        setOpen(false);
          return true;
  };

    return (
        <Modal
            title="Create Property"
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnHidden
            width={680}
        >
            <Form<PropertyCreateDTO>
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ 
                    createdByUserId : createdByUserId, 
                    numberOfBuildings: 1 ,
                    developmentStatus: DevelopmentStatus.OPERATIONAL,
                }}
            >
                <Form.Item name="createdByUserId" hidden>
                    <InputNumber />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Property Name"
                    rules={[{ required: true, message: "Enter a property name." }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Property Type"
                    rules={[{ required: true, message: "Select a property type." }]}
                >
                    <Select
                        options={Object.values(PropertyType).map((type) => ({
                            value: type,
                            label: type.replaceAll("_", " ").toLowerCase(),
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    name="numberOfBuildings"
                    label="Number of Buildings"
                    rules={[{ required: true, message: "Enter the number of buildings." }]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              
                <Form.Item name="landSize" label="Land Size" hidden>
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="landSizeUnit" label="Land Size Unit" hidden>
                    <Input placeholder="e.g. acres or square metres" />
                </Form.Item>

                <Form.Item
                    hidden
                    name="developmentStatus"
                    label="Development Status"
                    rules={[{ required: true, message: "Select a development status." }]}
                >
                   <Input />
                </Form.Item>

                <Form.Item name={["location", "name"]} label="Location Name (Popular name for the Area)">
                    <Input />
                </Form.Item>

                <Form.Item
                   hidden
                    name={["location", "latitude"]}
                    label="Latitude"
                    rules={[{ required: false, message: "Enter the location latitude." }]}
                >
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    hidden
                    name={["location", "longitude"]}
                    label="Longitude"
                    rules={[{ required: false, message: "Enter the location longitude." }]}
                >
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name={["location", "address", "postalCode"]}
                    label="Postal Code"
                    rules={[{ required: true, message: "Enter the postal code." }]}
                >
                    <Input />
                </Form.Item>
                
                <Form.Item
                    name={["location", "address", "streetNumber"]}
                    label="Street Number"
                    rules={[{ required: true, message: "Enter the street number." }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name={["location", "address", "streetName"]}
                    label="Street Name"
                    rules={[{ required: true, message: "Enter the street name." }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name={["location", "address", "ward"]}
                    label="Ward"
                    rules={[{ required: true, message: "Enter the ward." }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name={["location", "address", "city"]}
                    label="City"
                    rules={[{ required: true, message: "Enter the city." }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name={["location", "address", "region"]}
                    label="Region"
                    rules={[{ required: true, message: "Enter the region." }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name={["location", "address", "country"]}
                    label="Country"
                    rules={[{ required: true, message: "Enter the country." }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Create Property
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
