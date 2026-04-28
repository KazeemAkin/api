export interface StandardResponseType<T> {
  success: boolean;
  data?: T;
  errors?: T;
  count?: number;
}
export interface StandardRServiceesponseType<T> {
  success: boolean;
  data?: T;
  statusCode: number;
  message?: string;
}
