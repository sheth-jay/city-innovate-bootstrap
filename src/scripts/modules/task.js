import Api from "../../utils/axios";
import { getFormattedDateAndClass } from "../../utils/index";
let initFilter = {
  solicitation: [],
  labels: [],
  document: [],
  assignedTo: [],
  thisWeek: [],
};
let filterData = {
  solicitations: [],
  labels: [],
  documents: [],
  assignedTos: [],
  thisWeeks: [],
};

let sortable = {
  sort_title: "asc",
  sort_assigness: "asc",
  sort_labels: "asc",
};

$(document).ready(function () {
  $("#solicitationButton").click(filterClick);
  $("#labelButton").click(filterClick);
  $("#assignedButton").click(filterClick);
  $("#documentButton").click(filterClick);

  $("#sort_title").click(sortTable);
  $("#sort_labels").click(sortTable);
  $("#sort_assigness").click(sortTable);

  getSolicitationList();
  getLabels();
  getUsers();
  getTasks();
  getDocuments();
});

function getTasks(taskurl = "") {
  Api.get(`/tasks?page=1${taskurl}`)
    .then(function (response) {
      response.data.reverse();
      $("#initTable").nextAll().remove();
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
        <td><span class="customChek-container">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckDefault"
          />
          <span class="customChek">
            <svg
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.21057 3.29835L3.91734 6.10537L8.78952 1.05273"
                stroke="white"
                stroke-width="2"
              />
            </svg>
          </span>
        </span></td>
        <td>
        <span class="table-desc">${response.data[i].title}</span> <span class="new tag">New</span
          ><a href="javascript:void(0);" class="see-detail-link" id="${
            response.data[i].id
          }"
            >See Details <img src="./../images/arrow.png" alt="arrow"
          /></a>
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
        document
          .getElementById(response.data[i].id)
          .addEventListener("click", seeDetails);
      }
    })
    .catch(function () {})
    .then(function () {
      // always executed
    });
}

function getTaskDetails(id) {
  Api.get(`/tasks/${id}`)
    .then(function (response) {
      console.log("response.data", response.data);
      $("#drawerTitle").text(response.data.title);
      let assigneeHtml = "";
      for (let i = 0; i < response.data.assignees.length; i++) {
        let firstDiv =
          i === response.data.assignees.length - 1
            ? `<div class="add-tag">`
            : ``;
        let secondaryDiv =
          i === response.data.assignees.length - 1
            ? `                      <div class="dropdown filter-dropdown add-icon">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            id="dropdownMenuButton1"
            data-toggle="dropdown"
            aria-expanded="false"
          >
            <img src="./../images/add-icon.svg" alt="add-icon"/>
          </button>
          <ul
            class="dropdown-menu"
            aria-labelledby="dropdownMenuButton1"
          >
            <li>
              <ul class="form-ul">
                <li class="searchInput">
                  <input
                    type="text"
                    placeholder="Search"
                    class="form-control"
                  />
                </li>
                <li class="checkbox-item">
                  <span class="form-check">
                    <span class="customChek-container">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        value=""
                        id="flexCheckDefault"
                      />
                      <span class="customChek">
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1.21057 3.29835L3.91734 6.10537L8.78952 1.05273"
                            stroke="white"
                            stroke-width="2"
                          />
                        </svg>
                      </span>
                    </span>
                    <span class="checkbox-profile">
                      <span class="profile-img"
                        ><img src="./../images/assignee1.png" alt="user"
                      /></span>
                      <span class="profile-text">
                        <span class="name">Britney Spurs</span>
                        <span class="email">britneyspurs@gmai</span>
                      </span>
                    </span>
                  </span>
                  <span class="count">12</span>
                </li>
              </ul>
            </li>

            <li>
              <span class="form-btns">
                <button class="btn theme-btn" type="button">
                  Save
                </button>
                <button
                  class="btn theme-btn transparent-btn"
                  type="button"
                >
                  Clear All
                </button>
              </span>
            </li>
          </ul>
        </div>
      </div>`
            : ``;
        debugger; // eslint-disable-line no-debugger
        assigneeHtml =
          assigneeHtml +
          `${firstDiv}<div class="delete-opt">
          <div class="userImg">
            <img src="${response.data.assignees[i]?.avatar}" alt="assignee1" />
          </div>
          <span>${response.data.assignees[i].full_name}</span>
          <a href="" class="crossIcon">
            <img src="./../images/circle-close.svg" />
          </a>
        </div>${secondaryDiv}
        `;
      }
      $("#drawerassignee").html(assigneeHtml);
      let date = getFormattedDateAndClass(response.data.due_date);
      $("#drawerDueDate").html(`<div class="dueDateClass">
      <img src="./../images/Calender.svg" /> ${date.dueDate}
       </div>`);
      let labelSpan = "";
      for (let i = 0; i < response.data.labels.length; i++) {
        labelSpan =
          labelSpan +
          `<span class="tags">${response.data.labels[i].name}</span>
        `;
      }
      $("#drawerLabel").html(labelSpan);
      let docName = response.data.documents[0]?.name.split(".")[0].trim();
      $("#documentName").text(docName || "");
      $("#drawerDescription").html(response.data?.description || "");
      $("#drawerStatus").text(
        response.data?.status === "incompleted" ? "In Progress" : "Completed"
      );
    })

    .catch(function () {})
    .then(function () {
      // always executed
    });
}

