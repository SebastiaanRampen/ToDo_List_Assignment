const address = "http://localhost:3000/";
const toDoList = document.getElementById("to_do_list"); // ul-class that contains the ToDo list
const toDoField = document.getElementById("new_to_do"); // text-field
// used when a ToDo-text gets modified

let dataArray = []; // array that contains the ToDo-objects from the API; gets updated
let modifyLabel = false; // indicates when the 'ToDoField' is shown to modify a ToDo-text

let li, // ToDo ListItem
  label, // Label-tag; here, the task gets displayed
  chkBx, // CheckBox tag
  trashBin, // Trashbin icon
  //
  id, // ID from ToDo object, created in the API
  arrayItemNr, // Position of the object in the Array
  labelText, // ToDo text, which gets displayed in the label
  toDoText, // Text, entered in Text-field in the header, to be added to the list
  labelInput = ""; // input Text-field in which ToDo-text can be modified

const newBranch = () => {
  // function to create a new ToDo-branch with CheckBox, Label and Trashbin,
  // and adds the event-handlers on those
  li = document.createElement("li");
  li.setAttribute("class", "to_do_item");
  chkBx = document.createElement("input");
  chkBx.setAttribute("type", "checkbox");
  chkBx.addEventListener("click", function (e) {
    changeCheckBox(e);
  });
  label = document.createElement("label");
  label.addEventListener("dblclick", function (e) {
    changeLabel(e);
  });
  trashBin = document.createElement("i");
  trashBin.setAttribute("class", "fa-solid fa-trash-can");
  trashBin.addEventListener("click", function (e) {
    removeToDo(e);
  });

  li.appendChild(chkBx);
  li.appendChild(label);
  li.appendChild(trashBin);
  toDoList.appendChild(li);
};

const removeToDo = async (e) => {
  // removes task from the list
  li = e.target.parentElement;
  id = li.id;
  li.parentNode.removeChild(li);
  arrayItemNr = dataArray.findIndex((x) => x._id === id);
  dataArray.splice(arrayItemNr, 1);

  const removeAPI = async () => {
    try {
      return await fetch(address + id, {
        method: "DELETE",
      });
    } catch (error) {
      console.log(error);
    }
  };
  await removeAPI();
};

const changeCheckBox = async (e) => {
  // Modifies data when CheckBox is checked or unchecked
  chkBx = e.target;
  li = chkBx.parentElement;
  id = li.id;
  arrayItemNr = dataArray.findIndex((x) => x._id === id);
  dataArray[arrayItemNr].done = chkBx.checked;

  let modifyData = dataArray[arrayItemNr];
  modifyData.done = chkBx.checked;
  const labelText = dataArray[arrayItemNr].description;

  const changeStripeThrough = () => {
    // creates stripethrough text when task is done
    // normal text when task is still undone
    label = li.getElementsByTagName("label")[0];
    if (modifyData.done) {
      label.innerHTML = "<del>" + labelText + "</del>";
    } else {
      label.innerHTML = labelText;
    }
  };
  changeStripeThrough();

  const modifyAPI = async () => {
    try {
      return await fetch(address + id, {
        method: "PUT",
        body: JSON.stringify(modifyData),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  modifyAPI();
};

const changeLabel = async (e) => {
  // Enables user to change ToDo text
  label = e.target;
  if (label.tagName === "DEL") {
    label = label.parentElement;
  }
  li = label.parentElement;
  id = li.id;
  arrayItemNr = dataArray.findIndex((x) => x._id === id);
  let modifyData = dataArray[arrayItemNr];

  labelText = dataArray[arrayItemNr].description;
  trashBin = li.getElementsByTagName("i")[0];
  li.removeChild(label);
  li.removeChild(trashBin);
  labelInput = document.createElement("input");
  labelInput.setAttribute("type", "text");
  labelInput.setAttribute("id", "label_input");
  labelInput.value = labelText;
  li.appendChild(labelInput);
  li.appendChild(trashBin);
  labelInput.focus();
  modifyLabel = true;
  labelInput.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      labelText = labelInput.value;
      modifyData.description = labelText;

      li.removeChild(labelInput);
      li.removeChild(trashBin);
      if (modifyData.done) {
        label.innerHTML = "<del>" + labelText + "</del>";
      } else {
        label.innerHTML = labelText;
      }
      li.appendChild(label);
      li.appendChild(trashBin);
      modifyLabel = false;

      dataArray[arrayItemNr].description = labelText;
      const modify = async () => {
        try {
          await fetch(address + id, {
            method: "PUT",
            body: JSON.stringify(modifyData),
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.log(error);
        }
      };
      modify();
    }
  });
};

const stopChangeLabel = () => {
  // Stops enabling user to modify ToDo-task, without changing the content
  if (modifyLabel === true) {
    if (document.activeElement !== labelInput) {
      li.removeChild(labelInput);
      li.removeChild(trashBin);
      li.appendChild(label);
      li.appendChild(trashBin);
      modifyLabel = false;
    }
  }
};

const showSavedData = () => {
  dataArray.forEach((item) => {
    newBranch();
    li.setAttribute("id", item._id);
    chkBx.checked = item.done;
    if (item.done) {
      label.innerHTML = "<del>" + item.description + "</del>";
    } else {
      label.innerHTML = item.description;
    }
  });
};

const getData = async () => {
  try {
    return await (
      await fetch(address, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    ).json();
  } catch (error) {
    console.log(error);
  }
};

const dataFromAPI = async () => {
  dataArray = await getData();
  showSavedData();
};

const addToDo = async () => {
  // add new ToDo-task to the list
  if (toDoText !== "New Task") {
    newBranch();
    chkBx.checked = false;
    label.innerHTML = toDoText;

    const submitData = { description: toDoText, done: false };
    const sendNewToDo = async () => {
      try {
        return await fetch(address, {
          method: "POST",
          body: JSON.stringify(submitData),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.log(error);
      }
    };
    sendNewToDo();
    dataArray = await getData(); // is er een betere manier
    // om de nieuw-gegenereerde '_id' te krijgen?
    li.setAttribute("id", dataArray.at(-1)._id);
  }
};

toDoField.addEventListener("keyup", function (e) {
  // Checks input in TextField for new ToDo-tasks.
  toDoText = toDoField.value;
  if (e.key === "Enter") {
    if (toDoText !== "") {
      addToDo();
    }
  } else {
    if (dataArray.some((object) => object.description === toDoText)) {
      toDoField.style.backgroundColor = "lightpink";
    } else {
      toDoField.style.backgroundColor = "white";
    }
  }
});

dataFromAPI();

document.querySelector(".add_to_do_btn").addEventListener("click", addToDo);
document.addEventListener("click", stopChangeLabel);
