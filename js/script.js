
let indexSong

/* Canción elegida */
const today = new Date()
const dayStarted = new Date(2022, 3, 25, 0, 0, 0, 0)
const msPerDay = 24*60*60*1000
const escuchadleNumber = Math.floor((today.getTime() - dayStarted.getTime()) / msPerDay) // el nº de días que pasaron desde dayStarted (01/01/2022)
escuchadleNumber < songsList.length? indexSong = escuchadleNumber: indexSong = escuchadleNumber-Math.floor((escuchadleNumber/songsList.length))*escuchadleNumber/songsList.length
const keySongsListSorted = keySongsList.sort()
const keySong = keySongsListSorted[indexSong][1]
const youTubeId = keySongsListSorted[indexSong][0]
//let youTubeId = "HgzGwKwLmgM" // test video

let time = 1750;
let timeToAdd = 1000;
const exponential = 2000;
const beginSong = 0;
let counterTry = 0;
let finalTime = time;
let finalTimeTemp = timeToAdd;
let idinterval, shareMsg, durationVideo;
let won = false;
let gameOver = false;
let d, h, m, s;
let currentTheme;
let shareScoreWapp;

/* Crear datos de hoy */
let userStats, lastStats, currentStreak;

let currentStats = {
    "id": escuchadleNumber,
    "song": keySong,
    "guessList": [],
    "won": false,
    "finished": false,
    "started": true,
    "score": 0,
};

/* Lista de mensajes */
const worngAnswerMsg = [
    `Es muy dificil acertar en la primera. `,
    `Tranqui, tenés más segundos para escuchar. `,
    `Está mal... pero no tan mal. `,
    `¡Ay! te estás acercando ¡pero no googlees! `,
    `¡Noooo! la última chance ¡qué miedo! `,
    `¡Mala suerte! La canción era:<br><br> ♫`,
];

const nextAnswerMsg = [
    `Es muy dificil acertar en la primera. `,
    `Tranqui, tenés más segundos para escuchar. `,
    `Está difícil ¿no? `,
    `Bueno, yo que vos voy arriesgando. `,
    `¡Noooo! la última chance ¡qué miedo! `,
    `¡Mala suerte! La canción era:<br><br> ♫`,
];

/*---------------------------------------------*/
/*--------- Obtener elementos del DOM ---------*/
/*---------------------------------------------*/

/* Body */
const body = document.querySelector("body");

/* Iconos del header con sus box ocultos */
const hearderIcons = document.querySelectorAll(".icon-header");
const boxesAbsolute = document.querySelectorAll(".icons-boxes-absolute");
const checkBox = document.querySelector("#myCheck");

/* Botones Ok/Salir y Cruz de los box absolutos */
const okButton = document.querySelectorAll(".ok");
const closeBox = document.querySelectorAll(".xmark-box");

/* Div del iframe de youtube */
const youtubeVideo =  document.querySelector(".youtube-video"); 

/* Secciones */
const header = document.querySelector("#header"); 
const main =  document.querySelector("main"); 
const opportunitiesSection = document.querySelector("#oportunities-section");
const gameSection = document.querySelector("#game-section");

/* Área de oportunidades */
const opportunitiesText = document.querySelectorAll(".opportunities");
const opportunitiesBox = document.querySelectorAll(".opportunities-box");

/* Área de mensajes, soundcloud y boton compartir */
const finalMsg = document.querySelector("#finalMsg");
const songShareBox = document.querySelector("#song-share-box");
const score = document.querySelector("#score");
const shareButton = document.querySelector("#share");
const copiedMsg = document.querySelector("#copied");

/* Barra de tiempo del reproductor */
const warningMsg = document.querySelector("#msg-warning");
const currentTimeBar = document.querySelector("#current-time-bar");
const currentTimeNumber = document.querySelector("#current-time");       
const finalTimeNumber = document.querySelector("#final-time");