function seeDetails(event) {
  $(".see-detail-drawer").addClass("drawer-closed");
  getTaskDetails(event.target.id);
  return false;
}

function getSolicitationList() {
  Api.get(`/solicitations`)
    .then(function (response) {
      filterData.solicitations = response.data;
      response.data.reverse();
      for (let i = 0; i < response.data.length; i++) {
        $("#initSolicitation").after(`<li class="checkbox-item">
        <span class="form-check">
          <span class="customChek-container">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="${response.data[i].id}"
            />
            <span class="customChek">
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.21057 3.29835L3.91734 6.10537L8.78952 1.05273"
                  stroke="white"
                  stroke-width="2"
                />
              </svg>
            </span>
          </span>
          <label
            class="form-check-label"
            for="flexCheckDefault"
          >
          ${response.data[i].name}
          </label>
        </span>
        <span class="count">${i + 1}</span>
        </li>`);

        //   $("#initSolicitation").after(`<li class="checkbox-item">
        //   <span class="form-check">
        //     <input
        //       class="form-check-input"
        //       type="checkbox"
        //       value=""
        //       id="${response.data[i].id}"
        //     />
        //     <label
        //       class="form-check-label"
        //       for="flexCheckDefault"
        //     >
        //     ${response.data[i].name}
        //     </label>
        //   </span>
        //   <span class="count">${i + 1}</span>
        // </li>`);
        document
          .getElementById(response.data[i].id)
          .addEventListener("change", solicitationSelectClick);
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
      filterData.labels = response.data;
      response.data.reverse();
      for (let i = 0; i < response.data.length; i++) {
        $("#initlabels").after(`
        <li class="checkbox-item">
        <span class="form-check">
          <span class="customChek-container">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id=${response.data[i].id}
            />
            <span class="customChek">
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.21057 3.29835L3.91734 6.10537L8.78952 1.05273"
                  stroke="white"
                  stroke-width="2"
                />
              </svg>
            </span>
          </span>
          <label
            class="form-check-label"
            for="flexCheckDefault"
          >
          ${response.data[i].name}
          </label>
        </span>
        <span class="count">${i + 1}</span>
      </li>
        `);

        document
          .getElementById(response.data[i].id)
          .addEventListener("change", labelSelectClick);
      }
    })
    .catch(function () {})
    .then(function () {
      // always executed
    });
}

function getDocuments() {
  Api.get(`/documents`)
    .then(function (response) {
      filterData.documents = response.data;
      response.data.reverse();
      for (let i = 0; i < response.data.length; i++) {
        $("#initDocument").after(`<li class="checkbox-item">
        <span class="form-check">
          <span class="customChek-container">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="${response.data[i].id}"
            />
            <span class="customChek">
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.21057 3.29835L3.91734 6.10537L8.78952 1.05273"
                  stroke="white"
                  stroke-width="2"
                />
              </svg>
            </span>
          </span>
          <label
            class="form-check-label"
            for="flexCheckDefault"
          >
          ${response.data[i].name}
          </label>
        </span>
        <span class="count">${i + 1}</span>
      </li>`);
        document
          .getElementById(response.data[i].id)
          .addEventListener("change", documentSelectClick);
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
      filterData.assignedTos = response.data;
      response.data.reverse();
      for (let i = 0; i < response.data.length; i++) {
        $("#initUsers").after(`<li class="checkbox-item">
        <span class="form-check">
          <span class="customChek-container">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="${response.data[i].id}"
            />
            <span class="customChek">
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.21057 3.29835L3.91734 6.10537L8.78952 1.05273"
                  stroke="white"
                  stroke-width="2"
                />
              </svg>
            </span>
          </span>
          <span class="checkbox-profile">
            <span class="profile-img"
              ><img src="${response.data[i].avatar}" alt="user"
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
          .addEventListener("change", userSelectClick);
      }
    })
    .catch(function () {})
    .then(function () {
      // always executed
    });
}

function userSelectClick(event) {
  let index = initFilter.assignedTo.findIndex((e) => e === event.target.id);
  if (index > -1) {
    initFilter.assignedTo.splice(index, 1);
  } else {
    initFilter.assignedTo.push(event.target.id);
  }

  if (initFilter.assignedTo.length === 0) {
    $("#assignedDropDown").removeClass("btn-selected");
    $("#assignedTotalCount")?.remove();
  } else {
    $("#assignedDropDown").addClass("btn-selected");
    $("#assignedTotalCount")?.remove();
    $("#assignedTitle").after(
      `<span id="assignedTotalCount" class="totleCount">${initFilter.assignedTo.length} </span>`
    );
  }
}

function labelSelectClick(event) {
  let index = initFilter.labels.findIndex((e) => e === event.target.id);
  if (index > -1) {
    initFilter.labels.splice(index, 1);
  } else {
    initFilter.labels.push(event.target.id);
  }

  if (initFilter.labels.length === 0) {
    $("#labelDropDown").removeClass("btn-selected");
    $("#labelTotalCount")?.remove();
  } else {
    $("#labelDropDown").addClass("btn-selected");
    $("#labelTotalCount")?.remove();
    $("#labelTitle").after(
      `<span id="labelTotalCount" class="totleCount">${initFilter.labels.length} </span>`
    );
  }
}

function documentSelectClick(event) {
  let index = initFilter.document.findIndex((e) => e === event.target.id);
  if (index > -1) {
    initFilter.document.splice(index, 1);
  } else {
    initFilter.document.push(event.target.id);
  }

  if (initFilter.document.length === 0) {
    $("#documentDropDown").removeClass("btn-selected");
    $("#documentTotalCount")?.remove();
  } else {
    $("#documentDropDown").addClass("btn-selected");
    $("#documentTotalCount")?.remove();
    $("#documentTitle").after(
      `<span id="documentTotalCount" class="totleCount">${initFilter.document.length} </span>`
    );
  }
}

function solicitationSelectClick(event) {
  let index = initFilter.solicitation.findIndex((e) => e === event.target.id);
  if (index > -1) {
    initFilter.solicitation.splice(index, 1);
  } else {
    initFilter.solicitation.push(event.target.id);
  }
  if (initFilter.solicitation.length === 0) {
    $("#solicitationDropDown").removeClass("btn-selected");
    $("#solicitationTotalCount")?.remove();
  } else {
    $("#solicitationDropDown").addClass("btn-selected");
    $("#solicitationTotalCount")?.remove();
    $("#solicitationTitle").after(
      `<span id="solicitationTotalCount" class="totleCount">${initFilter.solicitation.length} </span>`
    );
  }
}

function filterClick() {
  let url1 = "";
  let url2 = "";
  let url3 = "";
  let url4 = "";

  if (initFilter.solicitation.length > 0) {
    let constructSolicitation = [];
    initFilter.solicitation.forEach((sol) => {
      let solData = filterData.solicitations.find((e) => e.id === sol);
      if (solData) {
        constructSolicitation.push(solData.name);
      }
    });
    url1 = `&solicitation=[${JSON.stringify(constructSolicitation)}]`;
  }
  if (initFilter.labels.length > 0) {
    let constructLabels = [];
    initFilter.labels.forEach((lab) => {
      let labData = filterData.labels.find((e) => e.id === lab);
      if (labData) {
        constructLabels.push(labData.name);
      }
    });
    url2 = `&labels=${JSON.stringify(constructLabels)}`;
  }
  if (initFilter.assignedTo.length > 0) {
    let constructAssigned = [];
    initFilter.assignedTo.forEach((ass) => {
      let assignedData = filterData.assignedTos.find((e) => e.id === ass);
      if (assignedData) {
        constructAssigned.push(assignedData.first_name);
      }
    });
    url3 = `&user=${JSON.stringify(constructAssigned)}`;
  }
  if (initFilter.document.length > 0) {
    let constructDocument = [];
    initFilter.document.forEach((doc) => {
      let docData = filterData.documents.find((e) => e.id === doc);
      if (docData) {
        constructDocument.push(docData.name.split(".")[0].trim());
      }
    });
    url4 = `&document=${JSON.stringify(constructDocument)}`;
  }
  let url = url1 + url2 + url3 + url4;
  getTasks(url);
}

function sortTable(event) {
  let target = sortable[event.target.id] === "asc" ? "desc" : "asc";
  sortable[event.target.id] = target;
  getTasks(`&${[event.target.id]}=${target}`);
}
