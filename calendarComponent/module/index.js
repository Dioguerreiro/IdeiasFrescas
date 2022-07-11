const response = await fetch('../test.json');
const data = await response.json();

var dataset = new vis.DataSet();
var bookings = new vis.DataSet();

var arrayGroups = loadGroupsFromJSON(data.categories);
dataset.add(arrayGroups);

var rooms = loadRoomsFromJSON(data.rooms);
dataset.add(rooms);

bookings.add(loadReservationsFromJSON(data.reservations));

//----------------------------- ESPECIFICAR AS OPÇÕES -----------------------------
var startingDate = new Date();
startingDate.setDate(startingDate.getDate() - 10);
var endingDate = new Date();
endingDate.setDate(endingDate.getDate() + 10);

var options = {
  stack: true,
  horizontalScroll: true,
  zoomKey: "ctrlKey",
  maxHeight: 600,
  start: startingDate,
  end: endingDate,
  editable: false,
  selectable: false,
  margin: {
    item: 10, // minimal margin between items
    axis: 5, // minimal margin between items and the axis
  },
  orientation: "top",
  showTooltips: true,
  tooltip: {
    followMouse: true,
  }
};

// Criação da Timeline
var container = document.getElementById("visualization");
var timeline = new vis.Timeline(container, bookings, dataset, options);

// Obter os Grupos e Quartos iniciais para colorcar nas selectbox
getGroups();
getRooms();


//----------------------------- OBTER GRUPOS DO JSON -----------------------------
function loadGroupsFromJSON(categories) {
  
  var arr = [];

  for (var i = 0; i < categories.length; i++) {

    var idToAdd = categories[i].id;
    var groupName = categories[i].groupName;
    var roomsInGroup = categories[i].roomsInGroup;
    
    var groupToAdd = {
      id: idToAdd,
      content: groupName,
      nestedGroups: roomsInGroup,
      style: "background-color: rgba(207, 207, 207, 0.7);"
    }

    bookings.add(
      {
        group: idToAdd,
        start: "1500-10-30 00:00",
        end: "2500-10-30 00:00",
        type: "background",
        className: "zebra",
      }); 

    arr.push(groupToAdd);
  }

  return arr;

}

//----------------------------- OBTER QUARTOS DO JSON -----------------------------
function loadRoomsFromJSON(rooms) {

  var arr = [];

  var id = dataset.length;

  for (var i = 0; i < rooms.length; i++) {

    var roomName = rooms[i].roomName;
    var roomColor = rooms[i].roomColor;

    var roomToAdd = {
      id: id,
      content: roomName,
      roomColor: roomColor
    };

    arr.push(roomToAdd);

    id++;
  }

  return arr;

}

//----------------------------- OBTER RESERVAS DO JSON -----------------------------
function loadReservationsFromJSON(bookings) {

  var arr = [];

  for (var i = 0; i < bookings.length; i++) {

    var idToAdd = bookings[i].id;
    var roomId = bookings[i].roomId;
    var clientName = bookings[i].clientName;
    var reservationStartDate = new Date(bookings[i].reservationStartDate);
    var reservationEndDate = new Date(bookings[i].reservationEndDate);
    var diffTime = Math.abs(reservationEndDate - reservationStartDate);
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    var titleToAdd =
      '<div class="row" style="background-color: #fff;"><div class="col-6"><b style="border-bottom: solid; border-color: #cfcfcf; padding: 2px;">' +
      clientName +
      "</b><div>Entrada: " +
      reservationStartDate.toLocaleDateString() +
      "</div><div>Saída: " +
      reservationEndDate.toLocaleDateString() +
      "</div><div><b>Duração: </b>" +
      diffDays +
      " dias</div></div></div>";

    // Cor do quarto selecionado
    var room = dataset.get(parseInt(roomId));
    var reservationStyle = "color: white; border: none; border-radius: 5px; background-color: " + room.roomColor;

    var itemToAdd = {
      id: idToAdd,
      group: roomId,
      content: clientName,
      start: reservationStartDate,
      end: reservationEndDate,
      title: titleToAdd,
      style: reservationStyle,
    };

    arr.push(itemToAdd);
   
  }
  return arr;
}


//----------------------------- ADICIONAR GRUPO -----------------------------
function addGroup(groupName) {

  const groupsList = dataset.get();

  var id = dataset.length;

  if (groupsList.some(e => e.content.toLowerCase() === groupName.toLowerCase())) {
    alert("Por favor insira outro nome. Este já existe");
  } else {
    // Adicionar grupo ao Dataset
    dataset.add(
      {
        id: id,
        content: groupName,
        nestedGroups: [],
        style: "background-color: rgba(207, 207, 207, 0.7);",
      }
    );

    bookings.add(
      {
        group: id,
        start: "1500-10-30 00:00",
        end: "2500-10-30 00:00",
        type: "background",
        className: "zebra",
      }
    );

    //Adicionar grupo à selectbox da criação de quartos
    var groupOptionList = document.querySelector('#room-group');
    let option = document.createElement('option');
    option.text = groupName;
    option.value = id;
    groupOptionList.appendChild(option);
  }

}

