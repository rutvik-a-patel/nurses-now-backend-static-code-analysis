import { DEFAULT_IMAGE, MEDIA_FOLDER } from '../constants/enum';

const getDefaultImages = () => {
  const path = process.env.AWS_ASSETS_PATH + MEDIA_FOLDER.default + '/';
  return {
    logo: path + DEFAULT_IMAGE.logo,
  };
};
export default getDefaultImages;
