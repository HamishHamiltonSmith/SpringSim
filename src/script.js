const canv = document.getElementById("canvas")
canv.width = window.innerWidth;
canv.height = window.innerHeight;
const ctx = canv.getContext("2d");

var lConstant = 1;
var gravitationalConstant = 9.8;
var timeConstant = 1;
var airDensity = 1.29;

var weights = [];



//x = 1/2*a*t^2
//ma = -kx
// ma/k = x


function still() {
  if (airDensity == 150) {
    airDensity = 1.29;
    document.getElementById("s").innerHTML = "Mode: Osc";
    reset();
  } else {
    airDensity = 150;
    document.getElementById("s").innerHTML = "Mode: Still";
    reset();
  }
}


//clears all edit elements
function clearEdits() {
  $("#massBox").animate({ right: '-12.7vw' });
  $("#densityBox").animate({ right: '-12.7vw' });
  $(".sideBtn").remove();
  $(".sprSelect").remove();
  $(".kInput").remove();
}

function reset() {
  weights[0].reset();
}

function wipe() {
  spring = new Spring(null, 100, 2, [500, 100]);
  weight = new Weight([spring], 2);
  weights.pop();
  weights.push(weight);
}

function play() {
  var btn = document.getElementById("pp");
  if (timeConstant == 0) {
    //play

    timeConstant = 1;
    clearEdits();

    update();
    btn.innerHTML = "Edit";
  } else {
    //pause

    timeConstant = 0;
    btn.innerHTML = "Play";
  }
}


function addParallel(spring, weight) {
  weight.reset();
  weight.display();

  spring.isSprRight = true;
  var base = new Spring(null, spring.length, spring.springConstant, [spring.root[0] + (spring.sprWidth * weight.springs.length), spring.root[1]]);
  var bases = [base];
  var x = 0;

  while (spring.isAttatched) {
    var lower = bases[x];
    spring = spring.attatched;
    spring.isSprRight = true;

    lower.attatched = new Spring(null, spring.length, spring.springConstant, [spring.root[0] + (spring.sprWidth * weight.springs.length), spring.root[1]])
    lower.isAttatched = true;
    bases.push(lower.attatched);
    x++;
  }

  weight.springs.push(bases[0]);
  ctx.clearRect(0, 0, canv.width, canv.height);
  weight.reset();
  weight.display();
  weight.springs[0].updateSelector(weight, true);

  var btn = document.getElementsByClassName("sideBtn")[0];
  btn.style.left = (bases[0].root[0] + bases[0].sprWidth + 10).toString() + "px";
  btn.style.top = (bases[0].root[1] + (bases[0].length / 2)).toString() + "px";

  $(".sprSelect").hover(function() {
    $(this).animate({ opacity: "50%" }, "fast");
  }, function() {
    $(this).animate({ opacity: "0%" }, "fast");
  });
}

function addVerticalSpr(spring, weight) {
  //shift roots of weight springs down by length
  //find vertical index
  //append strings
  weight.reset();
  weight.display();
  var sprLen = 100;

  for (var x = 0; x < weight.springs.length; x++) {
    var spr = weight.springs[x];
    while (spr.isAttatched) {
      spr.root[1] += sprLen;
      spr = spr.attatched;
    }
    spr.root[1] += sprLen;
    spr.isAttatched = true;
    spr.attatched = new Spring(null, sprLen, spr.springConstant, [spr.root[0], spr.root[1] - sprLen]);
  }


  ctx.clearRect(0, 0, canv.width, canv.height);
  weight.reset();
  weight.display();
  weight.springs[0].updateSelector(weight, true);
}

function createParallelNode(spring, weight) {
  var btn = document.createElement("button");
  btn.innerHTML = "+";
  btn.className = "sideBtn";
  btn.style.position = "absolute";
  btn.style.left = (spring.root[0] + spring.sprWidth + 10).toString() + "px";
  btn.style.top = (spring.root[1] + (spring.length / 2)).toString() + "px";
  btn.setAttribute('onclick', 'addParallel(spring, weight)');
  document.body.appendChild(btn);
}

