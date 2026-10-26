



import { Form, FormInstance, Input, InputNumber, Radio, Select, Typography } from "antd";
import { LeaseCreateDTO } from "../../../models/lease";

const { Text } = Typography;

interface TermsStepProps {
  leaseForm: FormInstance<LeaseCreateDTO>;
}

export default function TermsStep() {
    return (
        <>            

            <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: "Please enter the lease start date" }]}
            >
                <Input type="date" />
            </Form.Item>
            <Form.Item
                name="endDate"
                label="End Date"
                rules={[{ required: true, message: "Please enter the lease end date" }]}
            >
                <Input type="date" />
            </Form.Item>
            <Form.Item
                name="fullLeasePaymentRequired"
                label="Do you need full payment"
                initialValue={false}
                rules={[{ required: true, message: "Please select whether full payment is required" }]}
            >
                <Radio.Group buttonStyle="solid">
                    <Radio.Button value={true}>Yes</Radio.Button>
                    <Radio.Button value={false}>No</Radio.Button>
                </Radio.Group>
            </Form.Item>
                         
        </>
    );
}