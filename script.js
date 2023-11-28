const matchesContainer = document.getElementById("matches-container");
const pageContainer = document.getElementById("page-container");
const error = document.getElementById("error");
const match_history_text = document.getElementById("match-history-text");
const name_div = document.getElementById("name");
const userstats = document.getElementById("userstats");
const userstats_text = document.getElementById("userstats-text");
const achievements_div = document.getElementById("achievements");



let currentPage = 1;
const matchesPerPage = 20;
var name;

var inputFields = document.getElementsByClassName("input-field");
for (var i = 0; i < inputFields.length; i++) {
    inputFields[i].addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            name = event.target.value;
            if (name != "") {
                getmatchstats(1, name);
                getuserstats(name)

            } else {
                removepagecontentandposterror();
                removebuttons();

            }
        }
    });
}

function removepagecontentandposterror() {
    matchesContainer.innerHTML = "";
    name_div.innerHTML = "";
    userstats.innerHTML = "";
    match_history_text.innerHTML = "";
    userstats_text.innerHTML = "";
    error.innerHTML = "Please make sure you entered a valid name or UUID.";
}


function removebuttons() {
    const button1 = document.getElementById("prev-button");
    const button2 = document.getElementById("next-button");

    if (button1) {
        button1.remove();
        console.log("Button 1 removed");
    }

    if (button2) {
        button2.remove();
        console.log("Button 2 removed");
    }

}

function getuserstats(name) {
    fetch(`https://mcsrranked.com/api/users/${name}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                userstats_text.innerHTML = 'User Stats'
                const uuid = data.data.uuid;
                const nickname = data.data.nickname;
                const badge = data.data.badge;
                const elo_rate = data.data.elo_rate;
                const elo_rank = data.data.elo_rank;
                const createtime = data.data.created_time;
                const lastplaytime = data.data.latest_time;
                const total_played = data.data.total_played;
                const season_played = data.data.season_played;
                const highest_winstreak = data.data.highest_winstreak;
                const current_winstreak = data.data.current_winstreak;
                const prev_elo_rate = data.data.prev_elo_rate;
                const best_elo_rate = data.data.best_elo_rate;
                const best_record_time = data.data.best_record_time;
                const records = data.data.records; // list
                const achievements = data.data.achievements; 
                const connections = data.data.connections; 

                const created_time = createtime * 1000;

                const date = new Date(created_time);

                const created_time_ = date.toLocaleString();

                const latest_time = lastplaytime * 1000;

                const date_ = new Date(latest_time);

                const lastplaytime_ = date_.toLocaleString();

                name_div.innerHTML = nickname;
                name_div.title = 'UUID: ' + uuid;

                let connections_list = "";

                if (typeof connections === 'object' && connections !== null) {
                  for (const platform in connections) {
                    if (Object.prototype.hasOwnProperty.call(connections, platform)) {
                      const platformInfo = connections[platform];
                    
                      if (platformInfo !== null) {
                        connections_list += `${platform}: ${platformInfo.name}, `;
                      }
                    }
                  }
                  connections_list = connections_list.slice(0, -2);
                } else {
                  console.error('Connections is not an object.');
                }

                userstats.innerHTML = `Elo: ${elo_rate} #${elo_rank}<br>Account Created: ${created_time_}<br>Last Time Played: ${lastplaytime_}<br>Total Games Played: ${total_played}<br>Played This Season: ${season_played}<br>Highest WS: ${highest_winstreak}<br>Current WS: ${current_winstreak}<br>Previous Elo Rate: ${prev_elo_rate}<br>Best Elo Rate: ${best_elo_rate}<br>Connections: ${connections_list}`;
                
                let achievements_list = "";

                achievements.forEach((achievement) => {
                    if (achievements_div) {
                         achievements_list += `${achievement.tag_name}: ${new Date(achievement.achieve_time * 1000).toLocaleString()}\n `;
                    }
                });


                achievements_div.innerHTML = 'Achievements (Hover)';
                achievements_div.title = achievements_list;


            } else {
                return
            }

        })
        .catch((error) => {
            console.error("Error fetching user stats:", error);
        });
}

let user_name = "";