/* Botones del reproductor local */
const playIcon = document.querySelector("#play-icon");
const playButton = document.querySelector("#play");
const pauseButton = document.querySelector("#pause");
const drawPlay = document.querySelector(".fa-play");
const drawEcualizer = document.querySelector(".gg-loadbar-sound");
const playCircle = document.querySelector(".fa-circle");
const loadingIcon = document.querySelector("#loading");

/* Input buscador y cruz para borrar */
const ulSongsList = document.querySelector("#songs-list");
const search = document.querySelector("#search");
const xmark = document.querySelector("#xmark");

/* Botones de arriesgar y pasar */
const submitButton = document.querySelector("#submit");
const skipButton = document.querySelector("#skip");
const searchBox = document.querySelector("#search-box");
const buttonsBox = document.querySelector("#buttonsBox");

/* Último mensaje */
const lastMsg = document.querySelector("#lastMsg");

/* Tiempo */
const timeFor = document.querySelector("#time-for");

/*---------------------------------------------*/
/*--------------- API YouTube  ----------------*/
/*---------------------------------------------*/

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: youTubeId,
        events: {
            'onReady': firstStep,
            'onStateChange': onPlayerStateChange
        }
    });
}

/*---------------------------------------------*/
/*----------------- FUNCIONES -----------------*/
/*---------------------------------------------*/

function firstStep(){
    uploadTimesToBegin();
    localStorageBegin();
    getDarkTheme();
}

function uploadTimesToBegin(){
    /* Actualiza los seg del botón PASAR */
    skipButton.innerHTML = `PASAR 🙄 (+${(timeToAdd)/1000} seg)`;

    /* Calcula el tiempo final de la canción en el último intento */
    for(let i = 0; i < (5-counterTry); i++){
        finalTime += finalTimeTemp;
        finalTimeTemp += exponential;
    }
    /* Coloca los seg del tiempo final en el reproductor */
    finalTimeNumber.innerHTML = (finalTime/100000).toFixed(2).replace(".",":");
}

function howToPlayBox(state){
    if(state){
        boxesAbsolute[3].style.display = "block";
        disableButtons(true);
        opacity("0.3")
    } else {
        boxesAbsolute[3].style.display = "none";
        disableButtons(false);
        opacity("1")
    }
}

function showImputButtons(){
    searchBox.style.display = "flex";
    buttonsBox.style.display = "flex";
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        playCircle.style.display = "block";
        loadingIcon.style.display = "none";
        showImputButtons();
        player.unMute();
        player.setVolume(100);
        drawTimeBar();
        changeColorsAndEqualizer(playing=true);
        playButton.disabled = true;
        warningMsg.style.display = "none";

        durationVideo = player.getDuration();

        setTimeout(stopVideo, time); /* que reproduzca la canción cierta cantidad de tiempo */
    }
    
}

/******************************** */

function playVideo(){
    playCircle.style.display = "none";
    loadingIcon.style.display = "block";
    playAudioSilence();
    player.playVideo();
}

function stopVideo() {
    player.pauseVideo();
    player.seekTo(0, true);
    changeColorsAndEqualizer(playing=false);
    clearInterval(idinterval); /* Cancelar el dibujo de la barra de tiempo de la canción */
    playButton.disabled = false;
}

function changeColorsAndEqualizer(playing){
    if(playing){
        currentTimeBar.classList.remove("bar-time-stop");
        currentTimeBar.classList.add("bar-time-play");
        drawPlay.style.visibility = "hidden";
        drawEcualizer.style.visibility = "visible";
    } else {
        currentTimeBar.classList.remove("bar-time-play");
        currentTimeBar.classList.add("bar-time-stop");
        drawPlay.style.visibility = "visible";
        drawEcualizer.style.visibility = "hidden";
    }
}

