export interface Response
{
    status: ResponseStatus;
    message?: string;
    error_type?: string;
    data?: any;
}

enum ResponseStatus
{
    Error = 'error',
    Success = 'success',
}
