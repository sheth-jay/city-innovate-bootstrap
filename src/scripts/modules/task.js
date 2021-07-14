import Api from "../../utils/axios";
import { getFormattedDateAndClass } from "../../utils/index";
$(document).ready(function () {
  //   $("#commentForm").submit(function (event) {
  //     event.preventDefault();
  //     $("#commentForm").validate();
  //     console.log("evebt", $("#commentForm").validate());
  //     alert("Submitted");
  //   });

  //   let filterData = {
  //     solicitation: "",
  //     labels: "",
  //     document: "",
  //     assignedTo: "",
  //     thisWeek: "",
  //   };

  getSolicitationList();
  getLabels();
  getUsers();
  getTask();
});

function getTask() {
  Api.get(`/tasks?page=1`)
    .then(function (response) {
      response.data.reverse();
      for (let i = 0; i < response.data.length; i++) {
        let images = "";
        for (let j = 0; j < response.data[i].assignees.length; j++) {
          images =
            images +
            `<img src="${response.data[i].assignees[j].avatar}" width="26"/>`;
        }
        let labels = "";
        for (let j = 0; j < response.data[i].labels.length; j++) {
          labels =
            labels +
            `<span class="tag">${response.data[i].labels[j].name}</span>`;
        }

        let date = getFormattedDateAndClass(response.data[i].due_date);
        $("#initTable").after(`<tr>
        <td><input type="checkbox" /></td>
        <td>
          ${response.data[i].title} <span class="new tag">New</span>
          <a href="javascript:void(0);" class="see-detail-link">
          See Details 
          <img src="./../images/arrow.png" alt="arrow"/></a>
        </td>
        <td>${response.data[i]?.documents[0]?.name?.split(".")[0] || ""}</td>
        <td>
          <span class="tag blue">4.1 Informational Attatchments</span>
        </td>
        <td>
            ${labels}
        </td>
        <td class="user-images">
            ${images}
        </td>
        <td class="date ${date.dueDateClass}">${date.dueDate}</td>
      </tr>`);
      }
    })
    .catch(function () {})
    .then(function () {
      // always executed
    });
}

function getSolicitationList() {
  Api.get(`/solicitations`)
    .then(function (response) {
      response.data.reverse();
      for (let i = 0; i < response.data.length; i++) {
        $("#initSolicitation").after(`<li class="checkbox-item">
        <span class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckDefault"
          />
          <label
            class="form-check-label"
            for="flexCheckDefault"
          >
          ${response.data[i].name}
          </label>
        </span>
        <span class="count">${i + 1}</span>
      </li>`);
      }
    })
    .catch(function () {})
    .then(function () {
      // always executed
    });
}

function getLabels() {
  Api.get(`/labels`)
    .then(function (response) {
      response.data.reverse();
      for (let i = 0; i < response.data.length; i++) {
        $("#initlabels").after(`<li class="checkbox-item">
        <span class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckDefault"
          />
          <label
            class="form-check-label"
            for="flexCheckDefault"
          >
            ${response.data[i].name}
          </label>
        </span>
        <span class="count">${i + 1}</span>
      </li>`);
      }
    })
    .catch(function () {})
    .then(function () {
      // always executed
    });
}

function getUsers() {
  Api.get(`/users`)
    .then(function (response) {
      response.data.reverse();
      for (let i = 0; i < response.data.length; i++) {
        $("#initUsers").after(`<li class="checkbox-item">
        <span class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="${response.data[i].id}"

          />
          <span class="checkbox-profile">
            <span class="profile-img"
              ><img src=${response.data[i].avatar} alt="user" width="25"
            /></span>
            <span class="profile-text">
              <span class="name">${response.data[i].full_name}</span>
              <span class="email">${response.data[i].email}</span>
            </span>
          </span>
        </span>
        <span class="count">12</span>
      </li>`);
        document
          .getElementById(response.data[i].id)
          .addEventListener("change", callFunction);
      }
    })
    .catch(function () {})
    .then(function () {
      // always executed
    });
}

function callFunction() {
  debugger; // eslint-disable-line no-debugger
}
