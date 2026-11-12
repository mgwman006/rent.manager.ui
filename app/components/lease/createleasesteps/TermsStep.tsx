

import { Card, Form, Typography } from "antd";
import RichTextEditor from "../RichTextEditor";

export default function TermsStep() {
    return (
        <Card title="Terms and conditions">
            <Typography.Paragraph type="secondary">
                Add any additional conditions for this lease. Formatting is optional.
            </Typography.Paragraph>
            <Form.Item name="leaseTerms" initialValue="">
                <RichTextEditor />
            </Form.Item>
        </Card>
    );
}