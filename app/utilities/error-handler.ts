import axios from "axios";
import { NotificationInstance } from "antd/es/notification/interface";
import { ApiError, ApiErrorData } from "../models/error";
import { navigateToAuth } from "./auth";

let redirectingToAuth = false;

const redirectUnauthorized = () => {
  if (!redirectingToAuth) {
    redirectingToAuth = navigateToAuth();
  }
};

export function handleApiResponseError(
  error: unknown,
  networkMessage: string,
  clientMessage: string,
): Promise<never> {
  if (axios.isAxiosError<Partial<ApiErrorData>>(error)) {
    if (error.response) {
      const { message, data, statusCode } = error.response.data ?? {};
      const responseStatus = error.response.status;
      if (responseStatus === 401) {
        redirectUnauthorized();
      }

      return Promise.reject(new ApiError({
        message: message ?? "SERVER_ERROR",
        data: data ?? null,
        statusCode: responseStatus === 401 ? 401 : statusCode ?? responseStatus,
      }));
    }

    if (error.request) {
      return Promise.reject(new ApiError({
        message: "NETWORK_ERROR",
        data: networkMessage,
        statusCode: 0,
      }));
    }
  }

  return Promise.reject(new ApiError({
    message: "CLIENT_ERROR",
    data: clientMessage,
    statusCode: 0,
  }));
}

export function handleApiError(error: unknown, notificationApi:NotificationInstance) 
{
  if (!(error instanceof ApiError)) 
  {
    notificationApi.error({
        message:"Error",
        description:"Something went wrong"
    });
    return;
  }

  if (error.statusCode === 401) {
    redirectUnauthorized();
    return;
  }

  if (typeof error.details === "object" && error.details !== null) 
  {
    Object.entries(error.details).forEach(([field, message]) => 
        {
            notificationApi.error(
            {
                message:`${field} error`,
                description:message
            }
        );
        }
    );
  } 
  else 
  {
    notificationApi.error({
        message:error.message,
        description:error.details
    });
  }
}