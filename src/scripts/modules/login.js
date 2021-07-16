import Api from "../../utils/axios";
import toastr from "toastr";

$(document).ready(function () {
  $("#loginForm").validate({
    submitHandler: function () {
      Api.post("/sign_in", {
        user: { email: $("#email").val(), password: $("#password").val() },
      })
        .then(function (response) {
          toastr.success("Login Success", "Success");
          setTimeout(() => {
            localStorage.setItem("token", response.data.auth_token);
            window.location.href = "/";
          }, 1000);
        })
        .catch(function () {
          toastr.error("Signin failed", "Error");
          // window.location.href = "/login.html";
          // throw error;
        });
    },
  });
});
