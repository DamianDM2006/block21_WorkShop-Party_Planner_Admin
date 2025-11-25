// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2510-FTB-CT-WEB-PT"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** FUNCTION:  Add a Party */
const addParty = async (inputObj) => {
  try {
    await fetch(API + "/events", {
      method: `POST`,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputObj),
    });
  } catch (e) {
    console.error(e);
  }
  getParties();
};

/** FUNCTION:  Remove a Party */
const removeParty = async (id) => {
  try {
    console.log(`id in removeParty`, id);
    await fetch(API + "/events/" + id, { method: "DELETE" });
    selectedParty = undefined;
    await getParties();
  } catch (e) {
    console.error(e);
  }
};

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <button>Remove Party</button>
    <GuestList></GuestList>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  const $removeParty = $party.querySelector("button");
  $removeParty.addEventListener("click", () => removeParty(selectedParty.id));
  return $party;
}

/** FORM COMPENENT ==== */
const newPartyForm = () => {
  const $partyForm = document.createElement("form");
  $partyForm.innerHTML = `
    <label>
      Name
      <input name="name" required />
    </label>
    <label>
      Description
      <input
        name="description"
        value="Testing in progress"
        required />
    </label>
    <label>
      Date of the Event
      <input
        name="date"
        type="date"
        required />
    </label>
    <label>
      Time of the Event
      <input
        name="time"
        type="time"
        required
    <label>
      Location
      <input
        name="location"
        value="Between here and there"
        required />
    </label>
    <button>Add Party</button>
      `;
  $partyForm.addEventListener(`submit`, async (event) => {
    event.preventDefault();

    const inputNodeData = document.querySelectorAll(`input`);
    const inputData = [...inputNodeData];

    const formattedDate = `${inputData[2].value}T${inputData[3].value}:00.000Z`;

    const inputObj = {
      name: inputData[0].value,
      description: inputData[1].value,
      date: formattedDate,
      location: inputData[4].value,
    };
    addParty(inputObj);
  });
  return $partyForm;
};

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
      <UpdateParty></UpdateParty>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("UpdateParty").replaceWith(newPartyForm());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
