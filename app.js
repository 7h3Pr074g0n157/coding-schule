const http = require('http');
const fs = require('fs');

const form = fs.readFileSync('./neue-kurse.html', 'utf-8');
let courseList = fs.readFileSync('./kurs-liste.json');
courseList = JSON.parse(courseList);
let tempCard = fs.readFileSync('./template-card.html').toString();
let courseCards = fs.readFileSync('./kurs-karten.html').toString();

function replaceTemplates(tempCard, courseCard) {
  let output = tempCard.replace(/{%NAME%}/g, courseCard.name);
  output = output.replace(/{%BESCHREIBUNG%}/g, courseCard.beschreibung);
  return output;
}

const server = http.createServer((req, res) => {
  const url = req.url,
    method = req.method;

  if (url === '/') {
    res.write(form);
  } else if (url === '/neuer-kurs' && method === 'POST') {
    let body = [];
    req.on('data', chunk => {
      body.push(chunk);
    });
    req.on('end', () => {
      let parsedBody = Buffer.concat(body).toString();

      parsedBody = parsedBody.split('&');
      let newCourse = {
        id: courseList.length,
        name: parsedBody[0].split('=')[1],
        beschreibung: parsedBody[1]
          .split('=')[1]
          .split('+')
          .join(' ')
      };
      courseList.push(newCourse);

      courseList = JSON.stringify(courseList);
      fs.writeFileSync('./kurs-liste.json', courseList);
    });
    res.writeHead(302, { 'Content-type': 'text/html', Encoding: 'utf-8' });

    let output = courseList
      .map(el => {
        return replaceTemplates(tempCard, el);
      })
      .toString();

    courseCards = courseCards.replace(/{%CARDS%}/, output);
    console.log(courseCards);

    res.write(courseCards);

    return res.end();
  }
});

server.listen(3000);
