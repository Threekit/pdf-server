const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compilePdf = require('./compilePdf');
const { PORT, TEST_DATA_DIR } = require('./constants');

const app = express();

app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());

app.get('/pdf/:template', async (req, res) => {
  if (!req.params.template)
    return res.status(422).send({ message: 'missing PDF template' });

  try {
    const testData = fs.readFileSync(
      `${TEST_DATA_DIR}/${req.params.template.replace('.liquid', '')}.json`,
      'utf-8'
    );

    const pdf = await compilePdf(req.params.template, JSON.parse(testData));

    res.set({ 'Content-type': 'application/pdf' });
    res.status(200).send(pdf);
  } catch (e) {
    console.log(e);
    res.status(422).send(e);
  }
});

app.post('/pdf/:template', async (req, res) => {
  if (!req.body) return res.status(422).send();
  if (!req.params.template)
    return res.status(422).send({ message: 'missing PDF template' });

  try {
    const pdf = await compilePdf(filename, req.body);

    res.set(
      Object.assign(
        { 'Content-type': 'application/pdf' },
        req.query.download === 'true'
          ? {
              'Content-Disposition':
                'attachment;filename=threekit-configuration.pdf',
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
