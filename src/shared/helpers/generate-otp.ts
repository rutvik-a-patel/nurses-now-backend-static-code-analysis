import { randomInt } from 'crypto';

const generateOtp = () => {
  let otp = randomInt(100000, 999999);
  if (['localhost', 'development', 'staging'].includes(process.env.NODE_ENV)) {
    otp = 123456;
  }
  return otp;
};

export default generateOtp;