function drawTimeBar(){
    clearInterval(idinterval);
    let currentTime = 0;
    idinterval = setInterval( () => {
        currentTimeBar.style.width = currentTime*100/finalTime+"%";
        currentTime += 100;
        currentTimeNumber.innerHTML = (currentTime/100000).toFixed(2).replace(".",":");
        if(currentTime > time || (currentTime*100/finalTime > 100)){
            clearInterval(idinterval);
        }
    }, 100);
}

function writeTryMsg(skipped){
    if(gameOver && won){
        finalMsg.classList.remove("try-again");
        finalMsg.classList.add("won");
        finalMsg.innerHTML = `&#11088 ¡ SOS UNA LUZ ! &#11088;<br><br>&#127942; Sacaste el Escuchadle en ${counterTry+1} intento/s &#127942;`;
    }
    else if(gameOver && !won){
        finalMsg.classList.remove("try-again");
        finalMsg.classList.add("lost");
        finalMsg.innerHTML = worngAnswerMsg[counterTry] + keySong;
    }
    else if(!gameOver && skipped){
        finalMsg.classList.add("try-again");
        finalMsg.innerHTML = nextAnswerMsg[counterTry]+`Te quedan ${5-counterTry} intento/s más.`;
    }
    else {
        finalMsg.classList.add("try-again");
        finalMsg.innerHTML = worngAnswerMsg[counterTry]+`Te quedan ${5-counterTry} intento/s más.`;
    }
}

function guess(){
    /* No arriesgar si no hay nada escrito en el input */
    if(search.value == ""){
        search.focus();
        return;
    }
    stopVideo();
    /* Comprobar si adivinó */
    if(search.value.toLowerCase() == keySong.toLowerCase()){
        opportunitiesText[counterTry].innerHTML = "&#9989" + "&nbsp&nbsp" + search.value;
        gameOver = true;
        won = true;
        calculateScore();
        player.playVideo(); /* ------------------ agregar después */
    }
    /* Si no es el último intento (es decir, menor al intento 5) */
    else if (counterTry < 5){
        opportunitiesText[counterTry].innerHTML = "&#10060" + "&nbsp&nbsp" + search.value;
        gameOver = false;
    }
    /* Si es el último intento */
    else {
        opportunitiesText[counterTry].innerHTML = "&#10060" + "&nbsp&nbsp" + search.value;
        gameOver = true
        won = false;
        calculateScore()
        player.playVideo() /* ------------------ agregar después */
    }
    writeTryMsg(skipped=false);
    updateRound(gameOver);
    updateLocalStorage();
    search.value = "";
}

function skipChance(){
    stopVideo();
    /* Si no es el último intento (es decir, menor al intento 5) */
    if (counterTry < 5) {
        opportunitiesText[counterTry].innerHTML = "&#10060" + "&nbsp&nbsp" + "- - -";
        gameOver = false;
    }
    /* Si es el último intento */
    else {
        opportunitiesText[counterTry].innerHTML = "&#10060" + "&nbsp&nbsp" + "- - -";
        gameOver = true;
        won = false;
        calculateScore();
        player.playVideo() /* ------------------ agregar después */
    }
    writeTryMsg(skipped=true);
    updateRound();
    updateLocalStorage();
    search.value = "";
}

function updateRound(){
    if(gameOver){
        skipButton.innerHTML = `PASAR`;
        finalTimeNumber.innerHTML = "0:59";
        time = 120000;
        finalTime = 120000;
        disableButtons(true);
        youtubeVideo.style.display = "block";
        songShareBox.style.display = "flex";
        searchBox.style.display = "none";
        buttonsBox.style.display = "none";
        opportunitiesSection.classList.add("flex-col-center");
        gameSection.style.display = "none";
        lastMsg.style.display = "flex";
        main.style.justifyContent = "space-between";
        calculateNextEscuchadle();

    } else {
        counterTry++;
        time += timeToAdd;
        timeToAdd += exponential;
        skipButton.innerHTML = `PASAR 🙄 (+${(timeToAdd)/1000} seg)`;
        warningMsg.style.display = "none";
    }
}

