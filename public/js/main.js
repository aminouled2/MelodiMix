tailwind.config = {
  theme: {
    extend: {
      colors: {
        white: '#e3e3e3',
      },
      fontFamily: {
        sans: ['Outfit', 'Helvetica', 'sans-serif'],
      },
    }
  }
}

var selectedSongs = {}

window.addEventListener('DOMContentLoaded', () => {

  const activityDescriptionInput = document.getElementById('activityDescription');

  activityDescriptionInput.addEventListener('keydown', function (event) {
    if (event.keyCode === 13 && activityDescriptionInput.value.trim() !== '') {
      // User pressed Enter and entered something
      const activityDescription = activityDescriptionInput.value.trim();
      console.log('Activity description:', activityDescription);

      generatePlaylist(activityDescriptionInput.value)
    }
  });


  document.getElementById("selectionContainer").addEventListener("click", function (event) {
    if (event.target.matches("#selectionContainer div")) {
      var feeling = event.target.getAttribute("data-feeling");
      if (feeling) {
        const background = event.target.style.background;
        const rgbMatch = background.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

        if (rgbMatch) {
          const r = rgbMatch[1];
          const g = rgbMatch[2];
          const b = rgbMatch[3];

          /*
          var percentage = '-10%'
          document.body.style.backgroundImage = `radial-gradient(circle at left top, rgb(${r}, ${g}, ${b}) ${percentage}, rgb(24, 25, 26) 35%)`;
          */

        } else {
          console.log('RGB Value not found');
        }
        generatePlaylist(feeling)
      }
    }
  });
})

function removeSong(id) {
  console.log(id)
  delete selectedSongs[id];
  document.getElementById(id).remove();
}

function togglePlayPause(songPreview, button) {
  const playPauseButton = button.querySelector('.material-icons-round');
  const audioElement = button.querySelector('audio');

  if (audioElement.paused) {
    audioElement.play();
  } else {
    audioElement.pause();
  }

  audioElement.addEventListener("play", function() {
    playPauseButton.textContent = 'pause';
    muteOtherAudioElements(audioElement);
  });

  audioElement.addEventListener("pause", function() {
    playPauseButton.textContent = 'play_arrow';
  });

}

function muteOtherAudioElements(currentAudioElement) {
  const allAudioElements = document.querySelectorAll('audio');

  allAudioElements.forEach(function(audioElement) {
    if (audioElement !== currentAudioElement) {
      audioElement.pause();
    }
  });
}



