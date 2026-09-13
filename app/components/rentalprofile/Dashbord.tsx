import { HomeTwoTone } from "@ant-design/icons";
import { Avatar, Card, Col, notification, Row, Typography } from "antd";
import { useAccount } from "../../store/account/AccountContext";
import { useRentalProfile } from "../../store/rentalprofile/RentalProfileContext";
import { RentalProfileDetailsDTO } from "../../models/rentalprofile";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
const {Meta} = Card;


export default function Dashboard()
{
    const navigate = useNavigate();
    const { accountState } = useAccount();
    const { rentalProfileState } = useRentalProfile();
    const [notificationApi, contextHolder] = notification.useNotification();
    const [rentalProfile,setRentalProfile] = useState<RentalProfileDetailsDTO>();

    useEffect( () =>{
        if(!rentalProfileState.rentalProfile)
        {
            navigate(`/`);
            return;
        }
        setRentalProfile(rentalProfileState.rentalProfile)
    },[rentalProfileState.rentalProfile]);

    return (
        <div>
            {contextHolder}
            <Row>
                <Col span={24}>
                    <Card>
                        <Meta
                            avatar={<Avatar size={50} icon={<HomeTwoTone />}/>}
                            title={rentalProfile?.name}
                            description={rentalProfile?.type}
                        />
                    </Card>
                </Col>
            </Row>
            
        </div>
    )
}