function disableButtons(state){
    skipButton.disabled = state;
    playButton.disabled = state;
    submitButton.disabled = state;

}

function calculateScore(){
    shareMsg = `<img src="img/parlante.svg" alt="" width=25px></img>&nbsp`;
    shareScoreWapp = "🔉";
    if(won){
        for(let r=0; r<counterTry;r++){
            shareMsg += `<img src="img/rojo.svg" alt="" width=25px></img>&nbsp`;
            shareScoreWapp += "🟥";
        }
        shareMsg += `<img src="img/verde.svg" alt="" width=25px></img>&nbsp`;
        shareScoreWapp += "🟩";
        for(let w=0; w<5-counterTry;w++){
            shareMsg += `<img src="img/blanco.svg" alt="" width=25px></img>&nbsp`;
            shareScoreWapp += "⬜️";
        }
    } else {
        shareMsg += `<img src="img/rojo.svg" alt="" width=25px></img>&nbsp<img src="img/rojo.svg" alt="" width=25px></img>&nbsp<img src="img/rojo.svg" alt="" width=25px></img>&nbsp<img src="img/rojo.svg" alt="" width=25px></img>&nbsp<img src="img/rojo.svg" alt="" width=25px></img>&nbsp<img src="img/rojo.svg" alt="" width=25px></img>`;
        shareScoreWapp = "🔇🟥🟥🟥🟥🟥🟥";
    }
    score.innerHTML = shareMsg;
    opportunitiesBox.forEach(box => {
        box.style.display = "none";
    })
}

function opacity(state){
    header.style.opacity = state;
    opportunitiesSection.style.opacity = state;
    gameSection.style.opacity = state;
}

function calculateNextEscuchadle(){
    setInterval( () => {
        d = new Date();
        h = (23 - d.getHours());
        h =  h < 10 ? "0"+h : h;
        m = 60 - d.getMinutes();
        m = m < 10 ? "0"+m : m;
        s = 60 - d.getSeconds();
        s =  s < 10 ? "0"+s : s;
        timeFor.innerHTML = `${h}:${m}:${s}`;
    }, 1000);
}

function playAudioSilence(){
    var audio = document.getElementById("audio");
    audio.play()
    audio.loop = true;
}

function getDarkTheme(){
    currentTheme = localStorage.getItem("darktheme");
    currentTheme == "light" ? checkBox.checked = false : checkBox.checked = true;
    document.documentElement.setAttribute("data-theme", currentTheme);
}

/*---------------- LOCAL STORAGE --------------*/

function localStorageBegin(){
    /* Obtener datos del localStorage */
    userStats = JSON.parse(localStorage.getItem("stats"));
    /* Si nunca jugó... */
    if(!userStats){
        currentStats["currentStreak"] = 0;
        userStats = [];
        userStats.push(currentStats);
        howToPlayBox(true);
        return;
    } else {
        /* tomar el último juego (podría ser el actual porque salió y volvió a entrar)*/
        lastStats = userStats[userStats.length-1];

        /* Si no jugó hoy crear datos y comenzar por HowToPlayBox -> de lo contrario obtener datos y actualizar pantalla */
        if(lastStats["id"] != escuchadleNumber){
            currentStats["currentStreak"] = lastStats["currentStreak"];
            userStats.push(currentStats);
            howToPlayBox(true);
        } else {
            howToPlayBox(false);
            /* --- adaptar la interface de acuerdo a lo que haya jugado --- */

            /*Actualizar variables*/
            won = lastStats["won"];
            gameOver = lastStats["finished"];
            counterTry = lastStats["score"];
            currentStreak = lastStats["currentStreak"];

            /* Actualizar el tiempo escuchado y los cuadros de oportunidades */
            for(let i = 0; i < counterTry; i++){
                time += timeToAdd;
                timeToAdd += exponential;
                opportunitiesText[i].innerHTML = lastStats["guessList"][i];
                skipButton.innerHTML = `PASAR 🙄 (+${(timeToAdd)/1000} seg)`;
            };

            /* si terminó el juego */
            if(gameOver){
                updateRound();
                finalMsg.classList.remove("try-again");
                if(won){
                    calculateScore();
                    finalMsg.classList.add("won");
                    finalMsg.innerHTML = `&#11088 ¡ GANASTE ! &#11088;<br><br>&#127942; Sacaste el Escuchadle en ${counterTry+1} intento/s &#127942;`;
                } else {
                    calculateScore()
                    finalMsg.classList.add("lost");
                    finalMsg.innerHTML = worngAnswerMsg[counterTry] + keySong;
                }
            } else {
                finalMsg.classList.add("try-again");
                finalMsg.innerHTML = nextAnswerMsg[counterTry-1]+`Te quedan ${6-counterTry} intento/s más.`;
            }
        }
    }
    updateStatistics()
}

