import axios from "axios";
import { BaseAPIURL } from "./config";

function makeHeaders() {
  let headerObj = {};

  if (localStorage.getItem("token")) {
    const token = localStorage.getItem("token");
    headerObj = {
      authentication_token: token,
    };
  }

  return headerObj;
}

const Api = axios.create({
  baseURL: BaseAPIURL,
});

Api.interceptors.request.use((request) => {
  if (!request.ignoreAuth) {
    request.headers = makeHeaders();
  }
  return request;
});

Api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const statusCode = error.status || error.response.status;
    if (statusCode === 401) {
      //dispatch action logout
      if (JSON.parse(localStorage.getItem("token"))) {
        localStorage.removeItem("token");
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default Api;
