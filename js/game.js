const TABLE_ENTRIES = [
  "difficulty",
  "genre",
  "furigana",
  "voiced",
  "japanese_game",
  "pausable_text",
  "playtime",
  "backlog",
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

function create_link(entry, tag, name) {
  let link = document.createElement('p');
  link.innerHTML += '<a href="'
    + entry[tag]
    + '">' + name + '</a>';
  return link;
}

function add_certified_seal() {
  let cover_container = document.getElementById('cover_container');
  let seal = document.createElement('img');
  seal.src = 'res/certified.png';
  seal.id = 'seal';
  cover_container.appendChild(seal);
}

function populate_page() {
  const entry = get_game_from_query();
  document.getElementById('title').innerHTML = entry['title'];
  let left = document.getElementById('left');
  let cover_container = document.createElement('div');
  let cover = document.createElement('img');
  cover_container.id = 'cover_container';
  if (entry['image']) {
    cover.src = entry['image'];
  } else {
    cover.src = 'res/cover_art_not_found.png';
  }
  cover.width = '300';
  cover_container.appendChild(cover);
  left.appendChild(cover_container);

  // TODO: refactor these extra cards
  if (entry['backloggd']) {
    left.appendChild(create_link(entry, 'backloggd', 'Backloggd'));
  }

  if (entry['howlongtobeat']) {
    left.appendChild(create_link(entry, 'howlongtobeat', 'Howlongtobeat'));
  }

  if (entry['vndb']) {
    left.appendChild(create_link(entry, 'vndb', 'VNDB'));
  }

  if (entry['jpdb']) {
    left.appendChild(create_link(entry, 'jpdb', 'JPDB.io'));
  }

  if (entry['certified']) {
    add_certified_seal();
  }

  TABLE_ENTRIES.forEach((name) => {
    if (name == 'playtime' && entry['howlongtobeat']) {
      document.getElementById(name + 'td').appendChild(
        create_link(entry, 'howlongtobeat', entry[name])
      );
    } else {
      document.getElementById(name + 'td').appendChild(
        document.createTextNode(entry[name])
      );
    }
    if (name == 'difficulty') {
      document.getElementById(name + 'td').classList.add(entry[name].split(' ').join('_'));
    }
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
