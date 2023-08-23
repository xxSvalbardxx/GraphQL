
//Logout button
var logout = document.getElementsByClassName("logout_button");
//console.log(logout);
logout[0].addEventListener('click', (event) => {
  //console.log("logout");
  event.preventDefault();
  localStorage.removeItem('jwt');
  window.location.href = "index.html";
});


// Get the JWT from local storage : JWT is for "Json Web Token"
var jwt = localStorage.getItem('jwt');

/* -------------------------------------------------------------------------------------------- */

fetchUserData();
// Basic user identification and ratio
function fetchUserData() {
  fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Set Basic authentication headers with base64 encoding
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      query: `
        query {
            user {
                attrs
                email
                firstName
                lastName
                login
                totalDown
                totalUp
            }
        }
        `,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      DisplayProfile(data);
      DisplayRatio(data);
    })
    .catch((error) => {
      console.error('Introspection failed at basic infos:', error);
    });
}


// Function to update the SVG graph size and redraw it on window resize
function updateSVGs() {
  // Clear the SVG container
  document.getElementById('svg_container_up').innerHTML = '';
  document.getElementById('svg_container_down').innerHTML = '';
  document.getElementById('svg_xp_curve').innerHTML = '';

  // Redraw the SVG graph with updated data
  fetchUserData();
  fetchXPcurve();
}

/* // Listen to the window resize event and update the SVG graph size accordingly
window.addEventListener('resize', updateSVGSizeAndRedrawGraph); */
// Same as above but with a timeout to avoid calling the function too many times
window.addEventListener('resize', () => {
  clearTimeout(window.resizedFinished);
  window.resizedFinished = setTimeout(updateSVGs, 250);

});


// Display the user's ratio
function DisplayRatio(data = {}) {
  document.getElementById('svg_container_up').innerHTML = '';
  document.getElementById('svg_container_down').innerHTML = '';

  var total_up = document.getElementById('total_up');
  var total_down = document.getElementById('total_down');


  //console.log(data.data.user[0].totalUp);
  // multiply by 100000 to get Mb and round it to 2 decimals
  total_up.innerHTML = "Done : " + Math.round(data.data.user[0].totalUp / 10000) / 100 + " Mb";
  total_down.innerHTML = "Received : " + Math.round(data.data.user[0].totalDown / 10000) / 100 + " Mb";
  var ratio_value = document.getElementById('ratio_value');
  var ratio = data.data.user[0].totalUp / data.data.user[0].totalDown;
  // round the ratio to 1 decimals
  ratio = Math.round(ratio * 10) / 10;
  // make appear one decimal

  ratio = ratio.toFixed(1);

  ratio_value.innerHTML = "Ratio : " + ratio;

  // Calculate the proportions
  //var totalUp = Math.round((data.data.user[0].totalUp / 10000) / 100);
  //var totalDown = Math.round((data.data.user[0].totalDown / 10000) / 100);
  // same as above but not rounded
  var totalUp = (data.data.user[0].totalUp / 10000) / 100;
  var totalDown = (data.data.user[0].totalDown / 10000) / 100;

  var total = (totalUp + totalDown);
  //console.log(totalUp);
  //console.log(totalDown);
  //console.log(total);

  // Set the dimensions and position of the SVG container
  // the width must be 50% of the parent container but when we set it to 50% it doesn't work so we set it to 100% and then we divide it by 2
  var parentWidth = document.getElementById('ratio_infos').offsetWidth;
  var svgWidth = parentWidth;
  var parentHeight = document.getElementById('ratio_infos').offsetHeight;
  var svgHeight = parentHeight / 2;


  // Calculate the coordinates of the lines
  var y1 = 50 + "%"
  var y2 = 50 + "%";
  var x1 = 0;
  var x2 = (totalUp / total) * svgWidth;
  var x3 = 0;
  var x4 = (totalDown / total) * svgWidth;



  // Create the SVG element
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);

  var svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg2.setAttribute('width', svgWidth);
  svg2.setAttribute('height', svgHeight);

  // Create the first line
  var line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.setAttribute('x1', x1);
  line1.setAttribute('y1', y1);
  line1.setAttribute('x2', x2);
  line1.setAttribute('y2', y1);
  line1.setAttribute('stroke', 'blue');
  line1.setAttribute('stroke-width', 10);

  var antiline1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  antiline1.setAttribute('x1', x2);
  antiline1.setAttribute('y1', y1);
  antiline1.setAttribute('x2', svgWidth);
  antiline1.setAttribute('y2', y1);
  antiline1.setAttribute('stroke', 'lightblue');
  antiline1.setAttribute('stroke-width', 10);


  // Create the second line
  var line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line2.setAttribute('x1', x3);
  line2.setAttribute('y1', y2);
  line2.setAttribute('x2', x4);
  line2.setAttribute('y2', y2);
  line2.setAttribute('stroke', 'red');
  line2.setAttribute('stroke-width', 10);

  var antiline2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  antiline2.setAttribute('x1', x4);
  antiline2.setAttribute('y1', y2);
  antiline2.setAttribute('x2', svgWidth);
  antiline2.setAttribute('y2', y2);
  antiline2.setAttribute('stroke', 'pink');
  antiline2.setAttribute('stroke-width', 10);

  // Append the lines to the SVG element
  svg.appendChild(line1);
  svg.appendChild(antiline1);
  svg2.appendChild(line2);
  svg2.appendChild(antiline2);

  // Add the SVG element to the DOM
  var container = document.getElementById('svg_container_up');
  var container2 = document.getElementById('svg_container_down');
  container.appendChild(svg);
  container2.appendChild(svg2);
}

