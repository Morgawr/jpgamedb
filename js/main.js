var outb = document.getElementById('output');

const options = {
  threshold: 0,
  ignoreLocation: true,
  findAllMatches: true,
  keys: ["title"],
}

async function fetchData(){
  let response = await fetch('db/gamelist.json')
  let data = await response.json();
  return data;
}

let json_data = await fetchData();

const fuse = new Fuse(json_data, options);

function show_entry(entry) {
  let data = "<tr>";
  data += "<td>" + entry['title'] + "</td>";
  data += "<td>" + entry['difficulty'] + "</td>";
  data += "<td>" + entry['genre'] + "</td>";
  data += "<td>" + entry['furigana'] + "</td>";
  data += "<td>" + entry['japanese_game'] + "</td>";
  data += "</tr>"
  return data
}

function refresh_list(value) {
  outb.innerHTML = "";

  let output = "<table>";
  let table_titles = "<tr>";
  table_titles += "<th>Title</th>";
  table_titles += "<th>Difficulty</th>";
  table_titles += "<th>Genre</th>";
  table_titles += "<th>Furigana</th>";
  table_titles += "<th>Japanese Developer?</th>";
  table_titles += "</tr>";
  output += table_titles;
  if (!value) {
    json_data.forEach(function(result, index) {
      output += show_entry(result)
    })
  } else {
    let data = fuse.search(value);
    data.forEach(function(result, index) {
      output += show_entry(result.item)
    })
  }
  outb.innerHTML = output + "</table>";
}

document.getElementById('textbox').addEventListener('input', function() {
  refresh_list(this.value);
})

refresh_list("");

