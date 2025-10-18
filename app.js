// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  loadPatients();
  loadRooms();
  loadPatientsForAssign();
  loadRoomsForAssign();
});

// Patient Form
document.getElementById('patientForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('patientName').value;
  const age = parseInt(document.getElementById('patientAge').value);
  const gender = document.getElementById('patientGender').value;
  const contact = document.getElementById('patientContact').value;

  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, age, gender, contact })
  });

  if (response.ok) {
    loadPatients();
    loadPatientsForAssign();
    document.getElementById('patientForm').reset();
  } else {
    alert('Error adding patient');
  }
});

// Room Form
document.getElementById('roomForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const roomNumber = document.getElementById('roomNumber').value;
  const type = document.getElementById('roomType').value;
  const capacity = parseInt(document.getElementById('roomCapacity').value);

  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomNumber, type, capacity })
  });

  if (response.ok) {
    loadRooms();
    loadRoomsForAssign();
    document.getElementById('roomForm').reset();
  } else {
    alert('Error adding room');
  }
});

// Assign Button
document.getElementById('assignBtn').addEventListener('click', async () => {
  const patientId = document.getElementById('assignPatient').value;
  const roomId = document.getElementById('assignRoom').value;

  if (!patientId || !roomId) {
    alert('Please select both patient and room');
    return;
  }

  const response = await fetch(`/api/patients/${patientId}/assign/${roomId}`, {
    method: 'PUT'
  });

  if (response.ok) {
    loadPatients();
    loadRooms();
  } else {
    const error = await response.json();
    alert(error.error);
  }
});

// Load Patients
async function loadPatients() {
  const response = await fetch('/api/patients');
  const patients = await response.json();
  const list = document.getElementById('patientList');
  list.innerHTML = '';
  patients.forEach(patient => {
    const li = document.createElement('li');
    li.textContent = `${patient.name} (${patient.age}, ${patient.gender}) - ${patient.contact}`;
    if (patient.roomId) {
      li.textContent += ` - Room: ${patient.roomId.roomNumber}`;
    }
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';
    removeBtn.addEventListener('click', () => removePatient(patient._id));
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

// Load Rooms
async function loadRooms() {
  const response = await fetch('/api/rooms');
  const rooms = await response.json();
  const list = document.getElementById('roomList');
  list.innerHTML = '';
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.textContent = `Room ${room.roomNumber} (${room.type}) - Capacity: ${room.capacity}, Occupied: ${room.occupied}`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';
    removeBtn.addEventListener('click', () => removeRoom(room._id));
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

// Load Patients for Assign
async function loadPatientsForAssign() {
  const response = await fetch('/api/patients');
  const patients = await response.json();
  const select = document.getElementById('assignPatient');
  select.innerHTML = '<option value="">Select Patient</option>';
  patients.forEach(patient => {
    const option = document.createElement('option');
    option.value = patient._id;
    option.textContent = patient.name;
    select.appendChild(option);
  });
}

// Load Rooms for Assign
async function loadRoomsForAssign() {
  const response = await fetch('/api/rooms');
  const rooms = await response.json();
  const select = document.getElementById('assignRoom');
  select.innerHTML = '<option value="">Select Room</option>';
  rooms.forEach(room => {
    const option = document.createElement('option');
    option.value = room._id;
    option.textContent = `Room ${room.roomNumber}`;
    select.appendChild(option);
  });
}

// Remove Patient
async function removePatient(id) {
  const response = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
  if (response.ok) {
    loadPatients();
    loadRooms();
    loadPatientsForAssign();
  } else {
    alert('Error removing patient');
  }
}

// Remove Room
async function removeRoom(id) {
  const response = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
  if (response.ok) {
    loadRooms();
    loadRoomsForAssign();
    loadPatients();
  } else {
    alert('Error removing room');
  }
}
