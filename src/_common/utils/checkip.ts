import axios from 'axios';
import { ConfigService } from '@nestjs/config';

export const getReqIpCountry = async (ip: string): Promise<string | null> => {
  try {
    const config = new ConfigService();
    const res = await axios.get(`https://apis.data.go.kr/B551505/whois/ipas_country_code?serviceKey=${config.get('GET_REQ_IP_COUNTRY_KEY')}&query=${ip}&answer=json`);
    return res.data.response.whois.countryCode;
  } catch (error) {
    return 'error';
  }
};
