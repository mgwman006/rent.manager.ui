



import { Card, Form, Input, InputNumber, Radio } from "antd";

export default function RentDetailsStep(
) {
    return (
        <Card title="Rent and payment requirements">
            <Form.Item name={["rent", "id"]} initialValue={null} hidden>
                <InputNumber />
            </Form.Item>
            <Form.Item name={["rent", "currency"]} initialValue="TZS" hidden>
                <Input />
            </Form.Item>
            <Form.Item
                name={["rent", "amount"]}
                label="Rent Amount"
                rules={[{ required: true, message: "Please enter the rent amount." }]}
            >
                <InputNumber min={0} style={{ width: "100%" }} suffix="TZS" />
            </Form.Item>
            <Form.Item
                name={["rent", "frequency"]}
                label="Payment frequency"
                rules={[{ required: true }]}
                initialValue="MONTHLY"
            >
                <Radio.Group buttonStyle="solid">
                    <Radio.Button value="YEARLY">Per Year</Radio.Button>
                    <Radio.Button value="MONTHLY">Per Month</Radio.Button>
                    <Radio.Button value="WEEKLY">Per Week</Radio.Button>
                    <Radio.Button value="DAILY">Per Day</Radio.Button>
                </Radio.Group>
            </Form.Item>
            <Form.Item
                name="fullLeasePaymentRequired"
                label="Is full lease payment required?"
                initialValue={false}
                rules={[{ required: true, message: "Please choose whether full payment is required." }]}
            >
                <Radio.Group buttonStyle="solid">
                    <Radio.Button value={true}>Yes</Radio.Button>
                    <Radio.Button value={false}>No</Radio.Button>
                </Radio.Group>
            </Form.Item>
        </Card>
    );
}