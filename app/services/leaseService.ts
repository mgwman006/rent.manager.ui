import { NotificationInstance } from "antd/es/notification/interface";
import { leaseApi } from "../api/api";
import { LeaseCreateDTO, LeaseDetailsDTO, LeaseStatus, LeaseTermsUpdateDTO, RentSummaryDTO } from "../models/lease";
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

export const createLease = async (
    lease: LeaseCreateDTO,
    rentalProfileId: number,
    token: string,
    notificationApi: NotificationInstance,
): Promise<LeaseDetailsDTO | null> => {
    if (!lease.rent) {
        notificationApi.error({
            message: "Rent Details Required",
            description: "Please enter the rent amount, currency, and frequency.",
        });
        return null;
    }
    
    try {
        return await leaseApi.createLease(
            {
                ...lease,
                rentalProfileId,
                rent: {
                    ...lease.rent,
                    id: lease.rent.id ?? 0,
                },
            },
            token,
        );
    } catch (error: unknown) {
        const apiError = error as ApiError;
        notificationApi.error({
            message: apiError.message ?? "Failed to create lease",
            description: apiError.details
                ? typeof apiError.details === "string"
                    ? apiError.details
                    : JSON.stringify(apiError.details)
                : "Unable to create lease.",
        });
        return null;
    }
}


export const updateLeaseTerms = async (leaseId:number,leaseTerms:LeaseTermsUpdateDTO, token:string,notificationApi:NotificationInstance) : Promise<LeaseDetailsDTO | null> => {
    try {
        const updatedLease = await leaseApi.updateLease(leaseId,leaseTerms,token);
            return updatedLease;
        } catch (error: unknown) {
            const apiError = error as ApiError;
            notificationApi.error({
                message: apiError.message ?? "Failed to update lease",
                 description: apiError.details
                ? typeof apiError.details === "string"
                    ? apiError.details
                    : JSON.stringify(apiError.details)
                : "Unable to update lease terms.",
            });
            return null;
        }
}
