import { Card, Form, Input } from "antd";

export default function DatesStep() {
    return (
        <Card title="Lease dates">
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
                dependencies={["startDate"]}
                rules={[
                    { required: true, message: "Please enter the lease end date" },
                    ({ getFieldValue }) => ({
                        validator(_, value: string) {
                            if (!value || !getFieldValue("startDate") || value > getFieldValue("startDate")) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("End date must be after the start date."));
                        },
                    }),
                ]}
            >
                <Input type="date" />
            </Form.Item>
        </Card>
    );
}
