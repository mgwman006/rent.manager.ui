
export type ApiErrorData = {
  message: string;       // error type e.g. "VALIDATION_FAILED", "UNAUTHORIZED"
  data: string | Record<string, string> | null;  // detailed error e.g. "Invalid phone number" or { field: "message" }
  statusCode: number;
};

export class ApiError extends Error {
  statusCode: number;
  details: string | Record<string, string> | null;

  constructor(values: ApiErrorData) {
    super(values.message);
    this.statusCode =values. statusCode;
    this.details = values.data;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

