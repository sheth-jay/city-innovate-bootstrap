import Quill from "quill";

import Api from "../../utils/axios";

$(document).ready(function () {
  let fileList;

  var toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],
  
    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction
  
    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
  
    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],
  
    ["clean"], // remove formatting button
  ];

  const editor = new Quill("#description", {
    modules: { toolbar: toolbarOptions },
    theme: "snow",
  });

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
      const html = editor.root.innerHTML;
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
      formData.append("task[description]", html);
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

  $(".btn-cancel").click(function () {
    $(".create-task-drawer").removeClass("drawer-closed");
    return false;
  });
});
