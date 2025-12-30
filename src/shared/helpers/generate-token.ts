import * as jwt from 'jsonwebtoken';
import { AUTH_COLUMN, AUTH_TABLE } from '../constants/types';
/**
 *
 * @param id id of table
 * @param column column name in token table
 * @param table table name
 * @returns jwt token
 */
const generateToken = (
  id: string,
  column: AUTH_COLUMN,
  table: AUTH_TABLE,
  expires?: string,
  secret?: string,
) => {
  return jwt.sign(
    { id, column, table },
    secret ? secret : process.env.JWT_SECRET,
    {
      expiresIn: expires ? expires : process.env.JWT_EXPIRES_IN,
    },
  );
};

export default generateToken;
