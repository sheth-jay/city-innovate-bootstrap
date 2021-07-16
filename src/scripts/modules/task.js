import Api from "../../utils/axios";
import { getFormattedDateAndClass } from "../../utils/index";
import moment from "moment";
import Quill from "quill";
import "quill-mention";

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

let paginationData = {
  current_page: 1,
  next_page: 2,
  total_count: 0,
  total_pages: 0,
};
var editor;
let taskDetails;
let drawerUserUpdate = [];
const atValues = [
  { id: 1, value: "Fredrik Sundqvist" },
  { id: 2, value: "Patrik Sjölin" },
];
const hashValues = [
  { id: 3, value: "Fredrik Sundqvist 2" },
  { id: 4, value: "Patrik Sjölin 2" },
];
$(document).ready(function () {
  $("#solicitationButton").click(filterClick);
  $("#labelButton").click(filterClick);
  $("#assignedButton").click(filterClick);
  $("#documentButton").click(filterClick);

  $("#sort_title").click(sortTable);
  $("#sort_labels").click(sortTable);
  $("#sort_assigness").click(sortTable);
  $("#doComment").click(doComment);
  $("#search_query").change(searchQuery);
  if (localStorage.getItem("token")) {
    getSolicitationList();
    getLabels();
    getUsers();
    getTasks();
    getDocuments();
    editor = new Quill("#editor", {
      modules: {
        toolbar: toolbarOptions,
        mention: {
          allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
          mentionDenotationChars: ["@", "#"],
          source: function (searchTerm, renderList, mentionChar) {
            let values;

            if (mentionChar === "@") {
              values = atValues;
            } else {
              values = hashValues;
            }

            if (searchTerm.length === 0) {
              renderList(values, searchTerm);
            } else {
              const matches = [];
              for (let i = 0; i < values.length; i++)
                if (
                  ~values[i].value
                    .toLowerCase()
                    .indexOf(searchTerm.toLowerCase())
                )
                  matches.push(values[i]);
              renderList(matches, searchTerm);
            }
          },
        },
      },
      theme: "snow",
    });
  } else {
    if (window.location.pathname !== "/login.html") {
      window.location.href = "/login.html";
    }
  }
});

// async function suggestPeople(searchTerm) {
//   const allPeople = [
//     {
//       id: 1,
//       value: "Fredrik Sundqvist",
//     },
//     {
//       id: 2,
//       value: "Patrik Sjölin",
//     },
//   ];
//   return allPeople.filter((person) => person.value.includes(searchTerm));
// }
function doComment() {
  var html = editor.root.innerHTML;
  Api.post(`/tasks/${taskDetails.id}/comments`, {
    comment: { comment: html },
  })
    .then(function () {
      getTaskDetails(taskDetails.id);
      editor.setContents([{ insert: "\n" }]);
    })
    .catch(function (error) {
      localStorage.removeItem("token");
      window.location.reload();
      throw error;
    });
  return html;
}
function constructPagination(paginationData) {
  $("#initPagination").nextAll().remove();
  let paginationArr = [];
  for (
    let i = paginationData.current_page;
    i <= paginationData.current_page + 2 && i <= paginationData.total_pages;
    i++
  ) {
    paginationArr.push(i);
  }
  if (paginationArr.length < 3) {
    for (let i = 1; i < 3; i++) {
      if (paginationArr.length < 3 && paginationData.total_pages > 2) {
        paginationArr.unshift(paginationArr[0] - 1);
      }
    }
  }
  paginationArr.reverse();
  for (let i = 0; i < paginationArr.length; i++) {
    $("#initPagination").after(
      `<li class="page-item ${
        paginationData.current_page === paginationArr[i] ? "active" : ""
      }"><a class="page-link" href="#" id="page_${paginationArr[i]}">${
        paginationArr[i]
      }</a></li>`
    );

    document
      .getElementById(`page_${paginationArr[i]}`)
      .addEventListener("click", changePagination);
  }
  $(`#paginationId`).append(
    `<li class="page-item"><a class="page-link" href="#" id="nextPage">Next</a></li>`
  );
  $("#previousPage").click(previousPage);
  $("#nextPage").click(nextPage);
}
function nextPage() {
  if (paginationData.current_page === paginationData.total_pages) {
    return;
  }
  paginationData.current_page = paginationData.current_page + 1;
  getTasks();
}
function previousPage() {
  if (paginationData.current_page === 1) {
    return;
  }
  paginationData.current_page = paginationData.current_page - 1;
  getTasks();
}
function changePagination(event) {
  paginationData.current_page = event.target.id.split("_")[1];
  getTasks("");
  return;
}

function searchQuery(event) {
  getTasks(`&query=${event.target.value}`);
}

