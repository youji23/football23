fetch("en.1.json")
    .then(response => response.json())
    .then(data => {
        const matchesContainer = document.getElementById("matchesContainer");
        const dateInput = document.getElementById("matchDate");
        const todayBtn = document.getElementById("today");
        const yesterdayBtn = document.getElementById("yesterday");
        const tomorrowBtn = document.getElementById("tomorrow");

        function getMatchesForDate(date) {
            matchesContainer.innerHTML = ""; // مسح المحتوى السابق
            const matches = data.matches.filter(match => match.date === date);

            if (matches.length === 0) {
                matchesContainer.innerHTML = "<p>لا توجد مباريات لهذا اليوم</p>";
            } else {
                matches.forEach(match => {
                    const matchCard = document.createElement("div");
                    matchCard.className = "match-card";

                    const matchStatus = getMatchStatus(match);
                    const localTime = convertToLocalTime(match.date, match.time);
                    const finalScore = match.score?.ft ? match.score.ft.join(" - ") : ""; // إزالة "لم تلعب بعد" تلقائيًا

                    matchCard.innerHTML = `
                        <p>${match.round}</p>
                        <p>${match.date} - ${localTime}</p>
                        <p class="teams">${match.team1} vs ${match.team2}</p>
                        <p class="score">${finalScore}</p>
                        <p class="status ${matchStatus.class}">${matchStatus.text}</p>
                    `;
                    matchesContainer.appendChild(matchCard);
                });
            }
        }

        function convertToLocalTime(date, time) {
            const matchDateTime = new Date(`${date}T${time}Z`);
            return new Intl.DateTimeFormat(navigator.language, {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }).format(matchDateTime);
        }

        function getMatchStatus(match) {
            const matchDateTime = new Date(`${match.date}T${match.time}Z`);
            const now = new Date();

            if (match.score?.ft) {
                return { text: "انتهت", class: "finished" };
            } else if (now >= matchDateTime) {
                return { text: "⚽ قيد اللعب", class: "live" };
            } else {
                return { text: "لم تلعب بعد", class: "upcoming" };
            }
        }

        // ضبط اليوم الافتراضي
        const today = new Date().toISOString().split("T")[0];
        dateInput.value = today;
        getMatchesForDate(today);

        // تحديث العرض عند تغيير التاريخ
        dateInput.addEventListener("change", () => {
            getMatchesForDate(dateInput.value);
        });

        // أزرار لتغيير اليوم
        yesterdayBtn.addEventListener("click", () => {
            const yesterday = new Date();
            yesterday.setDate(new Date().getDate() - 1);
            dateInput.value = yesterday.toISOString().split("T")[0];
            getMatchesForDate(dateInput.value);
        });

        todayBtn.addEventListener("click", () => {
            dateInput.value = today;
            getMatchesForDate(today);
        });

        tomorrowBtn.addEventListener("click", () => {
            const tomorrow = new Date();
            tomorrow.setDate(new Date().getDate() + 1);
            dateInput.value = tomorrow.toISOString().split("T")[0];
            getMatchesForDate(dateInput.value);
        });
    })
    .catch(error => console.error("❌ حدث خطأ في جلب البيانات:", error));
