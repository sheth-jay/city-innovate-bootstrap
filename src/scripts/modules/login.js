import Api from '../../utils/axios';

$(document).ready(function () {
  $("#loginForm").validate({
    submitHandler: function () {
      Api
      .post('/sign_in', {
        user: { email: $('#email').val(), password: $('#password').val() },
      })
      .then(function (response) {
          localStorage.setItem("token", response.data.auth_token);
          window.location.href = "/";
        })
        .catch(function (error) {
          window.location.href = "/login.html";
          throw error;
        });
    },
  });
});

