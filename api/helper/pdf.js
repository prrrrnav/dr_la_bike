var fonts = {
  Roboto: {
    // normal: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
    // bold: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
    // italics: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
    // bolditalics: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64')
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
};
var PdfPrinter = require('pdfmake');
var fs = require('fs');

const logoImageUrl = 'uploads/template_logo/logo.png';
const rxImageUrl = 'uploads/template_logo/rx.png';

const pageWidth = 595;
const pageHeight = 842;

/**
 * @description Expecting height parameter in centimeters to calculate BMI
 * @param pdfData
 * @returns {Promise<unknown>}
 */
module.exports.generatePdf = function (pdfData) {
  return new Promise((res, rej) => {

    // playground requires you to assign document definition to a variable called dd

    let body = [];
    let bmi = null;
    if(!pdfData.url) {
      // Calculating BMI
      bmi = (+pdfData.weight / Math.pow(+pdfData.height / 100, 2)).toFixed(2);

      const allergies = pdfData.allergies.reduce((acc, val) => {
        let prefix = '';
        if (acc.length > 0) {
          prefix = ', ';
        }
        acc += prefix + val.name
        return acc;
      }, '');

      const medicines = pdfData.medicine.map(drug => {

        return [
          {
            text: drug.drugName,
            color: '#202020', fontSize: 9
          },
          {
            color: '#202020',
            fontSize: 9,
            table: {
              widths: ['auto', 'auto'],
              body: [
                [{ text: 'Morning - ' + drug.morning || 0 },{ text: 'Afternoon - ' + drug.afternoon || 0 }],
                [{ text: 'Evening - ' + drug.evening || 0 },{ text: 'Night - ' + drug.night || 0 }]
              ]
            },
            layout: 'noBorders'
          }, {
            text: drug.route || 'Orally',
            color: '#202020',
            fontSize: 9
          }, {
            text: drug.days + ' ' + drug.start_time,
            color: '#202020',
            fontSize: 9
          }, {
            text: drug.meal,
            color: '#202020',
            fontSize: 9
          }, {
            text: drug.note,
            color: '#202020',
            fontSize: 9
          }
        ];
      });

      console.log(medicines);

      const maxWidth = 46;
      function wrap(string) {
        const strArr = string.split(" ");
        const arr = [];
        let lineBreak = true;
        let i = 0;
        while (i < strArr.length) {
          const word = strArr[i];
          if (word.length > maxWidth)
            throw new Error(
              "Your message contains a word that has more characters than your width"
            );
          if (lineBreak) {
            arr.push("");
            lineBreak = false;
          }
          let curLine = arr[arr.length - 1];
          if (curLine.length + word.length + 1 > maxWidth) {
            arr[arr.length - 1] = arr[arr.length - 1].slice(0, -1);
            lineBreak = true;
            continue;
          }
          arr[arr.length - 1] += word + " ";
          i++;
        }
        // strArr.forEach((word) => {});
        arr[arr.length - 1] = arr[arr.length - 1].slice(0, -1);
        return arr;
      }

      // let indArr = pdfData.indications_and_notes.split(',');
      let indArr = wrap(pdfData.indications_and_notes);
      if(indArr.length < 5) {
        const arr = [{}, {}, {}, {}, {}];
        indArr = indArr.concat(arr.slice(indArr.length));
      }

      const diagnosticTests = indArr.map(test => {
        const arr = [];
        let y1 = 16, y2 = 16;
        if(typeof test === 'string') {
          arr.push({ text: test, bold: true, margin: [0, 6, 0, 0], fontSize: 9 });
          y1 = 0; y2 = 0;
        }
        arr.push({ canvas: [ { type: 'line', x1: 0, y1, x2: 200, y2, lineColor: "gray", dash: {length: 2, space: 2} } ] });
        return [arr];
      });
      body = [
        { text: 'Chief Complaint', margin: [0, 20, 0, 10], fontSize: 9, color: '#202020' },
        {
          text: [{ text: 'Symptoms: ', fontSize: 9, color: '#202020' }, {
            text: pdfData.symptoms,
            fontSize: 9,
            bold: true
          }]
        },
        {
          text: [{ text: 'Allergies: ', fontSize: 9, color: '#202020' }, { text: allergies, fontSize: 9, bold: true }],
          margin: [0, 0, 0, 30]
        },
        {
          text: [{ text: 'Previous Conditions: ', fontSize: 9, color: '#202020' }, { text: pdfData.treatment, fontSize: 9, bold: true }],
          margin: [0, 0, 0, 0]
        },
        {
          text: [{ text: 'Diagnostics: ', fontSize: 9, color: '#202020' }, { text: pdfData.diagnostic, fontSize: 9, bold: true }],
          margin: [0, 0, 0, 30]
        },
        { text: 'Vitals', fontSize: 9, margin: [0, 0, 0, 5] },
        {
          style: 'tableExample',
          fontSize: 9,
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: [{ text: 'Height: ' }, { text: pdfData.height, bold: true }, {text: ' cm'}] },
                { text: [{ text: 'Weight: ' }, { text: pdfData.weight, bold: true }, {text: ' kg'}] },
                { text: [{ text: 'BMI: ' }, { text: bmi, bold: true }, {text: ' kg/m²'}] }
              ],
              [
                { text: [{ text: 'BP: ' }, { text: pdfData.bp, bold: true }, { text: ' mmHg' }] },
                { text: [{ text: 'Pulse: ' }, { text: pdfData.pulse, bold: true }, { text: ' bpm' }] },
                { text: [{ text: 'SPO2: ' }, { text: pdfData.spo2, bold: true }, { text: '%' }] }
              ],
              [
                { text: [{ text: 'Temperature: ' }, { text: pdfData.temp, bold: true }, { text: ' °F' }] },
                { text: [{ text: 'Steps Count: ' }, { text: pdfData.imc, bold: true }, {}] },
                {}
              ],

              // [{
              //   text: [{ text: 'SPO2: ' }, {
              //     text: pdfData.bp,
              //     bold: true
              //   }, {}]
              // }, { text: [{ text: 'Pulse: ' }, { text: pdfData.pulse, bold: true }, { text: ' bpm' }] }, { text: [{ text: 'Weight: ' }, { text: pdfData.weight + ' kg', bold: true }, {}] }],
              // // 	['BP: 142/85 mmHg', 'Pulse: 83 bpm', 'Height: 165 cm'],
              // [{
              //   text: [{ text: 'Temperature: ' }, {
              //     text: pdfData.temp,
              //     bold: true
              //   }, { text: ' °C' }]
              // }, { text: [{ text: 'Steps Count: ' }, { text: pdfData.imc, bold: true }, {}] }, { text: [{ text: 'Height: ' }, { text: pdfData.height + ' cm', bold: true }, {}] }],
            ]
          }
        },
        { margin: [0, 20, 0, 20], width: 20, image: rxImageUrl },
        {
          style: 'tableExample',
          margin: [0, 0, 0, 20],
          fontSize: 9,
          table: {
            dontBreakRows: true,
            widths: ['*', 120, 'auto', 'auto', 'auto', 'auto'],
            heights: ['auto', ...medicines.map(_ => 'auto'), 16, 16],
            body: [
              [
                { text: 'Medicine Name', fillColor: '#c9c9c9' },
                { text: 'Quantity', fillColor: '#c9c9c9' },
                { text: 'Route', fillColor: '#c9c9c9' },
                { text: 'Duration', fillColor: '#c9c9c9' },
                { text: 'Takes', fillColor: '#c9c9c9' },
                { text: 'Notes', fillColor: '#c9c9c9' }
              ],
              ...medicines,
              [{}, {}, {}, {}, {}, {}],
              [{}, {}, {}, {}, {}, {}],
            ]
          }
        },
        { text: 'Advised Investigation', margin: [0, 10, 0, 1], fontSize: 10, bold: true },
        {
          table: {
            widths: [200],
            body: [...diagnosticTests]
          },
          layout: 'noBorders'
        },
      ];
    } else {
      let index = pdfData.url.split('/').findIndex(c => c === 'uploads')
      const imageUrl = pdfData.url.split('/').slice(index).join('/');
      body = [
        {
          image: imageUrl,
          width: pageWidth - 80,
          margin: [0, 40, 0, 40]
        }
      ]
    }

    let agentData = {};
    if(pdfData.agent_id) {
      agentData = {
        alignment: 'right',
        fontSize: 9,
        table: {
          widths: [90],
          body: [
            [{text: pdfData.agent_name}],
            [{text: pdfData.agent_address, lineHeight: 1.15}],
            // [{text: ''}],
            [{text: 'Mob no. ' + pdfData.agent_phone}],
            [{text: 'ID: ' + pdfData.agent_id}],
          ],
        },
        layout: 'noBorders'
      };
    }

    const docDefinition = {
      // a string or { width: number, height: number }
      pageSize: 'A4',

      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [ 25, 25, 25, 80 ],
      content: [
        {
          margin: [0, 0, 0, 10],
          table: {
            widths: [60, '*', 'auto'],
            body: [
              [
                {width: 60, alignment: 'left', image: logoImageUrl},
                {},
                agentData,
              ],
            ],
          },
          layout: 'noBorders'
        },
        {
          style: 'tableExample',
          fontSize: 9,
          table: {
            widths: [300, '*', 150],
            body: [
              [{ text: [{ text: 'Patient ID: ' }, { text: pdfData.p_id, bold: true }], alignment: 'left' }, {}, { text: pdfData.date, alignment: 'right' }],
              [{ text: [{ text: 'Patient Name: ' }, { text: pdfData.p_name, bold: true }], alignment: 'left' }, {}, {}],
              [{ text: [{text: 'Address: '}, {text: pdfData.p_address}] }, {}, {}],
              [{
                text: [{ text: 'Mobile: ', fontSize: 9, color: '#202020' }, {
                  text: pdfData.p_phone,
                  color: '#202020',
                  fontSize: 9,
                  bold: true
                }]
              }, {}, {}],
            ]
          },
          layout: 'noBorders'
        },
        ...body,

      ],
      footer: function (currentPage, pageCount) {
        let footer = [];
        if(currentPage === pageCount) {
          footer = [
            {text: 'Authorized Signatory', fontSize: 9, margin: [25, 0, 0, 0], color: '#0b3ba7'},
            // {text: 'Digitally Signed', fontSize: 9, margin: [25, 0, 0, 0], color: '#0b3ba7'},
            {text: pdfData.d_name, margin: [25, 0, 0, 0], fontSize: 9},
            {text: pdfData.speciality, fontSize: 9, margin: [25, 0, 0, 0], bold: true},
            {text: 'Reg. no. ' + pdfData.d_license, fontSize: 9, margin: [25, 0, 0, 20]},
            {
              columns: [
                {
                  width: '*',
                  alignment: 'center',
                  fontSize: 9,
                  text: 'Customer care: 18002700408, Email: support@drlabike.in'
                }
              ],
            }
          ];
        }
        return footer;
      }
    }

    const doc = new PdfPrinter(fonts).createPdfKitDocument(docDefinition);
    let writeStream = fs.createWriteStream(pdfData.pdfUrl);
    doc.pipe(writeStream);
    doc.end();
    writeStream.on('finish', function () {
      // do stuff with the PDF file
      res();
    });
    writeStream.on('error', function (err) {
      // do stuff with the PDF file
      rej(err);
    });
  });
}

