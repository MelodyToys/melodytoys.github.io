const colors = ['red', 'blue', 'yellow', 'green'];
const levels = [1000, 600, 200];
const sounds = [
  new Audio('media/Sound1.mp3'), 
  new Audio('media/Sound2.mp3'), 
  new Audio('media/Sound3.mp3'), 
  new Audio('media/Sound4.mp3'),
  new Audio('media/Game_start.mp3'),
  new Audio('media/start_beep.mp3'),
  new Audio('media/Error-sound.mp3'),
  new Audio('media/Game_Win.mp3')
];
const Rounds = 10;
const LedOnDuration = 200;
const CountDisplayDuration = 150;

let simon = {
  power: false,
  sound: true,
  level: 3,
  rounds: Rounds,
  strict: false,
  count: 0,
  randomSequence: [],
  userCounter: 0
}

let timeOut = [];
let interval;

$(document).ready(function() {
  disableClicks();
});

// ------ Event handlers --------//
$('#power-box').click(() => {
  simon.power = !simon.power;
  if (simon.power) {
    $('#power').css('float', 'left');
    if (simon.sound) {
      sounds[4].currentTime = 0;
      sounds[4].play();
    }
    //turn on lights
    $('#count').removeClass('count-off').addClass('count-on');
    $('#start-led').removeClass('led-off').addClass('led-on-green');
    //light up all colors
    $('.pad').each( (i, e) => {
      let id = e.getAttribute('id');
      $('#' + id).removeClass(id + '-off').addClass(id + '-on');
      timeOut.push( setTimeout(() => $('#' + id).removeClass(id + '-on').addClass(id + '-off'), LedOnDuration) );
    });
    //enable buttons
    enableClicks();
    //but disable the pads, until start is clicked
    $('.pad').addClass('disabled');
  }
  else {
    resetGame();
    clearTimers();
    $('#power').css('float', 'right');
    //turn off all lights
    $('#count').removeClass('count-on').addClass('count-off');
    $('#count').html('- -');
    $('#start-led').removeClass('led-on-green').addClass('led-off');
    $('#strict-led').removeClass('led-on-red').addClass('led-off');
    //disable buttons
    disableClicks();
  }
})

$('#sound-box').click(() => {
  simon.sound = !simon.sound;
  if (simon.sound) {
    $('#sound').css('float', 'left');
  }
  else {
    $('#sound').css('float', 'right');   
  }
})

$('#level-box').click(() => {
  if (simon.level === 1) {
    simon.level = 2;
    $('#level').css('margin', 'auto');
    $('#level').css('float', 'none');
  }
  else if (simon.level === 2) {
    simon.level = 3;
    $('#level').css('float', 'right');
    $('#level').css('margin', '0px 2px 0px 1px');
  }
  else if (simon.level === 3) {
    simon.level = 1;
    $('#level').css('float', 'left');
    $('#level').css('margin', '0px 2px 0px 1px');
  }
  //if rounds changed in the middle of the game, restart game
  if (simon.randomSequence.length)
    startGame();
})

$('#rounds-box').click(() => {
  if (simon.rounds === 10) {
    simon.rounds = 20;
    $('#rounds').css('margin', 'auto');
    $('#rounds').css('float', 'none');
  }
  else if (simon.rounds === 20) {
    simon.rounds = 30;
    $('#rounds').css('float', 'right');
    $('#rounds').css('margin', '0px 2px 0px 1px');
  }
  else if (simon.rounds === 30) {
    simon.rounds = 10;
    $('#rounds').css('float', 'left');
    $('#rounds').css('margin', '0px 2px 0px 1px');
  }

  //if rounds changed in the middle of the game, restart game
  if (simon.randomSequence.length)
    startGame();
})

$('#strict').click(() => {
  simon.strict = !simon.strict;
  if (simon.strict) {
    $('#strict-led').removeClass('led-off').addClass('led-on-red');
  }
  else {
    $('#strict-led').removeClass('led-on-red').addClass('led-off');
  }
  startGame();
})

//User Inputs
$('.pad').click((e) => {
  let color = e.target.id;
  let i = colors.indexOf(color); //get color index

  //light up clicked color
  $('#' + color).removeClass(color + '-off').addClass(color + '-on');
  //remove light up
  timeOut.push( setTimeout(() => $('#' + color).removeClass(color + '-on').addClass(color + '-off'), LedOnDuration) );

  //if color matches the sequence, play sound
  if (color === colors[simon.randomSequence[simon.userCounter]]) {
    simon.userCounter++;  //increment user click sequence counter
    if (simon.sound) {
      sounds[i].currentTime = 0;
      sounds[i].play();
    }

    if (simon.userCounter === simon.randomSequence.length) {
      //get the next color
      timeOut.push( setTimeout(() => getNextColor(), 200) );
    }
  }

  //incorrect sequence, display blinking XX & play error sound
  else { 
    let count = '';
    interval =  setInterval(() => {
      count = count == 'XX' ? '' : 'XX';
      $('#count').html(count);
    }, CountDisplayDuration);
    timeOut.push( setTimeout(() => clearInterval(interval), CountDisplayDuration * 3) );

    if (simon.sound) {
      sounds[6].currentTime = 0;
      sounds[6].play();
    }

    if (!simon.strict) {
      //play sequence again for player
      timeOut.push( setTimeout(() => playSequence(), (CountDisplayDuration * 3) + 50) );
    }
    else {
      startGame();
    }
  }
})