//----------------------------- ADICIONAR QUARTO -----------------------------

function addRoom(roomName, roomGroup, roomColor) {

  var id = dataset.length;

  if (dataset.get().some(e => e.content.toLowerCase() === roomName.toLowerCase())) {
    alert("Por favor insira outro nome. Este já existe.");
  } else {
    // Caso o quarto não seja para adicionar a um grupo
    if (roomGroup === "nothing") {
      dataset.add(
        {
          id: id,
          content: roomName,
          roomColor: roomColor
        });
    } else {
      // Caso o quarto seja para adicionar a um grupo, adicionamos o id do quarto ao campo nestedGroups do grupo
      dataset.get(parseInt(roomGroup)).nestedGroups.push(parseInt(id));
      dataset.add(
        {
          id: id,
          content: roomName,
          roomColor: roomColor,
          
        });
    }

    //Adicionar quarto à selectbox da criação de reservas
    var roomOptionList = document.querySelector('#room');
    let option = document.createElement('option');
    option.text = roomName;
    option.value = id;
    roomOptionList.appendChild(option);
  }
}

//----------------------------- ADICIONAR RESERVA -----------------------------
function addReservation(clientName, reservationStartDate, reservationEndDate, roomId) {

  if (getReservationsFromRoomX(roomId, reservationStartDate, reservationEndDate)) {
    // Se o intervalo de datas coincidir com um já existente
    alert("Já existe uma reserva neste intervalo de datas.");
  } else {
    var idToAdd = bookings.length;
    var diffTime = Math.abs(reservationEndDate - reservationStartDate);
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    var titleToAdd =
      '<div class="row" style="background-color: #fff;"><div class="col-6"><b style="border-bottom: solid; border-color: #cfcfcf; padding: 2px;">' +
      clientName +
      "</b><div>Entrada: " +
      reservationStartDate.toLocaleDateString() +
      "</div><div>Saída: " +
      reservationEndDate.toLocaleDateString() +
      "</div><div><b>Duração: </b>" +
      diffDays +
      " dias</div></div></div>";

    // Cor do quarto selecionado
    var room = dataset.get(parseInt(roomId));
    var reservationStyle = "color: white; border: none; border-radius: 5px; background-color: " + room.roomColor;

    var itemToAdd = {
      id: idToAdd,
      group: roomId,
      content: clientName,
      start: reservationStartDate,
      end: reservationEndDate,
      title: titleToAdd,
      style: reservationStyle,
    };

    timeline.itemsData.add(itemToAdd);
  }
}

//----------------------------- OBTER GRUPOS -----------------------------
// Filtra a lista de componentes para aparecer apenas os grupos. Nota: apenas os grupos têm o campo style
function getGroups() {

  const allGroups = dataset.get();
  var filteredGroups = [];

  for (let i = 0; i < allGroups.length; i++) {
    if (allGroups[i].hasOwnProperty('style')) {
      filteredGroups.push(allGroups[i]);
    }
  }

  //Adicionar grupos à selectbox no adicionar quarto
  var groupOptionList = document.querySelector('#room-group').options;

  filteredGroups.forEach(filteredGroup =>
    groupOptionList.add(
      new Option(filteredGroup.content, filteredGroup.id)
    )
  );
}


//----------------------------- OBTER QUARTOS -----------------------------
// Filtra a lista de componentes para aparecer apenas os quartos. Nota: apenas os quarto têm o campo roomColor
function getRooms() {

  const allRooms = dataset.get();
  const filteredRooms = [];

  for (let i = 0; i < allRooms.length; i++) {
    if (allRooms[i].hasOwnProperty('roomColor')) {
      filteredRooms.push(allRooms[i]);
    }
  }

  //Adicionar quartos à selectbox no adicionar reserva 
  var roomOptionList = document.querySelector('#room').options;

  filteredRooms.forEach(filteredRoom =>
    roomOptionList.add(
      new Option(filteredRoom.content, filteredRoom.id)
    )
  );
}


//----------------------------- OBTER RESERVAS DO QUARTO X -----------------------------
//Filtra as reservas do quarto X e verifica se existe alguma sobreposição de datas entre as reservas existentes e a reserva a ser feita
function getReservationsFromRoomX(roomId, sDate, eDate) {

  var toggle = false;

  var allItems = bookings.get();
  var reservations = [];

  for (let i = 0; i < allItems.length; i++) {
    if (allItems[i].hasOwnProperty('content')) {
      if (allItems[i].group == roomId) {
        reservations.push(allItems[i]);
      }
    }
  }
  for (let x = 0; x < reservations.length; x++) {
    if ((intercept(sDate, eDate, reservations[x].start, reservations[x].end))) { toggle = true; };
  }

  return toggle;
}

//Função que verifica a sobreposição das datas das reservas
function intercept(start1, end1, start2, end2) {
  return (Math.max(0, Math.min(end2, end1) - Math.max(start1, start2) + 1)) > 0
}

export { addGroup, addRoom, addReservation };