//
// module.exports.generatePdf = function() {
//
//   var PDFDocument = require('pdfkit');
//   var fs = require('fs');
// // Create a new PDFDocument
//   var doc = new PDFDocument();
//
//   doc.pipe(fs.createWriteStream('form.pdf'));
//
// // Set some meta data
//   doc.info['Title'] = 'Test Form Document';
//   doc.info['Author'] = 'test-acroform.js';
//
//   doc.font('Helvetica'); // establishes the default font for forms
//   doc.initForm();
//
//   let rootField = doc.formField('rootField');
//   doc.font('Courier');
//   let child1Field = doc.formField('child1Field', { parent: rootField });
//   doc.font('Helvetica');
//   let child2Field = doc.formField('child2Field', { parent: rootField });
//
//   let y = 10;
//   doc.formText('leaf1', 10, y, 200, 20, {
//     parent: child1Field,
//     value: '1999-12-31',
//     format: {
//       type: 'date',
//       param: 'yyyy-mm-dd'
//     },
//     align: 'center'
//   });
//
//   y += 30;
//   opts = {
//     parent: child1Field,
//     value: 32.98,
//     format: {
//       type: 'number',
//       nDec: 2,
//       currency: '$',
//       currencyPrepend: true
//     },
//     align: 'right'
//   };
//   doc.formText('dollar', 10, y, 200, 20, opts);
//
//   y += 30;
//   doc.formText('leaf2', 10, y, 200, 40, {
//     parent: child1Field,
//     multiline: true,
//     align: 'right'
//   });
//   y += 50;
//   doc.formText('leaf3', 10, y, 200, 80, {
//     parent: child2Field,
//     multiline: true
//   });
//
//   y += 90;
//   var opts = {
//     backgroundColor: 'yellow',
//     label: 'Test Button'
//   };
//   doc.formPushButton('btn1', 10, y, 100, 30, opts);
//
//   y += 40;
//   opts = {
//     borderColor: 'black',
//     select: ['Select Option', 'github', 'bitbucket', 'gitlab'],
//     value: 'Select Option',
//     defaultValue: 'Select Option',
//     align: 'center',
//     edit: true
//   };
//   doc.formCombo('ch1', 10, y, 100, 20, opts);
//
//   y += 30;
//   opts = {
//     borderColor: '#808080',
//     select: ['github', 'bitbucket', 'gitlab', 'sourcesafe', 'perforce'],
//     sort: true
//   };
//   doc.formList('ch2', 10, y, 100, 45, opts);
//
//   doc.end();
// }
