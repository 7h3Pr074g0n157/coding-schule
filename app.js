const http = require('http'),
  fs = require('fs');

let form, tempCards, tempCourseList;
(form = fs.readFileSync('./form-new-courses.html', 'utf-8')),
  (tempCards = fs.readFileSync('./template-cards.html', 'utf-8').toString()),
  (tempCourseList = fs.readFileSync('./template-course-list.html', 'utf-8').toString());

let courseList = fs.readFileSync('./course-list.json');
courseList = JSON.parse(courseList);

function replaceTemplates(tempCards, courseCard) {
  let output = tempCards.replace(/{%NAME%}/g, courseCard.name);
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
      let parsedBody = Buffer.concat(body)
        .toString()
        .split('&');

      let courseName = parsedBody[0].split('=')[1].replace(/[^\w]/g, ' ');
      let courseDescription = parsedBody[1].split('=')[1].replace(/[^\w]/g, ' ');
      let newCourse = {
        id: courseList.length,
        name: courseName,
        beschreibung: courseDescription
      };
      courseList.push(newCourse);
      courseList = JSON.stringify(courseList);
      fs.writeFileSync('./course-list.json', courseList);

      let newCourseList = JSON.parse(fs.readFileSync('./course-list.json'));

      let output = newCourseList
        .map(course => {
          return replaceTemplates(tempCards, course);
        })
        .toString();

      tempCourseList = tempCourseList.replace(/{%CARDS%}/, output);

      res.writeHead(200);
      res.write(tempCourseList);
    });
  }
});

server.listen(3000);
