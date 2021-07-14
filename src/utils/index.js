import moment from "moment";

const dateInPast = (firstDate, secondDate) => {
  if (firstDate.setHours(0, 0, 0, 0) < secondDate.setHours(0, 0, 0, 0)) {
    return true;
  }

  return false;
};

const dateInFuture = (firstDate, secondDate) => {
  if (firstDate.setHours(0, 0, 0, 0) > secondDate.setHours(0, 0, 0, 0)) {
    return true;
  }

  return false;
};

export const getFormattedDateAndClass = (date) => {
  const today = new Date();
  let dueDateClass = "green";
  let dueDate = "Today";

  const taskDate = new Date(date);
  const pastDate = dateInPast(taskDate, today);
  const futureDate = dateInFuture(taskDate, today);

  if (futureDate || pastDate) {
    dueDate = moment(new Date(date)).format("MMM DD");
    if (futureDate) {
      dueDateClass = "grey";
    } else {
      dueDateClass = "red";
    }
  }
  return { dueDateClass, dueDate };
};
