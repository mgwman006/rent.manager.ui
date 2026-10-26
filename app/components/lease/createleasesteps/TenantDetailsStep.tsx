import { LeaseCreateDTO } from "../../../models/lease";
import { Form, Input, InputNumber, Radio, Select, type FormInstance } from "antd";



export default function TenantDetailsStep(){
    return (
            <div>
               
                <Form.Item
                    name="tenantFirstName"
                    label="Tenant First Name"
                    rules={[{ required: true, message: "Please enter the tenant's first name" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="tenantLastName"
                    label="Tenant Last Name"
                    rules={[{ required: true, message: "Please enter the tenant's last name" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="tenantPhoneNumber"
                    label="Tenant Phone Number"
                    rules={[{ required: true, message: "Please enter the tenant's phone number" }]}
                >
                    <Input />
                </Form.Item>
                    
                        
                
            </div>
    );
}