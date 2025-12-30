import { Request } from 'express';

const getIp = (req: Request) => {
  const ip =
    req?.headers['x-forwarded-for'] || req?.headers['x-real-ip'] || req?.ip;
  return ip;
};
export default getIp;