// Display the user's profile
function DisplayProfile(data = {}) {
  var hello = document.getElementById('hello');
  var profile_image = document.getElementById('profile_image');
  var profile_username = document.getElementById('profile_username');
  var profile_email = document.getElementById('profile_email');
  var profile_firstname = document.getElementById('profile_firstname');
  var profile_lastname = document.getElementById('profile_lastname');
  var profile_phone = document.getElementById('profile_phone');
  var profile_address = document.getElementById('profile_address');


  //console.log(data.data.user[0].attrs.email);
  //console.log(data.data.user[0].email);

  profile_image.src = data.data.user[0].attrs.image;
  //console.log(data.data.user[0].attrs.image);
  hello.innerHTML = "Hello " + data.data.user[0].login + " !";
  profile_username.innerHTML = "Username : " + data.data.user[0].login;
  profile_email.innerHTML = "Email : " + data.data.user[0].email;
  profile_firstname.innerHTML = "First Name : " + data.data.user[0].firstName;
  profile_lastname.innerHTML = "Last Name : " + data.data.user[0].lastName;
  profile_phone.innerHTML = "Phone Number : " + data.data.user[0].attrs.Phone;
  profile_address.innerHTML = "Address : " + data.data.user[0].attrs.addressStreet + " " + data.data.user[0].attrs.addressPostalCode + " " + data.data.user[0].attrs.addressCity + ", " + data.data.user[0].attrs.addressCountry;

}

/* -------------------------------------------------------------------------------------------- */

// For xp
fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Set Basic authentication headers with base64 encoding
    'Authorization': `Bearer ${jwt}`,
  },
  body: JSON.stringify({
    query: `
        query  {
          transaction_aggregate(where: {type: {_eq: "xp"}, eventId: {_eq: 32}}) { aggregate { sum { amount } } }
          
        }
        
        `,
  }),
})
  .then(res => res.json())
  .then(data => {
    //console.log(data);
    DisplayXP(data);
  })
  .catch(err => console.error('Introspection failed at XP:', err));

function DisplayXP(data = {}) {
  var xp = document.getElementById('xp');
  var xp_total = 0;

  //console.log(data.data.transaction_aggregate.aggregate.sum.amount);
  // multiply by 100000 to get Mb and round it to 2 decimals
  xp_total = data.data.transaction_aggregate.aggregate.sum.amount;

  //console.log(xp_total);    
  xp.innerHTML = "XP : " + xp_total;
}

/* -------------------------------------------------------------------------------------------- */

