import Api from "../../utils/axios";

$(document).ready(function () {
  let fileList;

  $("#upload_document").change(function (event) {
    const files = event.target.files;
    fileList = {
      files,
    };
    $("#upload_document_label").html(event.target.files[0].name);
  });

  $("#createTaskForm").validate({
    submitHandler: function () {
      const formData = new FormData();
      $("#labels")
        .val()
        .forEach((element) => {
          formData.append("task[label_ids][]", element);
        });
      $("#assignees")
        .val()
        .forEach((element) => {
          formData.append("task[user_ids][]", element);
        });
      $("#solicitations")
        .val()
        .forEach((element) => {
          formData.append("task[solicitation_ids][]", element);
        });
      Array.from(fileList.files).forEach((file) => {
        formData.append("task[documents_attributes][]", file);
      });

      formData.append("task[title]", $("#title").val());
      formData.append("task[description]", $("#description").val());
      formData.append("task[due_date]", $("#due_date").val());

      Api.post("/tasks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then(function () {
          window.location.href = "/";
        })
        .catch(function (error) {
          window.location.href = "/login.html";
          throw error;
        });
    },
  });
});
