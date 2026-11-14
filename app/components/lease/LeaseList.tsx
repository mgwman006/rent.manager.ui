import { Button, Card, Tabs, TabsProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { LeaseStatus } from "../../models/lease";
import { useAccount } from "../../store/account/AccountContext";
import { useNavigate } from "react-router-dom";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import LeasesByStatus from "./LeasesByStatus";

export default function LeaseList(){
    const { accountState } = useAccount();
    const { rentalProfileState } = useRentalProfile();
    const token = accountState.accountDetails?.token ?? "";
    const navigate = useNavigate();
    const rentalProfileId = rentalProfileState.rentalProfile?.id ?? 0;

    const leaseTabItems: TabsProps['items'] = [
        {
            key: '1',
            label: 'Active',
            children: <LeasesByStatus rentalProfileId={rentalProfileId} status={LeaseStatus.ACTIVE} token={token} />,
        },
        {
            key: '2',
            label: 'Pending Tenant',
            children: <LeasesByStatus rentalProfileId={rentalProfileId} status={LeaseStatus.PENDING_TENANT_APPROVAL} token={token} />,
        },
        {
            key: '3',
            label: 'Ended',
            children: <LeasesByStatus rentalProfileId={rentalProfileId} status={LeaseStatus.ENDED} token={token} />,
        },
    ];

    return (
        <div>
            <Card
                title="Leases"
                extra={<Button type="primary" onClick={() => navigate('create')}><PlusOutlined /> Create Lease</Button>}
            >
                <Tabs defaultActiveKey="1" items={leaseTabItems} />
            </Card>
        </div>
    );
}