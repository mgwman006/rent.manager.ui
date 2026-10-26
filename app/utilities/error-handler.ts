import { NotificationInstance } from "antd/es/notification/interface";
import { ApiError } from "../models/error";
import { navigateToAuth } from "./auth";


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
    navigateToAuth();
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