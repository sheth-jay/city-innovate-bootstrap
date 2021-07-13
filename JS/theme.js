jQuery(document).ready(function () {
  //checkbox

  $(".form-check-input")
    .change(function () {
      $(this).closest(".checkbox-item").toggleClass("li-checked", this.checked);
    })
    .change();
});
