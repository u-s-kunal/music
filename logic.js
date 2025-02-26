const totalDuration = document.getElementById("totalDuration"); // For displaying total duration
const currentTime = document.getElementById("current-time"); // For displaying total duration
let albums = document.getElementById("albums");
let mainTitle = document.getElementById("song-name");
let rightBox = document.getElementById("right");
let playBtn = document.getElementById("play");
let circle = document.getElementById("circle");
let filler = document.getElementById("filler");
let nextBtn = document.getElementById("next");
let prevBtn = document.getElementById("previous");
let seekContainer = document.getElementById("seekContainer");
let searchInput = document.getElementById("searchInput");
let searchBtn = document.getElementById("searchBtn");
let burger = document.getElementById("burger");
let left = document.getElementById("left");
let muteBtn = document.getElementById("muteBtn");
let song = [];
let Mp3Songs = [];
let audioDuration;
let href;
let title;
let songOfList;
let currentFormattedTime;
let isPlaying = false;
let preIndex = null;
let currentAudio = null;
let nextIndex = null;
let currentAudioIndex = null;
let musicListLength = null;
let isFound = false;
let searchInputValue = null;
let value = true;

async function main() {
  let response = await fetch(`songs`);
  let data = await response.text();
  let div = document.createElement("div");
  div.innerHTML = data;

  //////FORMAT TIME FUNCTION FOR CONVERTING TIME IN MIN AND SECONDS///////////////

  function formatTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);

    return `${hours > 0 ? hours + ":" : ""}${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  }

  muteBtn.addEventListener("click", () => {
    if (isPlaying == true) {
      currentAudio.muted = !currentAudio.muted; // Toggle mute
      muteBtn.style.backgroundImage = currentAudio.muted
        ? "url(/icons/mute.png)"
        : "url(/icons/volume.png)"; // Update button text
    }
  });

  // let songs = div.getElementsByTagName("a"); // Get all anchor (<a>) elements

  /////////////////////////////////SEARCHED SONGS///////////////////////////////
  let searchInput = document.getElementById("searchInput");
  let searchBtn = document.getElementById("searchBtn");

  // let div = document.querySelector("div"); // Ensure the div is selected
  let songs = Array.from(div.getElementsByTagName("a")); // Convert HTMLCollection to an array

  searchBtn.addEventListener("click", function (event) {
    event.preventDefault();
    value = false;
    let query = searchInput.value.toLowerCase();

    let foundSongs = [];

    songs.forEach((song, index) => {
      if (song.textContent.toLowerCase().includes(query)) {
        foundSongs.push({ element: song, index: index }); // Store element and index
      }
    });

    if (foundSongs.length > 0) {
      // console.log(`Total Songs Found: ${foundSongs.length}`);

      foundSongs.forEach((songObj, i) => {
        let songElement = songObj.element; // Access the actual <a> element

        // console.log(`Song ${i + 1} (Original Index: ${songObj.index})`);
        // console.log("Element:", songElement);

        let link = songElement.getAttribute("href"); // Accessing href
        let title = songElement.textContent.trim(); // Accessing song name
        ///////////////////////////// /EXTRACTING TITLE OF THE SONGS ///////////////////////////////////

        if (link && link.endsWith(".mp3")) {
          link = link;
        }
        if (title !== ".." && title !== null) {
          function titleFormatter(title) {
            return title
              .replace(/\(.*?\)|\.mp3$/gi, "") // Removes text inside brackets () and .mp3
              .replace(/\d+|\bkbps\b/gi, "") // Removes numbers and the word "kbps"
              .replace(/-/g, " ") // Replaces '-' with a space
              .replace(/_/g, " ") // Replaces '_' with a space
              .replace(/.com/g, " ") // Replaces '.com' with a space
              .replace(/.mp\//g, " ")
              .replace(/ ::/g, " ") // Alag Aasmaan.mp// ::
              .replace(/\//g, " ") // Alag Aasmaan.mp// ::
              .trim();
          }
          PlaySongOfList(songElement, songObj.index);
          mainTitle.innerHTML = titleFormatter(title);
        }
      });
    }
  });

  for (let i = 0; i < songs.length; i++) {
    ///////////////////////////// /EXTRACTING TITLE OF THE SONGS ///////////////////////////////////
    let title = songs[i].getAttribute("title");
    link = songs[i].getAttribute("href");
    if (link && link.endsWith(".mp3")) {
      link = link;
    }
    if (title !== ".." && title !== null) {
      function titleFormatter(title) {
        finalTitle = title
          .replace(/\(.*?\)|\.mp3$/gi, "") // Removes text inside brackets () and .mp3
          .replace(/\d+|\bkbps\b/gi, "") // Removes numbers and the word "kbps"
          .replace(/-/g, " ") // Replaces '-' with a space
          .replace(/_/g, " ") // Replaces '_' with a space
          .replace(/.com/g, " ") // Replaces '.com' with a space
          .trim();
      }
      titleFormatter(title);

      albums.innerHTML += `<div class="accordion" id="accordionPanelsStayOpenExample"  >
                <ul class="list-group">
                <a  class="anchor list" href=${link} > <li   class=" ">${finalTitle}</li> </a>
                </ul>
                </div>`;
    }
  }

  /////////////////////////////////////GET DURATIONS  ///////////////////////////////////////////////

  async function getDuration(link) {
    return new Promise((resolve, reject) => {
      // Pause and reset current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        //////////////Automatically move to the next song when the current one ends/////////////////
        currentAudio.onended = () => {
          nextBtn.click();
        };
      }

      let audio = new Audio(link);
      //NOW FOR CURRENT TIME

      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
        audioDuration = audio.duration;
        //TOTAL TIME FUNCTION
        finalDuration = formatTime(audio.duration, audio.currentTime);
        totalDuration.innerHTML = `${finalDuration} min`;
      });

      audio.addEventListener("error", () => {
        reject("Error loading audio file");
      });
    });
  }
  getDuration(href);

  /////////////////////////////////////////CLICK ON LIST OF SONGS //////////////////////////

  let musicList = document.getElementsByTagName("a");

  function PlaySongOfList(musicList, i, length) {
    songOfList = musicList;
    let listHref = songOfList.getAttribute("href");
    let listTitle = songOfList.innerText;
    let Title = document.getElementById("song-name");
    getDuration(listHref);

    // Check if the same audio is being clicked again

    if (isPlaying && currentAudio) {
      isPlaying = false;
      play.style.backgroundImage = "url(images/playBtn.png)";
      muteBtn.style.backgroundImage = "url(icons/mute.png)";
      rightBox.style.animation = "";
    }

    // Create a new Audio instance and play it
    currentAudio = new Audio(listHref);
    // Start playing the audio and handle the promise
    currentAudio.play();
    isPlaying = true;
    play.style.backgroundImage = "url(images/pauseBtn.png)";
    muteBtn.style.backgroundImage = "url(icons/volume.png)";

    rightBox.style.animation = "rotate 5s infinite linear";
    Title.innerHTML = listTitle;

    // ⏱ Attach `timeupdate` event listener

    currentAudio.addEventListener("timeupdate", () => {
      let currentFormattedTime = formatTime(currentAudio.currentTime);
      let seekNum = (
        (currentAudio.currentTime / audioDuration) *
        100
      ).toString();
      currentTime.innerText = ` ${currentFormattedTime} min`;
      circle.style.left = `${seekNum}%`;
      filler.style.width = `${seekNum}%`;
    });

    currentAudioIndex = i;
    musicListLength = length;
  }
  for (let i = 0; i < musicList.length; i++) {
    // // //////////////////////////////////////// MUSIC LIST//////////////////////////////////////////////
    musicList[i].addEventListener("click", function playList(event) {
      event.preventDefault();
      PlaySongOfList(musicList[i], i, musicList.length);
      // console.log(musicList[i], i, musicList.length);

      return i;
    });
  }
  ///////////////////////////////////////////  PLAY BTN LOGIC HERE///////////////////////////////////

  playBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (currentAudio && isPlaying == true) {
      isPlaying = false;
      play.style.backgroundImage = `url(images/playBtn.png)`;
      muteBtn.style.backgroundImage = "url(icons/mute.png)";

      rightBox.style.animation = "";
      currentAudio.pause();
      // console.log("song paused");
    } else {
      isPlaying = true;
      currentAudio.play();
      // console.log("song played");
      rightBox.style.animation = "rotate 5s infinite linear";
      muteBtn.style.backgroundImage = "url(icons/volume.png)";
      play.style.backgroundImage = "url(images/pauseBtn.png)";
    }
  });

  // // //////////////////////////////////////// PREV BUTTON//////////////////////////////////////////////
  prevBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (currentAudioIndex > 0) {
      currentAudioIndex--;
      preIndex = currentAudioIndex;
    }
    if (preIndex !== null)
      PlaySongOfList(musicList[preIndex], preIndex, musicListLength);
  });
  // // //////////////////////////////////////// NEXT BUTTON//////////////////////////////////////////////
  nextBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (currentAudioIndex < musicListLength - 1) {
      currentAudioIndex++;
      nextIndex = currentAudioIndex;
      if (nextIndex !== null)
        PlaySongOfList(musicList[nextIndex], nextIndex, musicListLength);
    }
  });

  /////////////////////////////PLAY SONGS/////////////////////////////////////////////////
  let anchors = document.querySelectorAll("a");

  function playSongs() {
    for (let index = 0; index < anchors.length; index++) {
      /////////////////////////////////////////SONG END HANDLER ////////////////////////////////////////
      if (currentAudio) {
        currentAudio.addEventListener("ended", () => {
          index = (index + 1) % anchors.length; // Loop back if at last song
        });
      }
      /////////////////////////////////////////SEEK BAR CHANGE LOGIC ////////////////////////////////////////

      // Seek when user clicks on the bar
      seekContainer.addEventListener("click", (event) => {
        let rect = seekContainer.getBoundingClientRect();
        let offsetX = event.clientX - rect.left;
        let newTime = (offsetX / rect.width) * currentAudio.duration;
        currentAudio.currentTime = newTime;
      });
    }
  }
  ////////////////////////////////BURGER BUTTON LOGIC HERE //////////////////////////////////////
  burger.addEventListener("click", function () {
    burger.classList.toggle("x");
    burger.classList.toggle("burger");
    left.classList.toggle("block");
    console.log("Toggled!");
  });

  playSongs();
}

main();
