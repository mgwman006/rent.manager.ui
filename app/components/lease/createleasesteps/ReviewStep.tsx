



import { Descriptions, Form, FormInstance, Typography } from "antd";
import { LeaseCreateDTO } from "../../../models/lease";
import { sanitizeRichText } from "../RichTextEditor";

interface ReviewStepProps {
  leaseForm: FormInstance<LeaseCreateDTO>;
}

export default function ReviewStep({
        leaseForm
    }:ReviewStepProps
) {
    const leaseFormValues = leaseForm.getFieldsValue(true) as Partial<LeaseCreateDTO>;


    return (
        <>
            <Typography.Title level={5}>Confirm Lease Details</Typography.Title>
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Tenant">
                    {leaseFormValues?.tenantFirstName} {leaseFormValues?.tenantLastName}
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                    {leaseFormValues?.tenantPhoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Unit ID">
                    {leaseFormValues?.unitId ?? "Skipped"}
                </Descriptions.Item>
                <Descriptions.Item label="Rent Amount">
                    {leaseFormValues?.rent?.amount} {leaseFormValues?.rent?.currency}
                </Descriptions.Item>
                <Descriptions.Item label="Rent Frequency">
                    {leaseFormValues?.rent?.frequency}
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                    {leaseFormValues?.startDate}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                    {leaseFormValues?.endDate}
                </Descriptions.Item>
                <Descriptions.Item label="Full Payment Required">
                    {leaseFormValues?.fullLeasePaymentRequired ? "Yes" : "No"}
                </Descriptions.Item>
                <Descriptions.Item label="Terms and Conditions">
                    {leaseFormValues?.leaseTerms?.trim() ? (
                        <div
                            style={{ overflowWrap: "anywhere" }}
                            dangerouslySetInnerHTML={{ __html: sanitizeRichText(leaseFormValues.leaseTerms) }}
                        />
                    ) : (
                        <Typography.Text type="secondary">Not provided</Typography.Text>
                    )}
                </Descriptions.Item>
            </Descriptions>
        </>
    );
}