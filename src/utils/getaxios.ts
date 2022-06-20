import axios, { AxiosResponse } from 'axios';

const getaxios = async (path: string):Promise<AxiosResponse<any, any>> => {
  return axios.get(path);
};

export default getaxios;