class Spring {
  constructor(attatchmentNode, length, springConstant, attatchmentPoint = [0, 0]) {
    this.attatched = attatchmentNode;
    this.springConstant = springConstant;
    this.length = length;
    this.start = length;
    this.isAttatched = false;
    this.sprWidth = 100
    this.frequency = 0.3;
    this.velocity = 0;
    this.position = 0;
    this.isSprRight = false;

    this.selector = document.createElement("div");
    this.selector.className = "sprSelect";
    this.selector.style.width = this.sprWidth + "px";
    this.selector.style.height = this.length + "px";
    this.selector.style.position = "absolute";
    this.selector.style.background = "#00C2D1";
    this.selector.style.opacity = "0%";
    this.selector.style.borderRadius = "1vw";

    if (this.attatched != null) {
      this.root = this.attatched.end;
      this.isAttatched = true;
    } else {
      this.root = attatchmentPoint;
    }

    this.selector.style.left = this.root[0] + 8 + "px";
    this.selector.style.top = this.root[1] + "px";

    this.end = [this.root[0], this.root[1] + this.length];
  }

  getLen() {
    if (this.isAttatched) {
      return (this.length / 30 + this.attatched.getLen());
    } else {
      return this.length / 30;
    }
  }

  getVel() {
    if (this.isAttatched) {
      return this.velocity + this.attatched.getVel();
    } else {
      return this.velocity;
    }
  }

  display(mass, weight) {
    ctx.fillStyle = "green";

    //Units
    //Velocity : meters/s
    //Length   : pixels
    //Position : pixels

    //a=f/m
    this.velocity += weight / mass;
    this.velocity += (-this.springConstant * (this.position / 30)) / mass


    var prev = [this.root[0] + this.sprWidth / 2, this.root[1]];
    for (var x = 0; x < this.length + 1; x += 3) {
      ctx.beginPath();
      ctx.lineWidth = this.springConstant * 0.5 + 0.5;
      ctx.moveTo(prev[0] + 0.5, prev[1] + 0.5);
      var point = [Math.sin(2 + x * this.frequency) * 50 + this.root[0] + this.sprWidth / 2, this.root[1] + x]
      ctx.lineTo(point[0] + 0.5, point[1] + 0.5);
      ctx.stroke();
      prev = point;
    }

    this.length += (this.velocity / 60 * 30);
    this.frequency = 1 / this.length * 20;
    this.position = this.length - this.start;

    ctx.beginPath();
    ctx.fillStyle = "red"
    ctx.fillRect(this.root[0], this.root[1], this.sprWidth, 10)
    ctx.fill();

    if (this.isAttatched == true) {
      this.attatched.display(mass, weight);
      this.root[1] = this.attatched.root[1] + this.attatched.length;
      this.end = [this.root[0], this.root[1] + this.length];
    }
  }

  updateSelector(weight, isSprBottom) {
    document.body.appendChild(this.selector);
    var s = this.selector;
    var k = this.springConstant;
    var spr = this;

    this.selector.style.left = this.root[0] + 8 + "px";
    this.selector.style.top = this.root[1] + 10 + "px";

    if (this.isAttatched) {
      this.attatched.updateSelector(weight, false);
    }

    this.selector.style.width = this.sprWidth * weight.springs.length + "px";
    this.selector.style.height = this.length - 10 + "px";

    this.selector.onclick = function() {
      var cont = document.createElement("div");
      cont.style.width = "auto";
      cont.style.height = "auto";
      cont.className = "kInput";
      cont.style.borderRadius = "1.5vw";
      cont.style.paddingLeft = "2vw";
      cont.style.paddingRight = "2vw";
      cont.style.display = "flex";
      cont.style.flexDirection = "row";
      cont.style.flexWrap = "wrap";
      cont.style.alignItems = "center";

      cont.style.backgroundImage = "linear-gradient(to bottom right, #011638, #141414)";
      cont.style.position = "absolute";
      cont.style.left = s.style.left + 100;
      cont.style.top = s.style.top;

      var springK = document.createElement("h3");
      springK.innerHTML = "Spring constant: ";
      springK.style.color = "white";
      springK.style.float = "left";
      cont.appendChild(springK);

      var slider = document.createElement("input");
      slider.type = "range";
      slider.style.width = "40%";
      slider.style.float = "right";
      slider.min = 1;
      slider.max = 10;
      slider.value = k;
      cont.appendChild(slider);

      var kDisplay = document.createElement("h1");
      kDisplay.style.color = "white";
      kDisplay.style.flexBasis = "40%";
      kDisplay.innerHTML = spr.springConstant.toString() + "N/m";
      cont.appendChild(kDisplay);

      if (isSprBottom) {
        var addVertical = document.createElement("button");
        addVertical.style.width = "10vw";
        addVertical.style.height = "auto";
        addVertical.style.flexBasis = "50%";
        addVertical.innerHTML = "Add Vertical";
        addVertical.style.color = "black";
        addVertical.style.border = "1vw solid black";
        addVertical.style.borderRadius = "1vw";
        addVertical.style.backgroundColor = "white";
        addVertical.onclick = function() {
          addVerticalSpr(spr, weight);
        }
        cont.appendChild(addVertical);
      }

      slider.addEventListener("change", function() {

        //Update for this spring
        var order = 0;
        var s = weight.springs[0];
        while (s != spr) {
          s = s.attatched;
          order++;
        }

        for (var x = 0; x < weight.springs.length; x++) {
          var topSpr = weight.springs[x]
          for (var y = 0; y < order; y++) {
            topSpr = topSpr.attatched;
          }
          topSpr.springConstant = this.value;
        }

        weight.reset();
        kDisplay.innerHTML = this.value.toString() + "N/m";
      })


      document.body.appendChild(cont);
    }
  }

