



import { Form, FormInstance, Input, InputNumber, Radio, Select, Typography } from "antd";
import { LeaseCreateDTO } from "../../../models/lease";

const { Text } = Typography;

interface RentDetailsStepProps {
  leaseForm: FormInstance<LeaseCreateDTO>;
}

export default function RentDetailsStep(
) {
    return (
        <>
            <Form.Item name={["rent", "id"]} initialValue={null} hidden>
                <InputNumber />
            </Form.Item>
            <Form.Item name={["rent", "currency"]} hidden>
                <Input />
            </Form.Item>
            <Form.Item name={["rent", "amount"]} label="Rent Amount" rules={[{ required: true }]}> 
                <InputNumber min={0} style={{ width: "100%" }} suffix="TZS"/>
            </Form.Item>
            <Form.Item 
                name={["rent", "frequency"]} 
                rules={[{ required: true }]}
                initialValue={'MONTHLY'}

            >
                {/* <Input /> */}
                <Radio.Group buttonStyle="solid">
                    <Radio.Button value="YEARLY">Per Year</Radio.Button>
                    <Radio.Button value="MONTHLY">Per Month</Radio.Button>
                    <Radio.Button value="WEEKLY">Per Week</Radio.Button>
                    <Radio.Button value="DAILY">Per Day</Radio.Button>
                </Radio.Group>
        
            </Form.Item>
        </>
    );
}