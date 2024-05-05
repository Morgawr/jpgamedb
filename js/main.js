var outb = document.getElementById('output');

const options = {
  threshold: 0,
  ignoreLocation: true,
  findAllMatches: true,
  keys: ["title"],
}

const TABLE_ENTRIES = {
  "title": "Title",
  "difficulty": "Difficulty",
  "genre": "Genre",
  "furigana": "Furigana",
  "voiced": "Voiced Lines",
  "japanese_game": "Japanese Developer?",
}

async function fetchData(){
  let response = await fetch('db/gamelist.json')
  let data = await response.json();
  return data;
}

let json_data = await fetchData();

const fuse = new Fuse(json_data, options);

function show_entry(entry) {
  let data = document.createElement("tr");
  Object.entries(TABLE_ENTRIES).forEach(([k,v]) => {
    let column = document.createElement("td");
    column.appendChild(document.createTextNode(entry[k]));
    data.appendChild(column);
  });
  return data
}

function refresh_list(value) {
  let content_table = document.createElement("table");
  let titles = document.createElement("tr");
  Object.entries(TABLE_ENTRIES).forEach(([k, v]) => {
    let column = document.createElement("th");
    column.appendChild(document.createTextNode(v));
    titles.appendChild(column);
  });
  content_table.appendChild(titles);
  if (!value) {
    json_data.forEach(function(result, index) {
      content_table.appendChild(show_entry(result));
    })
  } else {
    // Keep entries sorted non-case sensitive
    let data = fuse.search(value).sort(function(a, b){
      return a.item['title'].toLowerCase().localeCompare(
        b.item['title'].toLowerCase())
    });
    data.forEach(function(result, index) {
      content_table.appendChild(show_entry(result.item));
    })
  }
  outb.replaceChildren(content_table);
}

document.getElementById('textbox').addEventListener('input', function() {
  refresh_list(this.value);
})

refresh_list("");

