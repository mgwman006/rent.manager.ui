import { NotificationInstance } from "antd/es/notification/interface";
import { rentalProfileApi } from "../api/api";
import { RentalProfileDetailsDTO } from "../models/rentalprofile";
import { handleApiError } from "../utilities/error-handler";

export const getRentalProfilesByUserOrOrganization = async (
  userId: number,
  organizationId: number,
  token: string,
  notificationApi: NotificationInstance,
): Promise<RentalProfileDetailsDTO[]> => {
  try {
    return await rentalProfileApi.getByUserIdOrOrganizationId(userId, organizationId, token);
  } catch (error: unknown) {
    handleApiError(error, notificationApi);
    return [];
  }
};