function updateLocalStorage(){
    currentStats = userStats[userStats.length-1];
    currentStats["started"] = true;
    currentStats["won"] = won;
    currentStats["finished"] = gameOver;
    currentStats["score"] = counterTry;
    if(won){
        currentStats["guessList"].push(opportunitiesText[counterTry].innerHTML);
    } else {
        currentStats["guessList"].push(opportunitiesText[counterTry-1].innerHTML);
    }
    if(gameOver){
        if(won){
            currentStats["currentStreak"] = currentStats["currentStreak"]+1;
        } else {
            currentStats["currentStreak"] = 0;
        }
    }
    localStorage.setItem("stats", JSON.stringify(userStats));
    updateStatistics();
}

/* actualizar y dibujar estadisticas */
function updateStatistics(){
    const markNumber = document.querySelectorAll(".mark-number");
    const averageNumber = document.querySelectorAll(".average-number");
    
    let try1 = try2 = try3 = try4 = try5 = try6 = tryX = 0;
    let finishedStats = userStats.filter( arr => arr["finished"]==true);
    
    if(finishedStats.length != 0){
        let playedStats = finishedStats.length;
        let currentStreak = finishedStats[playedStats-1]["currentStreak"];
        let maxStreak = (finishedStats.reduce( (before, after) => before["currentStreak"] > after["currentStreak"]? before : after))["currentStreak"];

        markNumber[0].innerHTML = playedStats;
        markNumber[2].innerHTML = currentStreak;
        markNumber[3].innerHTML = maxStreak;

        let wonStatsArray = (finishedStats.filter( arr => arr["won"]==true));
        let lostStatsArray = (finishedStats.filter( arr => arr["won"]==false));

        if(wonStatsArray.length != 0){
            let wonStats= wonStatsArray.length;
            markNumber[1].innerHTML = (wonStats*100/playedStats).toFixed(0);
            
            try1 = wonStatsArray.reduce( (acc, curr) => curr["score"] == 0? acc + 1 : acc, 0);
            try2 = wonStatsArray.reduce( (acc, curr) => curr["score"] == 1? acc + 1 : acc, 0);
            try3 = wonStatsArray.reduce( (acc, curr) => curr["score"] == 2? acc + 1 : acc, 0);
            try4 = wonStatsArray.reduce( (acc, curr) => curr["score"] == 3? acc + 1 : acc, 0);
            try5 = wonStatsArray.reduce( (acc, curr) => curr["score"] == 4? acc + 1 : acc, 0);
            try6 = wonStatsArray.reduce( (acc, curr) => curr["score"] == 5? acc + 1 : acc, 0);
        }

        if(lostStatsArray.length != 0){
            tryX = lostStatsArray.length;
        }

        averageNumber[0].innerHTML = (try1*100/playedStats).toFixed(0);
        averageNumber[1].innerHTML = (try2*100/playedStats).toFixed(0);
        averageNumber[2].innerHTML = (try3*100/playedStats).toFixed(0);
        averageNumber[3].innerHTML = (try4*100/playedStats).toFixed(0);
        averageNumber[4].innerHTML = (try5*100/playedStats).toFixed(0);
        averageNumber[5].innerHTML = (try6*100/playedStats).toFixed(0);
        averageNumber[6].innerHTML = (tryX*100/playedStats).toFixed(0);

        averageNumber[0].style.width = try1*100/playedStats+10+"%";
        averageNumber[1].style.width = try2*100/playedStats+10+"%";
        averageNumber[2].style.width = try3*100/playedStats+10+"%";
        averageNumber[3].style.width = try4*100/playedStats+10+"%";
        averageNumber[4].style.width = try5*100/playedStats+10+"%";
        averageNumber[5].style.width = try6*100/playedStats+10+"%";
        averageNumber[6].style.width = tryX*100/playedStats+10+"%";
    }
}


