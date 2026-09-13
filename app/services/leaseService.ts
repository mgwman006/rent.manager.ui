import { NotificationInstance } from "antd/es/notification/interface";
import { leaseApi } from "../api/api";
import { LeaseDetailsDTO } from "../models/lease";


export const getLeases = async (rentalProfileId:number, jwtToken:string, notificationApi:NotificationInstance) :Promise<LeaseDetailsDTO[]> => {
    try {
        const data = await leaseApi.getLeasesByRentalProfile(rentalProfileId, jwtToken);
        return data ?? [];
    } catch (error: any) {
        notificationApi.error({ message: "Failed to load leases", description: error?.message ?? "" });
        return [];
    }
}