import { Button, Col, Flex, Form, notification, Result, Row, Steps } from "antd";
import TenantDetailsStep from "./createleasesteps/TenantDetailsStep";
import PropertyDetailsStep from "./createleasesteps/PropertyDetailsStep";
import RentDetailsStep from "./createleasesteps/RentDetailsStep";
import ReviewStep from "./createleasesteps/ReviewStep";
import TermsStep from "./createleasesteps/TermsStep";
import { LeaseCreateDTO, LeaseDetailsDTO } from "../../models/lease";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import { useAccount } from "../../store/account/AccountContext";
import { createLease } from "../../services/leaseService";
import { PlusOutlined, MoreOutlined, RightOutlined, LeftOutlined } from "@ant-design/icons";



export default function(){
    const navigate = useNavigate();
    const [leaseForm] = Form.useForm<LeaseCreateDTO>();
    const [createLeaseStep, setCreateLeaseStep] = useState(0);
    const { rentalProfileState } = useRentalProfile();
    const [notificationApi, contextHolder] = notification.useNotification();
    const { accountState } = useAccount();
    const token = accountState.accountDetails?.token ?? "";
    const [lease,setLease] = useState<LeaseDetailsDTO>();

    
    
    const stepItems = [
        { 
            title: "Tenant Details" 
        },
        { title: "Property Details" },
        { title: "Rent Details" },
        { title: "Terms" },
        { 
            title: "Review" 

        },
        { 
            title: "Results" 
        },
    ]

    const handleCreateLease = async () => {
            const rentalProfileId = rentalProfileState.rentalProfile?.id;
            if (!token || !rentalProfileId) {
                notificationApi.error({
                    message: "Authentication Required",
                    description: "Please sign in again to create a lease.",
                });
                navigate("/");
                return;
            }
    
            const values = leaseForm.getFieldsValue(true) as LeaseCreateDTO;
            const payload: LeaseCreateDTO = {
                        ...values,
                        rent: {
                            ...values.rent,
                            currency: "TZS",
                        },
            };
            const response = await createLease(
                payload,
                rentalProfileId,
                token,
                notificationApi,
            );
    
            if (response) {
                setLease(response);
                setCreateLeaseStep((step) => step + 1);
            }
    };

    const goToNextCreateLeaseStep = async () => {
        const fieldsByStep = [
            ["tenantFirstName", "tenantLastName", "tenantPhoneNumber"],
            ["unitId"],
            [
                ["rent", "amount"],
                ["rent", "currency"],
                ["rent", "frequency"],
            ],
            ["startDate", "endDate", "fullLeasePaymentRequired"],
        ];

        try {
            await leaseForm.validateFields(fieldsByStep[createLeaseStep]);
            setCreateLeaseStep((step) => step + 1);
        } catch {
            notificationApi.error({
                message: "Error to during form filling",
                description: "Make sure all files are filled",
            });
        }
    };

    return (
        <div>
            {contextHolder}
            <Flex vertical gap={'large'}>
                <Steps
                    current={createLeaseStep}
                    items={stepItems}
                />

                <Form
                    size="large"
                    form={leaseForm}
                    layout="vertical"
                    onFinish={handleCreateLease}
                >
                    <div className="mt-6">
                    {createLeaseStep === 0 && (
                        <TenantDetailsStep />
                    )}

                    {createLeaseStep === 1 && (
                        <PropertyDetailsStep />
                    )}

                    {createLeaseStep === 2 && (
                        <RentDetailsStep />
                    )}

                    {createLeaseStep === 3 && (
                        <TermsStep/>
                    )}

                    {createLeaseStep === 4 && (
                        <ReviewStep leaseForm={leaseForm} />
                    )}

                    {createLeaseStep === 5 && (
                        <Result
                            status="success"
                            title="Successfully Created a Lease"
                            subTitle={`Lease Reference Number: ${lease?.referenceNumber}.`}
                            extra={[
                                <Button onClick={()=> navigate(-1)} type="primary" key="console">
                                    Go to List
                                </Button>
                            ]}
                        />
                    )}
                </div>
                    
                        
                </Form>

                <Row justify="space-between">
                        <Col>
                            {createLeaseStep > 0 && createLeaseStep<5 && (
                                <Button size="large" onClick={() => setCreateLeaseStep((step) => step - 1)}>
                                   <LeftOutlined /> Back
                                </Button>
                            )}
                        </Col>
                        <Col>
                            {createLeaseStep < 4 ? (
                                <Button size="large" type="primary" onClick={goToNextCreateLeaseStep}>
                                    Next <RightOutlined />
                                </Button>
                            ) : createLeaseStep <5 ? (
                                <Button
                                    size="large"
                                    type="primary"
                                    onClick={() => leaseForm.submit()}
                                >
                                    Create Lease
                                </Button>
                            ):(<div></div>)}
                        </Col>
                </Row>

            </Flex>
        </div>
    );
}

function closeCreateLeaseModal() {
    throw new Error("Function not implemented.");
}
