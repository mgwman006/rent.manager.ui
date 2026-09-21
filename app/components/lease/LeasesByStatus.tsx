import { useEffect, useState } from "react";
import { LeaseDetailsDTO, LeaseStatus } from "../../models/lease";
import { Button, Card, Col, notification, Row, Spin, Tag, Typography } from "antd";
import {getLeasesByRentalProfileAndStatus} from "../../services/leaseService"
import { PlusOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Meta } = Card;
const { Title, Text } = Typography;


export default function LeasesWithStatus(rentalProfileId:number,status:LeaseStatus, token:string){
    const navigate = useNavigate();
    const [leases, setLeases] = useState<LeaseDetailsDTO[]>([]);
    const [leasesLoading, setLeasesLoading] = useState(false);
    const [notificationApi, notificationContextHolder] = notification.useNotification();
    const [displayCount, setDisplayCount] = useState<number>(5);



    const loadMore = () => setDisplayCount((c) => c + 5);


    const loadLeases = async (rentalProfileId:number) => {
        setLeasesLoading(true);
        const data = await getLeasesByRentalProfileAndStatus(rentalProfileId,status,token,notificationApi);
        setLeases(data);
        setLeasesLoading(false);
    };

    useEffect(() => {

        if (!rentalProfileId) {
            return;
        }
        loadLeases(rentalProfileId);
    }, []);

    return (
        <div>
            {leasesLoading ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                    <Spin />
                </div>) : 
                (
                    <Row gutter={[16, 16]}>
                        {leases.slice(0, displayCount).map((lease) => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={8} key={lease.id}>
                            <Card
                            title={
                                <Tag 
                                    color={lease.status.toString() === LeaseStatus.ACTIVE.toString() ? "green" : 
                                        lease.status.toString() === LeaseStatus.PENDING.toString() ? "warning" : 
                                        lease.status.toString() === LeaseStatus.ENDED.toString() ? "error" : 
                                        lease.status.toString() === LeaseStatus.TERMINATED.toString() ? "error" :
                                        "default"}>
                                    {lease.status}
                                </Tag>
                                }
                            style={{ height: '100%' }}
                            extra={<MoreOutlined onClick={() => {navigate(`${lease.id}`);}} />}
                            >
                            <Meta
                                title={<Text strong>{lease.tenant?.firstName && lease.tenant?.lastName ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : "No Tenant Assigned"}</Text>}
                                description={<Text type="secondary">{lease.startDate} → {lease.endDate}</Text>}
                            />
                            </Card>
                        </Col>
                        ))}
                    </Row>
                )
            }
            {displayCount < leases.length && (
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                        <Button onClick={loadMore}>Load more</Button>
                    </div>
                    )}
        </div>
        

                   
    );
}