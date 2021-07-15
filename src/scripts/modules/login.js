import axios from "axios";
import { BaseAPIURL } from "../../utils/config";

$(document).ready(function () {
  $("#loginForm").validate({
    submitHandler: function () {
      axios
      .post(`${BaseAPIURL}/sign_in`, {
        user: { email: $('#email').val(), password: $('#password').val() },
      })
      .then(function (response) {
          localStorage.setItem("token", response.data.data.auth_token);
          window.location.href = "/";
        })
        .catch(function (error) {
          window.location.href = "/login.html";
          throw error;
        });
    },
  });
});

