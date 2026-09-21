import { NotificationInstance } from "antd/es/notification/interface";
import { leaseApi } from "../api/api";
import { LeaseDetailsDTO, LeaseStatus, RentSummaryDTO } from "../models/lease";
import { ApiError } from "../models/error";



export const getLeasesAllLeases = async (rentalProfileId:number, token: string, notificationApi:NotificationInstance) :Promise<LeaseDetailsDTO[]> => {
    try {
        const data = await leaseApi.getLeasesByRentalProfile(rentalProfileId, token);
        return data ?? [];
    } catch (error: any) {
        const apiError = error as ApiError;
        notificationApi.error({
            message: apiError.message ?? "Unable to load leases",
            description: apiError.details
                ? typeof apiError.details === "string"
                    ? apiError.details
                    : JSON.stringify(apiError.details)
                : "The lease details could not be loaded.",
        });
        return [];
    }
}

export const getLeasesByRentalProfileAndStatus = async (rentalProfileId:number,status:LeaseStatus, token: string, notificationApi:NotificationInstance) :Promise<LeaseDetailsDTO[]> => {
    try {
        return await leaseApi.getLeasesByRentalProfileAndStatus(rentalProfileId, status, token);
    } catch (error: any) {
        const apiError = error as ApiError;
        notificationApi.error({
            message: apiError.message ?? "Unable to load leases",
            description: apiError.details
                ? typeof apiError.details === "string"
                    ? apiError.details
                    : JSON.stringify(apiError.details)
                : "The lease details could not be loaded.",
        });
        return [];
    }
}

export const getRentSummary = async (rentalProfileId:number, token: string, notificationApi:NotificationInstance) :Promise<RentSummaryDTO | null> => {
    try {
        return await leaseApi.getRentCollectionSummary(rentalProfileId, token);
    } catch (error: any) {
        const apiError = error as ApiError;
        notificationApi.error({
            message: apiError.message ?? "Unable to load leases",
            description: apiError.details
                ? typeof apiError.details === "string"
                    ? apiError.details
                    : JSON.stringify(apiError.details)
                : "The lease details could not be loaded.",
        });
        return null;
    }
}