  edit(weight) {
    if (!this.isSprRight) {
      createParallelNode(this, weight);
    }
  }

  reset() {
    this.length = this.start;
    this.frequency = 0.3;
    this.velocity = 0;
    this.position = 0;

    if (this.isAttatched) {
      this.attatched.reset();
    }
  }

}

class Weight {
  constructor(springs, mass) {
    this.w = mass * gravitationalConstant;
    this.m = mass;
    this.springs = [];
    this.massSize = 100;


    for (var x = 0; x < springs.length; x++) {
      this.springs.push(springs[x])
    }

    ctx.font = "40px main";
  }

  display() {
    ctx.fillStyle = "green";
    ctx.fillRect(this.springs[0].end[0], this.springs[0].root[1] + this.springs[0].length, this.massSize * this.springs.length, this.massSize)

    ctx.fillStyle = "white";
    ctx.fillText((Math.floor(this.springs[0].getLen() * 10) / 10).toString() + "m", this.springs[0].end[0], this.springs[0].root[1] + this.springs[0].length + 50);

    for (var x = 0; x < this.springs.length; x++) {
      //Effective weight lower due to air resistance
      if (this.springs[x].getVel() > 0) {
        this.springs[x].display(this.m / this.springs.length, (this.w - (0.5 * (this.springs[x].velocity ** 2) * airDensity * 0.001)) / this.springs.length);
      } else {
        this.springs[x].display(this.m / this.springs.length, (this.w + (0.5 * (this.springs[x].velocity ** 2) * airDensity * 0.001)) / this.springs.length);
      }
    }
  }

  edit() {
    var massContainer = document.getElementById("massBox")
    massContainer.style.visibility = "visible";
    $("#massBox").animate({ right: '2vw' });
    $("#densityBox").animate({ right: '2vw' });


    var slider = document.getElementById("massInput");
    slider.min = 1;
    slider.max = 10 * this.springs.length;
    slider.value = weights[0].m;

    var density = document.getElementById("densityInput");
    density.min = 0;
    density.max = 5;
    density.step = 0.1;
    density.value = airDensity;


    var massRead = document.getElementById("massDisplay");
    massRead.innerHTML = weights[0].m.toString() + "kg";
    slider.addEventListener("change", function() {
      weights[0].m = parseInt(slider.value);
      weights[0].w = parseInt(slider.value * gravitationalConstant);
      massRead.innerHTML = slider.value.toString() + "kg";
    });

    var densityRead = document.getElementById("densityDisplay");
    densityRead.innerHTML = airDensity.toString() + "kgm<sup>-3</sup>";
    density.addEventListener("change", function() {
      airDensity = density.value;
      densityRead.innerHTML = airDensity.toString() + "kgm<sup>-3</sup>";
    });


    document.body.appendChild(container);


    this.springs[this.springs.length - 1].edit(this);
    this.springs[0].updateSelector(this, true);
    var spr = this.springs[0];

    $(".sprSelect").hover(function() {
      $(this).css("opacity", "50%");
    }, function() {
      $(this).css("opacity", "0%");
    });
  }

  reset() {
    for (var x = 0; x < this.springs.length; x++) {
      this.springs[x].reset();
    }
  }
}

//Object defaults
var spring = new Spring(null, 100, 2, [500, 100]);
var weight = new Weight([spring], 2);
weights.push(weight);

function update() {
  if (timeConstant != 0) {
    ctx.clearRect(0, 0, canv.width, canv.height);
    for (var x = 0; x < weights.length; x++) {
      weights[x].display();
    }

    window.requestAnimationFrame(update);
  } else {
    for (var x = 0; x < weights.length; x++) {
      weights[x].edit();
    }
  }
}
window.requestAnimationFrame(update);
