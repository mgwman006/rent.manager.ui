
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

import { Card, Form, Space, Typography, Button, Alert } from "antd";
import { useState } from "react";

type PropertyMode = "existing" | "new" | null;

export default function PropertyDetailsStep() {
    const [mode, setMode] = useState<PropertyMode>(null);
    const form = Form.useFormInstance();

    const skipProperty = () => {
        form.setFieldValue("unitId", undefined);
    };

    return (
        <div>
                
            {!mode && (
                <>
                    <Space direction="vertical" size="middle" className="w-full">
                        <Alert 
                            title="Property details are optional. You can add them now or click next to skip this step and add them later." 
                            type="warning" 
                            showIcon 
                        />

                        <Card
                            hoverable
                            // onClick={() => setMode("existing")}
                        >
                            <Typography.Text strong>
                                Select Existing Property
                            </Typography.Text>

                            <Typography.Paragraph type="secondary">
                                Choose a property and unit already in your account.
                            </Typography.Paragraph>
                        </Card>

                        <Card
                            hoverable
                            // onClick={() => setMode("new")}
                        >
                            <Typography.Text strong>
                                Create New Property
                            </Typography.Text>

                            <Typography.Paragraph type="secondary">
                                Add a new property and unit for this lease.
                            </Typography.Paragraph>
                        </Card>
                    </Space>
                </>
            )}

            {/* {mode === "existing" && (
                <ExistingPropertySelector />
            )}

            {mode === "new" && (
                <CreatePropertyForm />
            )} */}
        </div>
    );
}


