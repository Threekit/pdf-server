const express = require('express');
const multer = require('multer');
const cors = require('cors');
const morgan = require('morgan');
const compilePdf = require('./compilePdf');

const PORT = process.env.PORT || 4000;

const app = express();

app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());

app.post('/pdf', multer().single('template'), async (req, res) => {
  if (!req.file)
    return res.status(422).send({ message: 'missing PDF template' });
  if (!req.body.data)
    return res.status(422).send({ message: 'missing PDF data' });

  const data = JSON.parse(req.body.data);
  let filename = 'configuration.pdf';

  if (req.body.filename) {
    const preppedFilename = req.body.filename.trim().replaceAll(' ', '-');
    if (preppedFilename.endsWith('.pdf')) filename = preppedFilename;
    else filename = `${preppedFilename}.pdf`;
  }

  try {
    const pdf = await compilePdf(req.file, data);

    res.set(
      Object.assign(
        { 'Content-type': 'application/pdf' },
        req.query.download === 'true'
          ? {
              'Content-Disposition': `attachment;filename=${filename}`,
            }
          : {}
      )
    );
    res.end(pdf);
  } catch (e) {
    console.log(e);
    res.status(422).send(e);
  }
});

app.listen(PORT, () => console.log('listening on port: ', PORT));