// For XP curve
fetchXPcurve();
function fetchXPcurve() {
  fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Set Basic authentication headers with base64 encoding
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      query: `
        query  {
          user {
            transactions(where: {
              _and: [
                { object: { progresses: { isDone: { _eq: true } } } }
                {
                  _and: [
                    { path: { _ilike: "%div-01%" } }
                    { path: { _nilike: "%div-01/piscine-js/%" } }
                    { path: { _nilike: "%div-01/piscine-rust/%" } }
                  ]
                }
                { type: { _eq: "xp" } }
              ]
            }, order_by: { createdAt: asc }) {
              path
              amount
              createdAt
              object {
                name
                type
              }
            }
          }
          }
        `,
    }),
  })
    .then(res => res.json())
    .then(data => {
      //console.log(data);
      // calulate the total of xp
      var xp_total = 0;
      for (var i = 0; i < data.data.user[0].transactions.length; i++) {
        xp_total += data.data.user[0].transactions[i].amount;
      }
      //console.log("en sortie de fetch : " + xp_total);

      clean_XP_data(data);
    })
    .catch(err => console.error('Introspection failed at XP:', err));
}
function clean_XP_data(data = {}) {

  var xp_object = [];
  // create an object with the name, date and amount of xp
  for (var i = 0; i < data.data.user[0].transactions.length; i++) {
    var name = data.data.user[0].transactions[i].object.name;
    var date = new Date(data.data.user[0].transactions[i].createdAt);
    // convert the date to the format "2023-07-10"
    date = date.toISOString().slice(0, 10);
    var amount = data.data.user[0].transactions[i].amount;
    var path = data.data.user[0].transactions[i].path;
    // verify if the xp is a float or an int
    xp_object.push({ name: name, date: date, amount: amount, path: path });
  }

  var xp_object_clean = [];

  for (var item of xp_object) {
    if (item.path.includes('checkpoint')) {
      xp_object_clean.push({
        name: item.name,
        date: item.date,
        amount: item.amount,
        createdAt: item.createdAt
      });
    } else {
      var existingItemIndex = xp_object_clean.findIndex(existingItem => existingItem.name === item.name);
      if (existingItemIndex !== -1) {
        if (item.amount > xp_object_clean[existingItemIndex].amount) {
          xp_object_clean[existingItemIndex].amount = item.amount;
        }
      } else {
        xp_object_clean.push({
          name: item.name,
          date: item.date,
          amount: item.amount,
          createdAt: item.createdAt
        });
      }
    }
  }

  //console.log(xp_object_clean);

  // xp total
  var xp_total = 0;
  for (var i = 0; i < xp_object_clean.length; i++) {
    xp_total += xp_object_clean[i].amount;
  }
  //console.log("xp_obj_clean total  = " + xp_total);


  /* // Append the lines to the SVG element
  svg.appendChild(line);
  console.log(line);
  xp_curve.appendChild(svg); */

  DisplayXPcurve(xp_object_clean);
}