function generatePlaylist(mood) {
  navigateToPage("searchResults", mood)
  fetch('/recommend_songs', {
    method: 'POST',
    body: JSON.stringify({
      query: mood,
      email: email
    }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Request failed');
      }
    })
    .then(data => {
      data.forEach((object, index) => {
        duplicateSongPreview(object.albumName, object.track_id, object.artists, object.image, object.preview, object.href)

        selectedSongs[object.track_id] = object
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });

}

function savePlaylist(title) {
  fetch('/save_playlist', {
    method: 'POST',
    body: JSON.stringify({
      playlistSongs: selectedSongs,
      title: title,
      email: email
    }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Request failed');
      }
    })
    .then(data => {
      console.log(data)
    })
    .catch(error => {
      console.error('Error:', error);
    });

}


function duplicateSongPreview(songName, songId, artistName, coverImageURL, songPreview, href) {
  // Get the template element
  const template = document.getElementById("song_preview_template");

  if (!template) {
    console.error("Template element not found!");
    return null;
  }

  // Create a clone of the template
  const clone = template.cloneNode(true);

  // Set the song ID in the dataset
  clone.dataset.songId = songId;

  // Generate unique IDs for the cloned elements
  const uniqueId = `preview_${songId}`;

  // Update the IDs of the cloned elements
  clone.id = songId;
  clone.style.display = "flex"
  clone.querySelector("#cover_main").onclick = function() {
    window.open(href)
  }
  clone.querySelector("#backgroundImg").id = `${uniqueId}_backgroundImg`;
  clone.querySelector("#cover_main").id = `${uniqueId}_cover_main`;
  clone.querySelector("#song_name").id = `${uniqueId}_song_name`;
  clone.querySelector("#artist_name").id = `${uniqueId}_artist_name`;

  // Set the song name, artist name, cover image, and background image
  const songNameElement = clone.querySelector(`#${uniqueId}_song_name`);
  const artistNameElement = clone.querySelector(`#${uniqueId}_artist_name`);
  const coverImageElement = clone.querySelector(`#${uniqueId}_cover_main`);
  const backgroundImageElement = clone.querySelector(`#${uniqueId}_backgroundImg`);

  if (!songNameElement || !artistNameElement || !coverImageElement || !backgroundImageElement) {
    console.error("Cloned element not found!");
    return null;
  }

  songNameElement.textContent = songName;
  artistNameElement.textContent = artistName;
  coverImageElement.src = coverImageURL;
  backgroundImageElement.src = coverImageURL;
  clone.querySelector('#removeButton').onclick = function () {
    removeSong(songId)
  }

  if (!songPreview) {
    clone.querySelector('#playButton').remove()
  } else {

    clone.querySelector('audio').src = songPreview;

    clone.querySelector('#playButton').onclick = function () {
      togglePlayPause(songPreview, clone.querySelector('#playButton'))
    }
  }

  // Append the cloned template to its parent element
  template.parentElement.appendChild(clone);

  // Return the cloned element
  return clone;
}



function navigateToPage(page, mood) {
  if (page == "back") {
    // just flip em
    const selectionContainer = document.querySelector('.newUI');
    const newUI = document.querySelector('.selectionContainer');

    // Fade out settings container
    selectionContainer.style.opacity = 0;
    selectionContainer.style.transform = 'translateX(10%)';
    newUI.style.transform = 'translateX(-10%)';
    newUI.style.filter = 'blur(4px)';

    selectedSongs = {}; // clear out current songs
    setTimeout(() => {
      selectionContainer.style.display = 'none';
      newUI.style.display = 'flex';
      document.title = "MelodiMix"
    }, 100);

    // Show new UI and fade it in
    setTimeout(() => {
      newUI.style.transform = 'translateX(0%)';
      newUI.style.filter = 'blur(0px)';
      newUI.style.opacity = 1;
    }, 700); // Wait for the fade-out transition to complete (0.5s)

    return;
  }
  loadPageContent(page, mood);
  const selectionContainer = document.querySelector('.selectionContainer');
  const newUI = document.querySelector('.newUI');

  // Fade out settings container
  selectionContainer.style.opacity = 0;
  selectionContainer.style.transform = 'translateX(-10%)';
  newUI.style.filter = 'blur(4px)';

  setTimeout(() => {
    selectionContainer.style.display = 'none';
    newUI.style.display = 'grid';
  }, 100);

  // Show new UI and fade it in
  setTimeout(() => {
    newUI.style.opacity = 1;
    newUI.style.transform = 'translateX(0%)';
    newUI.style.filter = 'blur(0px)';
    document.title = "MelodiMix - " + mood.charAt(0).toUpperCase() + mood.slice(1);
    newUI.querySelector('#playlistName').value = mood.charAt(0).toUpperCase() + mood.slice(1);

  }, 700); // Wait for the fade-out transition to complete (0.5s)
}

function loadPageContent(page, mood) {
  // Create a new XMLHttpRequest object
  var xhr = new XMLHttpRequest();

  // Define the URL of the HTML file containing the desired content
  var url = `views/${page}.html`;

  // Send a GET request to fetch the content
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // Extract the content of the desired div from the response
      var responseHTML = xhr.responseText;
      var parser = new DOMParser();
      var responseDoc = parser.parseFromString(responseHTML, 'text/html');
      var desiredContent = responseDoc.querySelector('#content').innerHTML;
      responseDoc.querySelector('#content').querySelector('#playlistName').value = mood;

      // Insert the content into the selectionContainer
      var selectionContainer = document.querySelector('.newUI');
      selectionContainer.innerHTML = desiredContent;
    }
  };
  xhr.send();
}