function getmatchstats(page, name) {
    const url = `https://mcsrranked.com/api/users/${name}/matches?page=${page}`;
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "error") {
                removebuttons();
                removepagecontentandposterror();
            } else {
                error.innerHTML = "";
                if (data.data.length === 0 && user_name !== name) {
                    matchesContainer.innerHTML = "";
                    match_history_text.innerHTML = "";
                    removebuttons();
                } else {
                    user_name = `${name}`;
                    displayMatches(data, page);
                    createPaginationButtons(data);
                }
            }
        })
        .catch((error) => {
            console.error("Error fetching match stats:", error);
        });
}


function displayMatches(data, page) {
    try {
        if (data.data.length != 0) {
            match_history_text.innerHTML = `Match History Page ${page}`

            matchesContainer.innerHTML = "";

            data.data.forEach((match) => {
                if (match.winner != null) {
                    fetch(`https://playerdb.co/api/player/minecraft/${match.winner}`)
                        .then(response => response.json())
                        .then((data) => {
                            const timestampInMilliseconds = match.match_date * 1000;

                            const date = new Date(timestampInMilliseconds);

                            const formattedDate = date.toLocaleString();

                            const matchDiv = document.createElement("div");
                            matchDiv.innerHTML = `Match ID: ${match.match_id}, Winner: ${data.data.player.username}`;

                            matchDiv.title = `Date: ${formattedDate}\n\n${match.members[0].nickname ?? "None"} stats: Elo Rate: ${match.members[0].elo_rate ?? "None"}, Elo Rank: ${match.members[0].elo_rank ?? "None"}\n\n${match.members[1].nickname ?? "None"} stats: Elo Rate: ${match.members[1].elo_rate ?? "None"}, Elo Rank: ${match.members[1].elo_rank ?? "None"}`;

                            if (String(data.data.player.username).toLowerCase() == String(name).toLowerCase()) {
                                matchDiv.style.color = "green";
                            } else {
                                matchDiv.style.color = "red";
                            }
                            matchesContainer.appendChild(matchDiv);

                        })
                } else {
                    const timestampInMilliseconds = match.match_date * 1000;

                    const date = new Date(timestampInMilliseconds);

                    const formattedDate = date.toLocaleString();
                    const matchDiv = document.createElement("div");
                    matchDiv.innerHTML = `Match ID: ${match.match_id}, Winner: null`;
                    if (match.members[1] === undefined) {

                        matchDiv.title = `Date: ${formattedDate}\n\n` +
                            `${match.members[0].nickname ?? "None"} stats: Elo Rate: ${match.members[0].elo_rate ?? "None"}, Elo Rank: ${match.members[0].elo_rank ?? "None"}\n\n`
                        matchesContainer.appendChild(matchDiv);


                    } else {

                        matchDiv.title = `Date: ${formattedDate}\n\n` +
                            `${match.members[0].nickname} stats: Elo Rate: ${match.members[0].elo_rate}, Elo Rank: ${match.members[0].elo_rank}\n\n` +
                            `${match.members[1].nickname} stats: Elo Rate: ${match.members[1].elo_rate}, Elo Rank: ${match.members[1].elo_rank}`;
                        matchesContainer.appendChild(matchDiv);

                    }

                }

            });
        }


    } catch (error) {
        console.error("An error occurred in displayMatches:", error);
    }
}

function createPaginationButtons(data) {

    try {
        pageContainer.innerHTML = "";

        if (currentPage > 1) {
            const prevButton = document.createElement("button");
            prevButton.id = "prev-button";
            prevButton.textContent = "Previous";
            prevButton.addEventListener("click", () => {
                currentPage--;
                getmatchstats(currentPage, name);
            });
            pageContainer.appendChild(prevButton);
        }

        if (currentPage < 99 && data.data != 0) {
            const nextButton = document.createElement("button");
            nextButton.id = "next-button";
            nextButton.textContent = "Next";
            nextButton.addEventListener("click", () => {
                currentPage++;
                getmatchstats(currentPage, name);
            });
            pageContainer.appendChild(nextButton);
        }
    } catch (error) {
        console.error("An error occurred in createPaginationButtons:", error);
    }
}

