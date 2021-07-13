jQuery(document).ready(function () {
  //checkbox

  $(".form-check-input")
    .change(function () {
      $(this).closest(".checkbox-item").toggleClass("li-checked", this.checked);
    })
    .change();

  //
  $("#drawerOpener").click(function () {
    $(".see-detail-drawer").addClass("drawer-closed");
    return false;
  });
  $(".close-drawer").click(function () {
    $(".see-detail-drawer").removeClass("drawer-closed");
    return false;
  });
});
