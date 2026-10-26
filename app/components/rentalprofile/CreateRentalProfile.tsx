import { Button, Col, Form, Input, notification, Row, Select } from "antd";
import { useAccount } from "../../store/account/AccountContext";
import { CreateRentalProfileDTO, RentalProfileType } from "../../models/rentalprofile";
import { rentalProfileApi } from "../../api/api";
import { handleApiError } from "../../utilities/error-handler";


export default function CreateRentalProfile() {
  const [form] = Form.useForm<CreateRentalProfileDTO>();
  const [notificationApi, contextHolder] = notification.useNotification();
  const { accountState } = useAccount();

  const handleOk = async (rentalProfileData: CreateRentalProfileDTO ) => {
    const currentToken = accountState.accountDetails?.token?.trim();

    if (!currentToken) {
      notificationApi.error({
        message: "Authentication Required",
        description: "Please sign in again to create a rental profile.",
      });
      return;
    }

    const newRentalProfile: CreateRentalProfileDTO = {
      name: rentalProfileData.name,
      phoneNumber: rentalProfileData.phoneNumber,
      email: rentalProfileData.email ?? null,
      type: rentalProfileData.type,
      userId: accountState.accountDetails?.userDetails?.id as number,
      organizationId: rentalProfileData.organizationId ?? undefined
    };

    try
    {
      const response = await rentalProfileApi.createRentalProfile(newRentalProfile, currentToken);

      if(response)
      {
        notificationApi.success({
          message: "Rental Profile Created",
          description: "Your rental profile has been successfully created.",
        });
        window.location.reload();
      }
    }
    catch (error:any)
    {
      handleApiError(error,notificationApi);
    }
  };

  return (
    <Row align="middle" justify="center" style={{ minHeight: "100vh" }}>
        {contextHolder}
        <Col sm={24} md={24} lg={6} xl={6}>
           <h2 style={{ textAlign: "center" }}>Create Rental Profile</h2>
           <p style={{ textAlign: "center" }}>Please fill in the details below to create your rental profile. This will allow you to manage your rental units and collect rent efficiently.</p>
           <Form
                title="Create Rental Profile"
                size="large"
                name="createRentalProfileForm"
                initialValues={{ remember: true }}
                autoComplete="off"
                validateTrigger="onBlur"
                form={form}
                layout="vertical"
                onFinish={handleOk}
            >
                <Form.Item
                    name="name"
                    label="Rental Profile Name"
                    rules={[{ required: true, message: 'Please enter a name for your rental profile' }]}
                    >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="phoneNumber"
                    label="Phone Number"
                    initialValue={accountState.accountDetails?.phoneNumber}
                    rules={[{ required: true, message: 'Please enter your phone number' }]}
                    >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ type: 'email', message: 'Please enter a valid email address' }]}
                    >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Rental Profile Type"
                    initialValue={RentalProfileType.Individual}
                    rules={[{ required: true, message: 'Please select a rental profile type' }]}
                    >
                    <Select
                        options={[
                            { value: RentalProfileType.Individual, label: 'Individual' },
                            { value: RentalProfileType.Business, label: 'Business' },
                        ]}
                    />
                </Form.Item>

                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type} noStyle>
                    {({ getFieldValue }) => {
                        const selectedType = getFieldValue('type');
                        const isIndividualType = selectedType === RentalProfileType.Individual;

                        return (
                            <>
                                <Form.Item
                                    hidden={!isIndividualType}
                                    name="userId"
                                    label="Admin User ID"
                                    initialValue={accountState.accountDetails?.userDetails?.id}
                                    rules={[
                                        { required: isIndividualType, message: 'Admin User ID is required' }
                                    ]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item
                                    hidden={isIndividualType}
                                    name="organizationId"
                                    label="Organization ID"
                                    rules={[
                                        { required: !isIndividualType, message: 'Organization ID is required' }
                                    ]}
                                >
                                    <Select
                                        options={accountState.accountDetails?.userDetails?.memberships.map(membership => ({
                                            value: membership.organizationId,
                                            label: `${membership.organizationName}: ${membership.organizationId}`
                                        })) || []}
                                    />
                                </Form.Item>
                            </>
                        );
                    }}
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Create Rental Profile
                    </Button>
                </Form.Item>
            </Form>
        </Col>     
    </Row>
  );
}
      