$('#start').click(() => {
  if (simon.sound) {
    sounds[5].currentTime = 0;
    sounds[5].play();
  }
  startGame();
})

$('#info').click(() => {
  $('#information').show()
})

$('#close').click(() => {
  $('#information').hide();
})

//----- Game functionality -------//
function startGame() {
  resetGame();
  getNextColor();
}

function resetGame() {
  simon.count = 0;
  simon.randomSequence = [];
}

function clearTimers() {
  clearInterval(interval);
  timeOut.forEach( timer => {
    clearTimeout(timer);
  });
}

function enableClicks() {
  $('.pad').removeClass('disabled');
  $('#sound-box').removeClass('disabled');
  $('#level-box').removeClass('disabled');
  $('#rounds-box').removeClass('disabled');
  $('.button').removeClass('disabled');
}

function disableClicks() {
  $('.pad').addClass('disabled');
  $('#sound-box').addClass('disabled');
  $('#level-box').addClass('disabled');
  $('#rounds-box').addClass('disabled');
  $('.button').addClass('disabled');
}

function getRandomColor() {
  return Math.floor(Math.random() * 4);
}

function getNextColor() {
  let winDur = 100;
  if (simon.randomSequence.length === simon.rounds) {
    //display blinking WIN & play win sound
    let count = '';
    interval = setInterval(() => {
                  count = count == 'WIN' ? '' : 'WIN';
                  $('#count').html(count);
                }, CountDisplayDuration);
    timeOut.push( setTimeout(() => clearInterval(interval), CountDisplayDuration * 3) );

    if (simon.sound) {
      sounds[7].currentTime = 0;
      sounds[7].play();
    }
    // start game after 1000 ms
    winDur = 1000;
    resetGame();
  }
  
  let color = getRandomColor();
  simon.randomSequence.push(color);
  simon.count++;
  //play sequence again for player
  timeOut.push( setTimeout(() => playSequence(), (CountDisplayDuration * 3) + winDur) );
}

function playSequence() {
  disableClicks();
  // play note by note
  let duration = 0;
  let speed = getSpeed();

  timeOut.push ( setTimeout(() => $('#count').html(simon.count), speed - 200) );
  simon.randomSequence.map( color => {
    timeOut.push( setTimeout(() => { //light up color & play sound
        $('#' + colors[color]).removeClass(colors[color] + '-off').addClass(colors[color] + '-on');
          if (simon.sound) {
            sounds[color].currentTime = 0;
            sounds[color].play();
          }
    }, duration += speed) );

    timeOut.push( setTimeout(() => { //turn off color
        $('#' + colors[color]).removeClass(colors[color] + '-on').addClass(colors[color] + '-off');   
    }, duration += LedOnDuration) );

  });
  
  //Get user input after displaying sequence
  timeOut.push( setTimeout(checkUserSequence, simon.randomSequence.length * (levels[simon.level - 1] + LedOnDuration)) );
}

function checkUserSequence() {
  simon.userCounter = 0;
  enableClicks();
}

//Game speeds up as round progresses depending on the level
function getSpeed() {
  let speed;
  switch (simon.level) {
    case 3: 
      if (simon.count <= 10)
        speed = 400;
      else if (simon.count <= 15)
        speed = 300;
      else if (simon.count <= 20)
        speed = 200;
      else 
        speed = 100;
      break;
  
    case 2: 
      if (simon.count <= 5)
        speed = 800;
      else if (simon.count <= 10)
        speed = 600;
      else if (simon.count <= 15)
        speed = 400;
      else if (simon.count <= 20)
        speed = 300;
      else if (simon.count <= 25)
        speed = 200;
      else 
        speed = 100;
      break;
      
    default:
      if (simon.count <= 5)
        speed = 1000;  
      else if (simon.count <= 10)
        speed = 800;
      else if (simon.count <= 15)
        speed = 600;
      else if (simon.count <= 20)
        speed = 400;
      else if (simon.count <= 25)
        speed = 300;
      else
        speed = 200;
  }   
  return speed;
}