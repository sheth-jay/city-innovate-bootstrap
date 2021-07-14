jQuery(document).ready(function () {
  //checkbox

  $(".form-check-input")
    .change(function () {
      $(this).closest(".checkbox-item").toggleClass("li-checked", this.checked);
    })
    .change();

  // See Detail Drawer
  $(".see-detail-link").click(function () {
    $(".see-detail-drawer").addClass("drawer-closed");
    return false;
  });
  $(".close-drawer").click(function () {
    $(".see-detail-drawer").removeClass("drawer-closed");
    return false;
  });

  // Create Task Drawer
  $("#create-task-drawerOpener").click(function () {
    $(".create-task-drawer").addClass("drawer-closed");
    return false;
  });
  $(".close-task-drawer").click(function () {
    $(".create-task-drawer").removeClass("drawer-closed");
    return false;
  });


  $('.multi-select').select2({
    maximumSelectionLength: 5
  });
  
});
