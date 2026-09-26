import { Button, Card, Col, Descriptions, Flex, Form, Input, InputNumber, Modal, notification, Radio, Row, Select, Spin, Steps, Tabs, TabsProps, Tag, Typography } from "antd";
import { PlusOutlined, MoreOutlined, RightOutlined, LeftOutlined } from "@ant-design/icons";
import { LeaseCreateDTO, LeaseDetailsDTO, LeaseStatus } from "../../models/lease";
import { useEffect, useState } from "react";
import { useAccount } from "../../store/account/AccountContext";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import LeasesByStatus from "./LeasesByStatus";





export default function LeaseList(){
    const [notificationApi, contextHolder] = notification.useNotification();
    const { accountState } = useAccount();
    const { rentalProfileState } = useRentalProfile();
    const token = accountState.accountDetails?.token ?? "";
    const navigate = useNavigate();

    const leaseTabItems: TabsProps['items'] = [
        {
            key: '1',
            label: 'Active',
            children: LeasesByStatus(
                rentalProfileState?.rentalProfile?.id ?? 0,
                LeaseStatus.ACTIVE,
                token,
            ),
        },
        {
            key: '2',
            label: 'Pending Tenant',
            children: LeasesByStatus(
                rentalProfileState?.rentalProfile?.id ?? 0,
                LeaseStatus.PENDING_TENANT_APPROVAL,
                token,
            ),
        },
        {
            disabled:true,
            key: '4',
            label: 'Expired',
            children: LeasesByStatus(
                rentalProfileState?.rentalProfile?.id ?? 0,
                LeaseStatus.EXPIRED,
                token,
            ),
        }
    ];


   

    return (
        <div>
            {contextHolder}
            <Card 
                title="Leases"
                extra={<Button type="primary" onClick={() => navigate('create')}><PlusOutlined /> Create Lease</Button>}
            >

                <Tabs defaultActiveKey="1" items={leaseTabItems} />
                
            </Card>
        </div>
    );
}