const TABLE_ENTRIES = [
  "difficulty",
  "genre",
  "furigana",
  "voiced",
]
  //"japanese_game": "Japanese Developer?",

async function fetchData(){
  let response = await fetch('db/gamelist.json')
  let data = await response.json();
  return data;
}

let json_data = await fetchData();

function get_game_from_query() {
  const params = new URLSearchParams(document.location.search);
  const title = decodeURIComponent(params.get("title"));
  let found = undefined;
  json_data.some((e) => {
    if (e['title'] == title) {
      found = e;
      return true;
    }
    return false;
  })
  if (found) {
    return found;
  }
  // We go back because there is no such game
  window.location.replace('index.html');
}

function populate_page() {
  const entry = get_game_from_query();
  document.getElementById('title').innerHTML = entry['title'];
  let left = document.getElementById('left');
  let cover = document.createElement('img');
  if (entry['image']) {
    cover.src = entry['image'];
  } else {
    cover.src = 'res/cover_art_not_found.png';
  }
  cover.width = '300';
  left.appendChild(cover);
  if (entry['backloggd']) {
    let backloggd = document.createElement('p');
    backloggd.innerHTML += '<a href="'
      + entry['backloggd']
      + '">Backloggd</a>';
    left.appendChild(backloggd);
  }

  TABLE_ENTRIES.forEach((name) => {
    document.getElementById(name + 'td').appendChild(
      document.createTextNode(entry[name])
    );
  });

  if (entry['notes']) {
    let notes = document.getElementById('notes');
    entry['notes'].split('\n').forEach((line) => {
      let p = document.createElement('p');
      p.appendChild(document.createTextNode(line.trim()));
      notes.appendChild(p);
    });
  }

}

populate_page()
