import { NotificationInstance } from "antd/es/notification/interface";
import { leaseInvitationApi } from "../api/api";
import { LeaseCreateDTO, LeaseDetailsDTO } from "../models/lease";
import { ApiError } from "../models/error";
import { LeaseInvitationCreateDTO, LeaseInvitationDetailsDTO } from "../models/user";



export const sentInvite = async (requestBody:LeaseInvitationCreateDTO, token:string, notificationApi:NotificationInstance) :Promise<LeaseInvitationDetailsDTO | null> => {
    try {
        const data = await leaseInvitationApi.create(requestBody, token);
        notificationApi.success({
            message: "Invitation sent",
            description: "The lease invitation has been successfully sent.",
        });
        return data;
    } catch (error: unknown) {
        const apiError = error as ApiError;
        notificationApi.error({
             message: apiError.message ?? "Failed to send invitaion", 
             description: apiError.details
                 ? typeof apiError.details === "string"
                     ? apiError.details
                     : JSON.stringify(apiError.details)
                 : "can not retrieve errror description 2"
            });
        return null;
    }
}

 export const getActiveInvitations = async (phoneNumber:string, jwtToken:string,notificationApi:NotificationInstance): Promise<LeaseInvitationDetailsDTO[]> => {
    if (!phoneNumber || !jwtToken) {
        notificationApi.error({
             message: "Fail to load invites", 
             description: "Phone number or token is null"
            });
       return [];
    }

    try {
      return leaseInvitationApi.getActiveInvitationsByPhoneNumber(phoneNumber, jwtToken);

    } catch (error) {
      const apiError = error as ApiError;
        notificationApi.error({
             message: apiError.message ?? "Failed to load leases", 
             description: apiError.details
                 ? typeof apiError.details === "string"
                     ? apiError.details
                     : JSON.stringify(apiError.details)
                 : "can not retrieve errror description 2"
            });
        return [];
    }
  };