// This function will display the XP curve. The curve will represent the evolution of the XP accumulated over time.
function DisplayXPcurve(data = {}) {
  document.getElementById("svg_xp_curve").innerHTML = "";

  var parentWidth = document.getElementById('svg_xp_curve').clientWidth;
  var svgWidth = parentWidth;
  var parentHeight = document.getElementById('svg_xp_curve').clientHeight;
  var svgHeight = parentHeight;

  // draw the two axes of the graph: one for the months and one for the xp
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", svgHeight);
  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  // draw the x axis
  var xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", 60);
  xAxis.setAttribute("y1", svgHeight - 60);
  xAxis.setAttribute("x2", svgWidth);
  xAxis.setAttribute("y2", svgHeight - 60);
  xAxis.setAttribute("stroke", "white");
  xAxis.setAttribute("stroke-width", 3);
  svg.appendChild(xAxis);

  // draw the y axis
  var yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", 60);
  yAxis.setAttribute("y1", 0);
  yAxis.setAttribute("x2", 60);
  yAxis.setAttribute("y2", svgHeight - 60);
  yAxis.setAttribute("stroke", "white");
  yAxis.setAttribute("stroke-width", 3);
  svg.appendChild(yAxis);

  // draw the x axis labels
  var xLabels = document.createElementNS("http://www.w3.org/2000/svg", "g");
  xLabels.setAttribute("class", "xLabels");
  svg.appendChild(xLabels);

  // draw the y axis labels
  var yLabels = document.createElementNS("http://www.w3.org/2000/svg", "g");
  yLabels.setAttribute("class", "yLabels");
  svg.appendChild(yLabels);


  // draw the x axis ticks. each ticks will be a month. From june 2022 to june 2024
  //var months = ["June 2022", "July", "August", "September", "October", "November", "December", "January 2023", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "January 2024", "February", "March", "April", "May", "June", " "];
  // same as above but in the format "2023-07"
  var months = ["2022-06", "2022-07", "2022-08", "2022-09", "2022-10", "2022-11", "2022-12", "2023-01", "2023-02", "2023-03", "2023-04", "2023-05", "2023-06", "2023-07", "2023-08", "2023-09", "2023-10", "2023-11", "2023-12", "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "", ""];
  var xTicks = document.createElementNS("http://www.w3.org/2000/svg", "g");
  xTicks.setAttribute("class", "xTicks");
  svg.appendChild(xTicks);

  for (var i = 0; i < months.length; i++) {

    // draw the x axis ticks
    var xTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xTick.setAttribute("x1", 60 + (svgWidth - 60) / months.length * i);
    //xTick.setAttribute("y1", svgHeight - 60);
    xTick.setAttribute("y1", 0);
    xTick.setAttribute("x2", 60 + (svgWidth - 60) / months.length * i);
    xTick.setAttribute("y2", svgHeight - 55);
    //xTick.setAttribute("stroke", "white");
    xTick.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
    xTick.setAttribute("stroke-width", 1);
    xTicks.appendChild(xTick);

    // draw the x axis labels (months)
    var xTickText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xTickText.setAttribute("x", 60 + (svgWidth - 30) / months.length * i);
    xTickText.setAttribute("y", svgHeight - 50);
    xTickText.setAttribute("font-size", 10);
    xTickText.setAttribute("font-family", "sans-serif");
    xTickText.setAttribute("fill", "white");
    xTickText.setAttribute("text-anchor", "start"); // 
    // rotate each label by 45 degrees
    xTickText.setAttribute("transform", "rotate(45 " + (60 + (svgWidth - 30) / months.length * i) + "," + (svgHeight - 50) + ")");
    xTickText.textContent = months[i];
    xTicks.appendChild(xTickText);

  }

  // draw the y axis ticks. each ticks will be an amount of xp. From 0 to 2 millions. One tick every 100k
  var xpTicks = ["0", "100k", "200k", "300k", "400k", "500k", "600k", "700k", "800k", "900k", "1M", "1.1M", "1.2M", "1.3M", "1.4M", "1.5M", "1.6M", "1.7M", "1.8M", "1.9M", "2M"];
  var yTicks = document.createElementNS("http://www.w3.org/2000/svg", "g");
  yTicks.setAttribute("class", "yTicks");
  svg.appendChild(yTicks);

  for (var i = 0; i < xpTicks.length; i++) {
    // draw the y axis ticks
    var yTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yTick.setAttribute("x1", 55);
    yTick.setAttribute("y1", svgHeight - 60 - (svgHeight - 60) / xpTicks.length * i);

    //yTick.setAttribute("x2", 60);
    yTick.setAttribute("x2", svgWidth);
    yTick.setAttribute("y2", svgHeight - 60 - (svgHeight - 60) / xpTicks.length * i);
    //yTick.setAttribute("stroke", "white");
    yTick.setAttribute("stroke", "rgba(255, 255, 255, 0.2)");
    yTick.setAttribute("stroke-width", 1);
    yTicks.appendChild(yTick);

    // draw the y axis labels (xp)
    var yTickText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yTickText.setAttribute("x", 50);
    yTickText.setAttribute("y", svgHeight - 60 - (svgHeight - 60) / xpTicks.length * i);
    yTickText.setAttribute("font-size", 10);
    yTickText.setAttribute("font-family", "sans-serif");
    yTickText.setAttribute("fill", "white");
    yTickText.setAttribute("text-anchor", "end");
    yTickText.textContent = xpTicks[i];
    yTicks.appendChild(yTickText);

  }

  //var xpCurve = document.createElementNS("http://www.w3.org/2000/svg", "path"); // path element is used to draw curves

  // draw the xp curve
  // the curve will be brake lines. each point will be aligned with the month and the exact xp amount

  var previousY = 0;

  for (var i = 0; i < data.length; i++) {
    var xpCurve = document.createElementNS("http://www.w3.org/2000/svg", "path");
    //take only the month and the year from the date
    var month = data[i].date.substring(0, 7);
    var xp = data[i].amount;

    /* if (perviousX != month ) {
      perviousX = month;
    } else {
      perviousY += xp;
      continue; // continue to the next iteration of the loop
    } */

    previousY += xp;


    var xpScale = (svgHeight - 60) / 2100000;
    // get the x and y coordinates of the point
    // align the point with the month
    for (var j = 0; j < months.length; j++) {
      if (month == months[j]) {
        var x = 60 + (svgWidth - 60) / months.length * j;

      }
    }

    var y = svgHeight - 60 - previousY * xpScale;

    // draw the point
    /* var point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute("cx", x);
    point.setAttribute("cy", y);
    point.setAttribute("r", 2);
    point.setAttribute("fill", "red");
    svg.appendChild(point); */
    // same as above but with cross
    var point = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var cross = "M" + (x - 2) + " " + (y - 2) + "L" + (x + 2) + " " + (y + 2) + "M" + (x + 2) + " " + (y - 2) + "L" + (x - 2) + " " + (y + 2);
    point.setAttribute("d", cross);
    point.setAttribute("stroke", "red");
    point.setAttribute("stroke-width", 1);
    svg.appendChild(point);


    // draw the line
    if (i == 0) {
      var path = "M" + x + " " + y;
    }
    else {
      path += "L" + x + " " + y;
    }
    xpCurve.setAttribute("d", path); // d is the attribute that defines the path of the curve (M = move to, L = line to)
    xpCurve.setAttribute("stroke", "white");
    xpCurve.setAttribute("stroke-width", 1);
    xpCurve.setAttribute("fill", "none");
    //make the lines be behind the points

    svg.appendChild(xpCurve);

  }


  var container = document.getElementById("svg_xp_curve");
  container.appendChild(svg);

}

/* -------------------------------------------------------------------------------------------- */

fetchSkills();

function fetchSkills() {
  fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Set Basic authentication headers with base64 encoding
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      query: `
        query  {
          user {
            transactions(where: {
                type: {_ilike: "%skill%"}
              }
            ) {
              type
              amount
            }
          }
        }
        `,
    }),
  })
    .then(res => res.json())
    .then(data => {
      DisplaySkills(data);
    })
    .catch(err => console.error('Introspection failed at Skills:', err));
}

