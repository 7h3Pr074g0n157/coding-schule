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
    // FIXME: Die im Event-Handler in das json geschriebenen Daten werden nicht sofort ausgelesen.
    // Wenn das Problem gelöst ist, das Lesen noch in async ändern.
    let newCourseList = fs.readFileSync('./kurs-liste.json');
    newCourseList = JSON.parse(newCourseList);

    let output = newCourseList
      .map(el => {
        return replaceTemplates(tempCard, el);
      })
      .toString();

    courseCards = courseCards.replace(/{%CARDS%}/, output);

    res.write(courseCards);
    return res.end();
  }
});

server.listen(3000);
