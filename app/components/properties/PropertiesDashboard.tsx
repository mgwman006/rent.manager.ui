import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function PropertiesDashboard() {
  return (
    <Card style={{ minHeight: 300 }}>
      <Title level={4}>Properties</Title>
      <Text type="secondary">Property management will be added here soon.</Text>
    </Card>
  );
}
