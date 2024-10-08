var outb = document.getElementById('output');

const TABLE_ENTRIES = {
  "title": "Title",
  "difficulty": "Language Difficulty",
  "genre": "Genre",
  "furigana": "Furigana",
  "voiced": "Voiced Lines",
  "japanese_game": "Japanese Developer?",
}

const FILTERS = [
  "difficulty",
  "genre",
  "furigana",
  "voiced",
]

const options = {
  threshold: 0,
  ignoreLocation: true,
  findAllMatches: true,
  useExtendedSearch: true,
  keys: Object.keys(TABLE_ENTRIES).concat("browsable"),
}

async function fetchData(){
  let response = await fetch('db/gamelist.json')
  let data = await response.json();
  return data;
}

let json_data = await fetchData();

const fuse = new Fuse(json_data, options);

function go_to_entry(title) {
  let url = "game.html?title=" + encodeURIComponent(title);
  window.location.href = url
}

function show_entry(entry) {
  let data = document.createElement("tr");
  Object.entries(TABLE_ENTRIES).forEach(([k,v]) => {
    let column = document.createElement("td");
    if (k == 'difficulty') {
      column.classList.add(entry[k].split(' ').join('_'));
    }
    if (k == 'title' && entry['certified']) {
      let column_container = document.createElement('div');
      let seal = document.createElement('img');
      seal.src = 'res/certified.png';
      seal.id = 'seal';
      seal.alt = 'Morg Certified';
      column_container.appendChild(seal);
      column_container.appendChild(document.createTextNode(entry[k]));
      column.appendChild(column_container);
    } else {
      column.appendChild(document.createTextNode(entry[k]));
    }
    data.appendChild(column);
  });
  data.classList.add("game_entry");
  data.onclick = function() { go_to_entry(entry['title']) }
  return data
}

function refresh_list() {
  let content_table = document.createElement("table");
  let titles = document.createElement("tr");
  Object.entries(TABLE_ENTRIES).forEach(([k, v]) => {
    let column = document.createElement("th");
    column.appendChild(document.createTextNode(v));
    titles.appendChild(column);
  });
  titles.appendChild(document.createElement("th"));

  content_table.appendChild(titles);

  let title = document.getElementById('titlebox').value;
  let search_index = {};
  let filters = {};
  /*
  TODO: re-add filters when they are ready
  FILTERS.forEach((value) => {
    let filter_value = document.getElementById(value + 'box').value;
    if (filter_value) {
      filters[value] = filter_value;
    }
  });
  */

  if (!title) {
    filters['browsable'] = 'true';
  } else {
    filters['title'] = title;
  }

  search_index = {
    $and: Object.entries(filters).map(function([key, value]) {
      let tmp = {};
      tmp[key] = value;
      return tmp;
    }),
  }

  // Keep entries sorted non-case sensitive
  let data = fuse.search(search_index).sort(function(a, b){
    if (a.item['difficulty'] == b.item['difficulty'] || !!title) {
      return a.item['title'].toLowerCase().localeCompare(
        b.item['title'].toLowerCase())
    }
    const difficulties = [
      'very easy', 'easy', 'average', 'hard', 'very hard', 'unknown'];
    return difficulties.indexOf(a.item['difficulty'])
      - difficulties.indexOf(b.item['difficulty']);
  });
  data.forEach(function(result, index) {
    content_table.appendChild(show_entry(result.item));
  })
  outb.replaceChildren(content_table);
}

document.getElementById('titlebox').addEventListener('input', refresh_list);
/* TODO: re-add filters when they are ready
FILTERS.forEach((value) => {
  document.getElementById(value + 'box').addEventListener('input', refresh_list);
})
*/

refresh_list();