function getTasks(taskurl = "") {
  $("#page-loader").show();
  Api.get(`/tasks?page=${paginationData.current_page}${taskurl}`)
    .then(function (response) {
      paginationData = response.meta_key;
      response.data.reverse();
      $("#initTable").nextAll().remove();
      $("#page-loader").hide();
      constructPagination(paginationData);

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
        <span class="table-desc">${
  response.data[i].title
}</span> <span class="new tag">New</span
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
    .catch(function () {
      localStorage.removeItem("token");
      window.location.reload();
    })
    .then(function () {
      // always executed
    });
}

function getTaskDetails(id) {
  $("#page-loader").show();
  Api.get(`/tasks/${id}`)
    .then(function (response) {
      $("#drawerTitle").text(response.data.title);
      taskDetails = response.data;
      let assigneeHtml = "";
      let userList = "";
      try {
        for (let i = 0; i < filterData.assignedTos.length; i++) {
          userList =
            userList +
            `<li class="checkbox-item">
              <span class="form-check">
                <span class="customChek-container">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    value=""
                    id="user_${filterData.assignedTos[i].id}"
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
                    ><img src="${filterData.assignedTos[i].avatar}" alt="user"
                  /></span>
                  <span class="profile-text">
                    <span class="name">${filterData.assignedTos[i].full_name}</span>
                    <span class="email">${filterData.assignedTos[i].email}</span>
                  </span>
                </span>
              </span>
              <span class="count">12</span>
              </li>`;
        }
        for (let i = 0; i < response.data.assignees.length; i++) {
          let firstDiv =
            i === response.data.assignees.length - 1
              ? `<div class="add-tag">`
              : ``;
          let secondaryDiv =
            i === response.data.assignees.length - 1
              ? `<div class="dropdown filter-dropdown add-icon">
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
              ${userList}
            <li>
              <span class="form-btns">
                <button class="btn theme-btn" type="button" id="drawerUserUpdateCall">
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

          assigneeHtml =
            assigneeHtml +
            `${firstDiv}<div class="delete-opt">
          <div class="userImg">
            <img src="${response.data.assignees[i]?.avatar}" alt="assignee1" />
          </div>
          <span>${response.data.assignees[i].full_name}</span>
          <a  class="crossIcon" >
            <img src="./../images/circle-close.svg" id="remove_${response.data.assignees[i].id}"/>
          </a>
        </div>${secondaryDiv}
        `;
        }
        $("#drawerassignee").html(assigneeHtml);
        // setTimeout(() => {
        for (let j = 0; j < filterData.assignedTos.length; j++) {
          document
            .getElementById(`user_${filterData.assignedTos[j].id}`)
            .addEventListener("change", userSelectionUpdate);
        }

        for (let j = 0; j < response.data.assignees.length; j++) {
          document
            .getElementById(`remove_${response.data.assignees[j].id}`)
            .addEventListener("click", removeUserSelection);
        }

        // }, 1000);

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

        let comments = "";
        for (let i = 0; i < response.data.comments.length; i++) {
          comments =
            comments +
            `<div class="userlist-item">
            <div class="profile-info">
              <div class="profile-info-img">
                <img src="${response.data.comments[i]?.commentor_avatar}" />
              </div>

              <div class="profileText">
                <p><span>${response.data.comments[i]?.user_name}</span></p>
                <p>
                  ${response.data.comments[i]?.comment}
                </p>
                <span>${moment(response.data.comments[i]?.created_at).format(
    "LLLL"
  )}</span>
              </div>
            </div>
            </div>`;
        }
        $("#commentSection").html(comments);
      } catch (error) {
        return error;
      }
    })

    .catch(function () {})
    .then(function () {
      // always executed
      $("#drawerUserUpdateCall").click(updateTaskCall);
      $("#page-loader").hide();
    });
}

function userSelectionUpdate(event) {
  drawerUserUpdate.push(event.target.id.split("_")[1]);
}
function removeUserSelection(event) {
  let filteredTaskAssignee = taskDetails.assignees.filter(
    (e) => e.id !== event.target.id.split("_")[1]
  );
  filteredTaskAssignee.forEach((e) => {
    drawerUserUpdate.push(e.id);
  });
  removeCall();
}

function updateTaskCall() {
  try {
    if (drawerUserUpdate.length === 0) {
      return;
    }
    for (let i = 0; i < taskDetails.assignees.length; i++) {
      drawerUserUpdate.push(taskDetails.assignees[0].id);
    }
    const formData = new FormData();
    for (let i = 0; i < drawerUserUpdate.length; i++) {
      formData.append("task[user_ids][]", drawerUserUpdate[i]);
    }
    Api.patch(`/tasks/${taskDetails.id}`, formData)
      .then(() => {
        drawerUserUpdate = [];
        getTaskDetails(taskDetails.id);
      })
      .catch(() => {});
  } catch (error) {
    return error;
  }
}

function removeCall() {
  try {
    if (drawerUserUpdate.length === 0) {
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < drawerUserUpdate.length; i++) {
      formData.append("task[user_ids][]", drawerUserUpdate[i]);
    }
    Api.patch(`/tasks/${taskDetails.id}`, formData)
      .then(() => {
        drawerUserUpdate = [];
        getTaskDetails(taskDetails.id);
      })
      .catch(() => {});
  } catch (error) {
    return error;
  }
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
        $("#solicitations").append(`
          <option value=${response.data[i].id}>${response.data[i].name}</option>
        `);
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
        $("#labels").append(`
        <option value=${response.data[i].id}>${response.data[i].name}</option>
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
        $("#assignees").append(`
        <option value=${response.data[i].id}>${response.data[i].full_name}</option>
      `);
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
    url2 = `&label=${JSON.stringify(constructLabels)}`;
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
