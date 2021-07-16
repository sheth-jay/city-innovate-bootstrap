import Api from '../../utils/axios';

$(document).ready(function () {
  let fileList = {};

  $('#upload_avatar').change(function (e) {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      fileList = {
        file: file,
        imagePreviewUrl: reader.result
      };
      $("#avatar").attr('src',fileList.imagePreviewUrl);
    }
    reader.readAsDataURL(file);
  });

  $("#signupForm").validate({
    submitHandler: function () {
      const userDetails = new FormData();
      userDetails.append('user[avatar]', fileList.file);
      userDetails.append('user[first_name]', $('#first_name').val());
      userDetails.append('user[last_name]', $('#last_name').val());
      userDetails.append('user[email]', $('#email').val());
      userDetails.append('user[password]', $('#password').val());
      userDetails.append('user[confirm_password]', $('#confirm_password').val());

      Api
        .post('/sign_up', userDetails, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(function () {
          window.location.href = "/login.html";
        })
        .catch(function (error) {
          window.location.href = "/login.html";
          throw error;
        });
    },
  });
});

