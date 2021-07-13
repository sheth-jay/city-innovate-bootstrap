import axios from "axios";
import { BaseAPIURL } from "../../utils/config";

$(document).ready(function () {
  //   $("#commentForm").submit(function (event) {
  //     event.preventDefault();
  //     $("#commentForm").validate();
  //     console.log("evebt", $("#commentForm").validate());
  //     alert("Submitted");
  //   });
  $("#commentForm").validate({
    submitHandler: function () {
      // some other code
      // maybe disabling submit button
      // then:
      axios
        .post(`${BaseAPIURL}/sign_in`, {
          user: { email: "mitul@gmail.com", password: 123456 },
        })
        .then(function (response) {
          localStorage.setItem("token", response.data.data.auth_token);
          window.location.href = "/";
        })
        .catch(function (error) {
          window.location.href = "/login";
          throw error;
        });
      alert("here");
      //   $(form).submit();
    },
  });
});
