document.addEventListener("DOMContentLoaded", function () {
  const datePicker = document.getElementById("date-picker");
  const prevDayBtn = document.getElementById("prev-day");
  const nextDayBtn = document.getElementById("next-day");
  const container = document.getElementById("matches-container");

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  async function loadCountries() {
    const [countries1, countries2] = await Promise.all([
      fetch("arabic_countries_flags.json").then(res => res.json()),
      fetch("club_world_cup_2025_with_logos.json").then(res => res.json())
    ]);

    return {
      فرق: [...countries1.فرق, ...countries2.فرق]
    };
  }

  function sortByMinute(arr) {
    return arr.slice().sort((a, b) => parseInt(a.minute) - parseInt(b.minute));
  }

  function convertToLocalTime(dateStr, timeStr) {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "م" && hours < 12) hours += 12;
    if (period === "ص" && hours === 12) hours = 0;

    const dateObj = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+01:00`);

    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getMatchStatus(matchDate, matchTime) {
    const now = new Date();
    const [time, period] = matchTime.split(" ");
    let [hours, minutes] = time.split(":" ).map(Number);

    if (period === "م" && hours < 12) hours += 12;
    if (period === "ص" && hours === 12) hours = 0;

    const matchStart = new Date(`${matchDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+01:00`);
    const matchEnd = new Date(matchStart.getTime() + 105 * 60000);

    if (now < matchStart) return "لم تبدأ";
    if (now >= matchStart && now <= matchEnd) return "جارية الآن";
    return "انتهت";
  }

  async function loadMatches(date) {
    try {
      const countriesData = await loadCountries();
      const response = await fetch("en.1.json");
      const data = await response.json();

      container.innerHTML = "";
      let competitions = {};

      data.matches
        .filter((match) => match.date === date)
        .forEach((match) => {
          if (!competitions[match.competition]) {
            competitions[match.competition] = [];
          }
          competitions[match.competition].push(match);
        });

      Object.keys(competitions).forEach((comp) => {
        const compSection = document.createElement("div");
        compSection.classList.add("competition-section");
        compSection.innerHTML = `<h2>🏆 ${comp}</h2>`;
        container.appendChild(compSection);

        competitions[comp].forEach((match) => {
          const matchDiv = document.createElement("div");
          matchDiv.classList.add("match-item");

          const team1 = countriesData.فرق.find((team) => team.الاسم === match.team1);
          const team2 = countriesData.فرق.find((team) => team.الاسم === match.team2);

          const team1Logo = team1 ? (team1.العلم || team1.الشعار) : '';
          const team2Logo = team2 ? (team2.العلم || team2.الشعار) : '';

          const localTime = convertToLocalTime(match.date, match.time);
          const matchStatus = getMatchStatus(match.date, match.time);

          function getEvents(teamType) {
            let events = [];
            sortByMinute(match.goals.filter(g => g.team === teamType)).forEach(g => {
              const isPenalty = g.penalty === true;
              const scorerName = isPenalty ? `${g.scorer} (ض.ج)` : g.scorer;
              events.push({
                minute: parseInt(g.minute),
                content: `<li style="background-color:#3a6ea5;padding:4px 8px;border-radius:8px;display:inline-block;margin-bottom:4px;color:#fff">⚽ ${scorerName} (${g.minute}') </li>` +
                  (g.assist ? `<li>صناعة ${g.assist}</li>` : "")
              });
            });

            sortByMinute(match.substitutions.filter(s => s.team === teamType)).forEach(s => {
              events.push({
                minute: parseInt(s.minute),
                content: `<li><span style="color:red">${s.out}</span> <span style="color:green">${s.in}</span> (${s.minute}')</li>`
              });
            });

            sortByMinute(match.cards.filter(c => c.team === teamType)).forEach(c => {
              events.push({
                minute: parseInt(c.minute),
                content: `<li>${c.type === "yellow" ? "🟨" : "🟥"} ${c.player} (${c.minute}')</li>`
              });
            });

            (match.var || []).filter(v => v.team === teamType).sort((a, b) => a.minute - b.minute).forEach(v => {
              events.push({
                minute: parseInt(v.minute),
                content: `<li>فار ${v.player} - ${v.note} (${v.minute}')</li>`
              });
            });

            return events.sort((a, b) => a.minute - b.minute).map(e => e.content).join("");
          }

          const team1EventsHTML = getEvents("home");
          const team2EventsHTML = getEvents("away");

          matchDiv.innerHTML = `
            <div class="teams-container">
              <div class="team-column team-left">
                <img src="${team1Logo}" alt="${match.team1}">
                <h3>${match.team1}</h3>
                <span class="score">${match.score.ft.length ? match.score.ft[0] : "-"}</span>
              </div>
              <div class="match-divider">🆚</div>
              <div class="team-column team-right">
                <span class="score">${match.score.ft.length ? match.score.ft[1] : "-"}</span>
                <h3>${match.team2}</h3>
                <img src="${team2Logo}" alt="${match.team2}">
              </div>
            </div>
            <div class="match-info centered-info">
              <p><strong>🕒 الوقت:</strong> ${localTime}</p>
              <p><strong>📅 التاريخ:</strong> ${match.date}</p>
              <p><strong>🔹 الحالة:</strong> ${matchStatus}</p>
            </div>
            <div class="details-button-container">
              <button class="details-btn">تفاصيل المباراة</button>
            </div>
            <div class="details" style="display:none">
              <div class="team-details-split">
                <div class="team-details-column team-left">
                  <h4>${match.team1}</h4>
                  <ul>${team1EventsHTML}</ul>
                </div>
                <div class="vertical-divider"></div>
                <div class="team-details-column team-right">
                  <h4>${match.team2}</h4>
                  <ul>${team2EventsHTML}</ul>
                </div>
              </div>
            </div>
          `;

          compSection.appendChild(matchDiv);
        });
      });

      document.querySelectorAll(".details-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const details = btn.closest(".match-item").querySelector(".details");
          details.style.display = details.style.display === "none" ? "block" : "none";
        });
      });
    } catch (error) {
      console.error("❌ خطأ في جلب البيانات:", error);
      container.innerHTML = "<p>⚠️ حدث خطأ أثناء تحميل المباريات، حاول مجددًا لاحقًا.</p>";
    }
  }

  const today = new Date();
  datePicker.value = formatDate(today);
  loadMatches(formatDate(today));

  prevDayBtn.addEventListener("click", () => {
    const currentDate = new Date(datePicker.value);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDate = formatDate(currentDate);
    datePicker.value = newDate;
    loadMatches(newDate);
  });

  nextDayBtn.addEventListener("click", () => {
    const currentDate = new Date(datePicker.value);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDate = formatDate(currentDate);
    datePicker.value = newDate;
    loadMatches(newDate);
  });

  datePicker.addEventListener("change", () => loadMatches(datePicker.value));
});