/*---------------------------------------------*/
/*------------- addEventListener --------------*/
/*---------------------------------------------*/

/* Click en íconos del header */
for(let i = 0; i < hearderIcons.length; i++){
    hearderIcons[i].addEventListener("click", () => {
        boxesAbsolute.forEach(icon => icon.style.display = "none");
        boxesAbsolute[i].style.display = "block";
        disableButtons(true)
        opacity("0.3")
    });
}

/* Click en OK/salir de los Box absolutos  */
for(let i = 0; i < okButton.length; i++){
    okButton[i].addEventListener("click", () => {
        boxesAbsolute[i].style.display = "none";
        disableButtons(false);
        opacity("1")
    })
}

/* Click en Cruz de los Box absolutos  */
for(let i = 0; i < closeBox.length; i++){
    closeBox[i].addEventListener("click", () => {
        boxesAbsolute[i].style.display = "none";
        disableButtons(false);
        opacity("1")
    });
}

submitButton.addEventListener("click", guess);
skipButton.addEventListener("click", skipChance);
playButton.addEventListener("click", playVideo);
pauseButton.addEventListener("click", stopVideo);

/* Abrir desplegable de canciones sugeridas al escribir en el input*/
search.addEventListener("input",function(){
    /* Si input está vacío...*/
    if(this.value.length == 0){
        ulSongsList.style.display = "none";
    } else {
        let expression = new RegExp(this.value,"i");
        
        /* eliminar todos los li*/
        let getLi = document.querySelectorAll("#songs-list li");
        getLi.forEach(li => li.remove());

        /* Agregar los li que coincidan con el texto */
        songsList.forEach(song => {
            if(expression.test(song)){
                let liTag = document.createElement("li");
                liTag.innerHTML = `♫ ${song}`;
                ulSongsList.appendChild(liTag);
                liTag.addEventListener("click", () => search.value = song); // Agrega la canción buscada en el input
            }
        })
        ulSongsList.style.display = "block";
    }
});

/* Cerrar desplegable de canciones sugeridas al hacer click*/
body.addEventListener("click", () => ulSongsList.style.display = "none");

/* Limpiar input al hacer click en la cruz*/
xmark.addEventListener("click", () => search.value = "" );

/* Compartir resultado*/
shareButton.addEventListener("click", () => {
    const shareData = {
        title: "#Escuchadle nº"+escuchadleNumber,
        text: "#Escuchadle nº"+escuchadleNumber+"\n"+shareScoreWapp+"\n",
        url: 'https://escuchadle.fun',
    }
    shareScoreWapp = "#Escuchadle nº"+escuchadleNumber+"\n\n"+shareScoreWapp+"\n\nhttps://escuchadle.fun"
    if(navigator.share){
        navigator.share(shareData)
    } else {
        navigator.clipboard.writeText(shareScoreWapp)
    }
    setTimeout( () => {
        copiedMsg.style.display = "none";
    }, 2500)
});

checkBox.addEventListener("click", () => {
    currentTheme = document.documentElement.getAttribute("data-theme");
    currentTheme == "light" ? currentTheme="dark" : currentTheme="light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    
    localStorage.setItem("darktheme", currentTheme); /* actualizar localStorage */
})