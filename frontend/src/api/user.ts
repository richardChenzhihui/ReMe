import axios from "axios";

import { serverPath, SUCCESS } from "./config";
import { handelError } from "./util";

const register = async ({
  phone,
  password,
  name,
  gender,
  birthdate_year,
  birthdate_month,
}: {
  phone: string;
  password: string;
  name: string;
  gender: string;
  birthdate_year: string;
  birthdate_month: string;
}) => {
  // return user_id
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      phone: phone,
      password: password,
      name: name,
      gender: gender,
      birthdate_year: birthdate_year,
      birthdate_month: birthdate_month,
    },
    url: `${serverPath}/api/v1/user/register`,
    withCredentials: true,
  };
  try {
    const response = await axios(config);
    const { data } = response;
    if (data && data.code === SUCCESS) {
      return data.data["user_id"];
    }
    throw new Error(data.message);
  } catch (error: any) {
    handelError(error);
  }
};

const login = async (phone: string, password: string) => {
  // return user_id
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      phone: phone,
      password: password,
    },
    url: `${serverPath}/api/v1/user/login`,
    withCredentials: true,
  };
  try {
    const response = await axios(config);
    const { data } = response;
    if (data && data.code === SUCCESS) {
      return data.data["user_id"];
    }
    throw new Error(data.message);
  } catch (error: any) {
    handelError(error);
  }
};

const survey = async (qustionaire: Array<string | string[]>) => {
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      survey: qustionaire,
    },
    url: `${serverPath}/api/v1/user/survey`,
    withCredentials: true,
  };
  try {
    const response = await axios(config);
    const { data } = response;
    if (data && data.code === SUCCESS) {
      return true;
    }
    throw new Error(data.message);
  } catch (error: any) {
    handelError(error);
  }
};

export { login, register, survey };