function DisplaySkills(data) {
  // prog, algo, sys-admin, front, back, stats, game
  var techSkills = {
    "Prog": 0,
    "Algo": 0,
    "Sys-Admin": 0,
    "Front-End": 0,
    "Back-End": 0,
    "Stats": 0,
    "Game": 0
  };
  var langSkills = {
    "Go": 0,
    "Js": 0,
    "Rust": 0,
    "Html": 0,
    "Css": 0,
    "Unix": 0,
    "Docker": 0,
    "Sql": 0,
    "C": 0
  };

  var maxTech = 0;
  var maxLang = 0;

  for (var i = 0; i < data.data.user[0].transactions.length; i++) {
    var skill = data.data.user[0].transactions[i].type;
    var amount = data.data.user[0].transactions[i].amount;

    //if (skill.includes("_go") || skill.includes("js") || skill.includes("rust") || skill.includes("html") || skill.includes("css") || skill.includes("unix") || skill.includes("docker") || skill.includes("sql") || skill.includes("_c")) {

    if (skill.includes("_go") || skill.includes("js") || skill.includes("rust") || skill.includes("html") || skill.includes("css") || skill.includes("unix") || skill.includes("docker") || skill.includes("sql") || skill.includes("_c")) {
      if (skill.includes("_go")) {
        skill = "Go";
      } else if (skill.includes("js")) {
        skill = "Js";
      } else if (skill.includes("rust")) {
        skill = "Rust";
      } else if (skill.includes("html")) {
        skill = "Html";
      } else if (skill.includes("css")) {
        skill = "Css";
      } else if (skill.includes("unix")) {
        skill = "Unix";
      } else if (skill.includes("docker")) {
        skill = "Docker";
      } else if (skill.includes("sql")) {
        skill = "Sql";
      } else if (skill.includes("_c")) {
        skill = "C";
      }

      if (langSkills[skill] == undefined || langSkills[skill] < amount) {
        langSkills[skill] = amount;
      }
      if (maxLang < amount) {
        maxLang = amount;
      }
    } else {// take only the greatest amount of xp for each skill
      if (skill.includes("prog")) {
        skill = "Prog";
      } else if (skill.includes("algo")) {
        skill = "Algo";
      } else if (skill.includes("sys-admin")) {
        skill = "Sys-Admin";
      } else if (skill.includes("front")) {
        skill = "Front-End";
      } else if (skill.includes("back")) {
        skill = "Back-End";
      } else if (skill.includes("stats")) {
        skill = "Stats";
      } else if (skill.includes("game")) {
        skill = "Game";
      }
      if (techSkills[skill] == undefined || techSkills[skill] < amount) {
        techSkills[skill] = amount;
      }
      if (maxTech < amount) {
        maxTech = amount;
      }
    }
  }

  // make one graph for each skill type (tech and lang). The graphs will be circles with as many radius as the number of skills. Those radius will be ticked with the amount of xp for each skill

  document.getElementById("technical_skills").innerHTML = "";
  document.getElementById("technologies").innerHTML = "";

  var parentTechWidth = document.getElementById("technical_skills").offsetWidth;
  var parentTechHeight = document.getElementById("technical_skills").offsetHeight;

  var parentLangWidth = document.getElementById("technologies").offsetWidth;
  var parentLangHeight = document.getElementById("technologies").offsetHeight;

  var svgTech = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgTech.setAttribute("width", parentTechWidth);
  svgTech.setAttribute("height", parentTechHeight);
  svgTech.setAttribute("viewBox", `0 0 ${parentTechWidth} ${parentTechHeight}`);

  var techCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  techCircle.setAttribute("cx", parentTechWidth / 2); // cx and cy are the coordinates of the center of the circle
  techCircle.setAttribute("cy", parentTechHeight / 2);
  techCircle.setAttribute("r", parentTechWidth / 3 - 10); // r is the radius of the circle
  techCircle.setAttribute("fill", "none");
  techCircle.setAttribute("stroke", "white");
  techCircle.setAttribute("stroke-width", 3);
  svgTech.appendChild(techCircle);

  // number of skills
  var numberOfRadiusTech = Object.keys(techSkills).length;
  var techAngle = 360 / numberOfRadiusTech;
  var textAngle = 0;
  var radiusLength = (parentTechWidth / 3 -10);
  var previousAngle = 0 - techAngle;

  // draw a radius for each skill
  for (var key in techSkills) {
    var rayon = document.createElementNS("http://www.w3.org/2000/svg", "line");
    rayon.setAttribute("x1", parentTechWidth / 2);
    rayon.setAttribute("y1", parentTechHeight / 2);
    rayon.setAttribute("x2", parentTechWidth / 2);
    rayon.setAttribute("y2", parentTechHeight / 2 - parentTechWidth / 3 + 10);
    rayon.setAttribute("stroke", "white");
    rayon.setAttribute("stroke-width", 1);
    rayon.setAttribute("transform", `rotate(${previousAngle}, ${parentTechWidth / 2}, ${parentTechHeight / 2})`);
    svgTech.appendChild(rayon);
    //console.log(key);
    previousAngle += techAngle;

    // place the ticks on the radius
    var previousX = parentTechWidth / 2;
    var previousY = parentTechHeight / 2;
    var radPart = radiusLength / 10;

    for (var i = 0; i < 10; i++) {
      var ticks = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ticks.setAttribute("x1", previousX - 3);
      ticks.setAttribute("y1", previousY);
      ticks.setAttribute("x2", previousX + 3);
      ticks.setAttribute("y2", previousY);
      ticks.setAttribute("stroke", "white");
      ticks.setAttribute("stroke-width", 1);
      ticks.setAttribute("transform", `rotate(${previousAngle}, ${parentTechWidth / 2}, ${parentTechHeight / 2})`);
      // rotate the ticks to 90°

      svgTech.appendChild(ticks);

      previousY -= radPart;

    }

    //place the amount of xp on the ticks
    var radPerCent = radiusLength / 100;
    var amount = techSkills[key];
    if (techSkills[Object.keys(techSkills)[Object.keys(techSkills).indexOf(key) + 1]] == undefined) {
      var nextamount = techSkills[Object.keys(techSkills)[0]];
    } else {
    var nextamount = techSkills[Object.keys(techSkills)[Object.keys(techSkills).indexOf(key) + 1]];
    }
    console.log("nextamount : " + nextamount);


    //console.log(amount);
    var amountTicks = document.createElementNS("http://www.w3.org/2000/svg", "line");
    amountTicks.setAttribute("x1", previousX - 3);
    amountTicks.setAttribute("y1", parentTechHeight / 2 - radPerCent * amount);
    amountTicks.setAttribute("x2", previousX + 3);
    amountTicks.setAttribute("y2", parentTechHeight / 2 - radPerCent * amount);
    amountTicks.setAttribute("stroke", "red");
    amountTicks.setAttribute("stroke-width", 3);
    amountTicks.setAttribute("transform", `rotate(${previousAngle}, ${parentTechWidth / 2}, ${parentTechHeight / 2})`);
    svgTech.appendChild(amountTicks);

    var a = nextamount;
    console.log("a : " + a);
    var b = amount;
    console.log("b : " + b);
    var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) - 2*(a)*(b)*Math.cos(techAngle*(Math.PI/180)));
    console.log("c : " + c);
    var angleA = Math.acos((Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2))/(2*b*c))*(180/Math.PI);
    var angleB = Math.acos((Math.pow(a, 2) + Math.pow(c, 2) - Math.pow(b, 2))/(2*a*c))*(180/Math.PI);
    var angleC = Math.acos((Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2))/(2*a*b))*(180/Math.PI);
    console.log("angleA : " + angleA); // 27.82
    console.log("angleB : " + angleB); // 100.75
    console.log("angleC : " + angleC); // 51.42857142857143

    var dotX = previousX;
    var dotY = parentTechHeight / 2 - radPerCent * amount;

    // heigth of the triangle between the  angleB the dot in b where it forms a right angle
    // p will be the half of perimetre of the triangle
    //var p = (a + b + c) / 2;
    //var heightB = 2/b * Math.sqrt(p*(p-b)*(p-a)*(p-c));
    //console.log("heightB : " + heightB); 
    
    // calculer la distance entre le point B et la base de la hauteur du triangle
    var angle_b = 180 - 90 - angleA;
    var distanceY = (Math.sin(angle_b*(Math.PI/180)) * c)/Math.sin(90*(Math.PI/180));
    //var distanceY = 56.30
    console.log("distanceY : " + distanceY);

    var distanceX = (Math.sin(angleA*(Math.PI/180)) * c)/ Math.sin(90*(Math.PI/180));
    //var distanceX = 29.71
    console.log("distanceX : " + distanceX);
    
      // retablir le rapport entre les distances et la longueur du rayon
    distanceX = distanceX * radPerCent;
    distanceY = distanceY * radPerCent;

    console.log("distanceX : " + distanceX);
    console.log("distanceY : " + distanceY);


    var nextDotX = dotX + distanceX;
    var nextDotY = dotY + distanceY;

    var centerX = parentTechWidth / 2;
    var centerY = parentTechHeight / 2;

    var polygone = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygone.setAttribute("points", `${dotX},${dotY} ${centerX},${centerY} ${nextDotX},${nextDotY}`);
    polygone.setAttribute("fill", "red");
    polygone.setAttribute("stroke", "red");
    polygone.setAttribute("stroke-width", 3);
    polygone.setAttribute("transform", `rotate(${previousAngle}, ${parentTechWidth / 2}, ${parentTechHeight / 2})`);
    svgTech.appendChild(polygone);

    
    // place the name of the tech at the end of the radius, outside the circle. but the text should be rotated to be horizontal
    var techName = document.createElementNS("http://www.w3.org/2000/svg", "text");
    techName.setAttribute("x", previousX - 20);
    techName.setAttribute("y", previousY -15);
    techName.setAttribute("fill", "white");
    techName.setAttribute("font-size", 12);
    techName.setAttribute("transform", `rotate(${previousAngle}, ${parentTechWidth / 2}, ${parentTechHeight / 2})`);
    techName.textContent = key;
    svgTech.appendChild(techName);

    
  }


  var svgLang = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgLang.setAttribute("width", parentLangWidth);
  svgLang.setAttribute("height", parentLangHeight);
  svgLang.setAttribute("viewBox", `0 0 ${parentLangWidth} ${parentLangHeight}`);

  var langCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  langCircle.setAttribute("cx", parentLangWidth / 2); // cx and cy are the coordinates of the center of the circle
  langCircle.setAttribute("cy", parentLangHeight / 2);
  langCircle.setAttribute("r", parentLangWidth / 3 - 10); // r is the radius of the circle
  langCircle.setAttribute("fill", "none");
  langCircle.setAttribute("stroke", "white");
  langCircle.setAttribute("stroke-width", 3);
  svgLang.appendChild(langCircle);

  var numberOfRadiusLang = Object.keys(langSkills).length;
  var langAngle = 360 / numberOfRadiusLang;
  var radiusLang = parentLangWidth / 3 - 10;
  var previousAngleLang = 0 - langAngle;

  for (var key in langSkills) {
    var rayonLang = document.createElementNS("http://www.w3.org/2000/svg", "line");
    rayonLang.setAttribute("x1", parentLangWidth / 2);
    rayonLang.setAttribute("y1", parentLangHeight / 2);
    rayonLang.setAttribute("x2", parentLangWidth / 2);
    rayonLang.setAttribute("y2", parentLangHeight / 2 - parentLangWidth / 3 + 10);
    rayonLang.setAttribute("stroke", "white");
    rayonLang.setAttribute("stroke-width", 1);
    rayonLang.setAttribute("transform", `rotate(${previousAngleLang}, ${parentLangWidth / 2}, ${parentLangHeight / 2})`);
    svgLang.appendChild(rayonLang);

    previousAngleLang += langAngle;

    var previousXLang = parentLangWidth / 2;
    var previousYLang = parentLangHeight / 2;
    var radPartLang = radiusLang / 10;

    for (var i = 0; i < 10; i++) {
      var ticksLang = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ticksLang.setAttribute("x1", previousXLang - 3);
      ticksLang.setAttribute("y1", previousYLang);
      ticksLang.setAttribute("x2", previousXLang + 3);
      ticksLang.setAttribute("y2", previousYLang);
      ticksLang.setAttribute("stroke", "white");
      ticksLang.setAttribute("stroke-width", 1);
      ticksLang.setAttribute("transform", `rotate(${previousAngleLang}, ${parentLangWidth / 2}, ${parentLangHeight / 2})`);
      svgLang.appendChild(ticksLang);

      previousYLang -= radPartLang;
    }

    var radPerCentLang = radiusLang / 100;
    var amountLang = langSkills[key];
    if (langSkills[Object.keys(langSkills)[Object.keys(langSkills).indexOf(key)+ 1]] == undefined) {
      var nextAmountLang = langSkills[Object.keys(langSkills)[0]];
    } else {
      var nextAmountLang = langSkills[Object.keys(langSkills)[Object.keys(langSkills).indexOf(key)+ 1]];
    }

    var amountLangTicks = document.createElementNS("http://www.w3.org/2000/svg", "line");
    amountLangTicks.setAttribute("x1", previousXLang - 3);
    amountLangTicks.setAttribute("y1", parentLangHeight / 2 - amountLang * radPerCentLang);
    amountLangTicks.setAttribute("x2", previousXLang + 3);
    amountLangTicks.setAttribute("y2", parentLangHeight / 2 - amountLang * radPerCentLang);
    amountLangTicks.setAttribute("stroke", "red");
    amountLangTicks.setAttribute("stroke-width", 3);
    amountLangTicks.setAttribute("transform", `rotate(${previousAngleLang}, ${parentLangWidth / 2}, ${parentLangHeight / 2})`);
    svgLang.appendChild(amountLangTicks);

    var aa = nextAmountLang;
    var bb = amountLang;
    var cc = Math.sqrt(Math.pow(aa, 2) + Math.pow(bb, 2) - 2 * (aa) * (bb) * Math.cos(langAngle * (Math.PI / 180)));
    var angleAA = Math.acos((Math.pow(bb, 2) + Math.pow(cc, 2) - Math.pow(aa, 2))/(2*bb*cc))*(180/Math.PI);
    var angleBB = Math.acos((Math.pow(aa, 2) + Math.pow(cc, 2) - Math.pow(bb, 2))/(2*aa*cc))*(180/Math.PI);
    var angleCC = Math.acos((Math.pow(aa, 2) + Math.pow(bb, 2) - Math.pow(cc, 2))/(2*aa*bb))*(180/Math.PI);

    var dotXLang = previousXLang;
    var dotYLang = parentLangHeight / 2 - amountLang * radPerCentLang;

    var angle_bb = 180 - 90 - angleAA;
    var distanceYLang = (Math.sin(angle_bb*(Math.PI/180)) * cc)/Math.sin(90*(Math.PI/180));
    var distanceXLang = (Math.sin(angleAA*(Math.PI/180)) * cc)/Math.sin(90*(Math.PI/180));

    distanceXLang = distanceXLang * radPerCentLang;
    distanceYLang = distanceYLang * radPerCentLang; 

    var nextDotXLang = dotXLang + distanceXLang;
    var nextDotYLang = dotYLang + distanceYLang;
    
    var centerXLang = parentLangWidth / 2;
    var centerYLang = parentLangHeight / 2;

    var polygonLang = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygonLang.setAttribute("points", `${centerXLang},${centerYLang} ${dotXLang},${dotYLang} ${nextDotXLang},${nextDotYLang}`);
    polygonLang.setAttribute("fill", "red");
    polygonLang.setAttribute("stroke", "red");
    polygonLang.setAttribute("stroke-width", 3);
    polygonLang.setAttribute("transform", `rotate(${previousAngleLang}, ${parentLangWidth / 2}, ${parentLangHeight / 2})`);
    svgLang.appendChild(polygonLang);

    var textLang = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLang.setAttribute("x", previousXLang - 20);
    textLang.setAttribute("y", previousYLang - 15);
    textLang.setAttribute("fill", "white");
    textLang.setAttribute("font-size", 12);
    textLang.setAttribute("transform", `rotate(${previousAngleLang}, ${parentLangWidth / 2}, ${parentLangHeight / 2})`);
    textLang.innerHTML = key;
    svgLang.appendChild(textLang);
    
  }

  var techContainer = document.getElementById("technical_skills");
  techContainer.appendChild(svgTech);

  var langContainer = document.getElementById("technologies");
  langContainer.appendChild(svgLang);


  console.log(techSkills);
  console.log(langSkills);
}


