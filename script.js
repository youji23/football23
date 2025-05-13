const apiKey = "4e21382e42msh49eb15c0c2f357ap1cc581jsn8ed8aa7f0bf2";
const apiUrl = `https://free-api-live-football-data.p.rapidapi.com/football-players-search?search=m`;

fetch(apiUrl, {
    method: "GET",
    headers: {
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
        "x-rapidapi-key": apiKey
    }
})
.then(response => response.json())
.then(data => {
    let table = document.getElementById("matches");
    data.players.forEach(player => {
        let row = table.insertRow();
        row.innerHTML = `<td>${player.team}</td><td>${player.name}</td><td>${player.position}</td>`;
    });
})
.catch(error => console.error("حدث خطأ في جلب البيانات:", error));
