import { addGroup, addRoom, addReservation} from '../module/index.js';

//----------------------------- ADICIONAR GRUPO -----------------------------
var createGroupButton = document.querySelector('#create-group-button');
createGroupButton.addEventListener("click", function(event) {
  
  const groupName = document.querySelector('#recipient-group-name').value;

  if (groupName === "") {
    alert("Por favor insira o nome do grupo.");
  }

  addGroup(groupName);
  $("#addGroup").modal("hide");
});

//----------------------------- ADICIONAR QUARTO -----------------------------

var createRoomButton = document.querySelector('#create-room-button');
createRoomButton.addEventListener("click", function(event) {
  
  const roomName = document.querySelector('#recipient-room-name').value;
  const roomGroupName = document.querySelector('#room-group').value;
  const roomColor = document.querySelector('#hue-demo').value;

  if (roomName === "") {
    alert("Por favor insira o nome do quarto.");
  }

  addRoom(roomName, roomGroupName, roomColor);
  $("#addRoom").modal("hide");
});

//----------------------------- ADICIONAR RESERVA -----------------------------
var createReservation = document.querySelector("#create-reservation-button");
createReservation.addEventListener("click", function(event) {
  
  const clientName = document.querySelector("#recipient-reservation-name").value;
  const startDate = document.querySelector(".recipient-reservation-startDate").value;
  const endDate = document.querySelector(".recipient-reservation-endDate").value;
  const room = document.querySelector("#room").value;

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);

  if (clientName === "") {
    alert("Por favor insira o nome do cliente.")
  } else if (startDate === "") {
    alert("Por favor insira a data de entrada.")
  } else if (endDate === "") {
    alert("Por favor insira a data de saída.")
  } else if (eDate <= sDate) {
    alert("Por favor insira uma data de saída posterior à data de entrada.")
  } else {
    addReservation(clientName, sDate, eDate, room);
    $("#addReservation").modal("hide");
  }  
});

//----------------------------- TRIGGER DO BUTTON ENTER -----------------------------
$("body").on('keypress', ".modal-body input", function(e) {

  var keycode = (e.keyCode ? e.keyCode : e.which);

  if(keycode == '13'){
    e.preventDefault();
    let dismiss = $(this).closest('.modal-body').next().find('button[data-dismiss]');
    let modal = $(this).closest('.modal-body').next().find('button').not('button[data-dismiss]');
    
    if (modal.length){
      modal.trigger('click');
      setTimeout(function(){
        dismiss.trigger('click');
      })
    }    
  }
});
