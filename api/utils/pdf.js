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
const pageHeigth = 842;
module.exports.generatePdf = function (pdfData) {
  return new Promise((res, rej) => {
    console.log('Generating', pdfData);

    // playground requires you to assign document definition to a variable called dd

    let body = [];

    if(!pdfData.url) {
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
            color: '#202020', fontSize: 10
          },
          {
            color: '#202020',
            fontSize: 10,
            table: {
              widths: ['auto', 'auto'],
              body: [
                [{ text: 'Morning - ' }, { text: drug.morning || '_', alignment: 'right' }],
                [{ text: 'Afternoon - ' }, { text: drug.afternoon || '_', alignment: 'right' }],
                [{ text: 'Evening - ' }, { text: drug.evening || '_', alignment: 'right' }],
                [{ text: 'Night - ' }, { text: drug.night || '_', alignment: 'right' }],
              ]
            },
            layout: 'noBorders'
          },
          {
            text: drug.days + ' ' + drug.start_time,
            color: '#202020',
            fontSize: 10
          }, {
            text: drug.meal,
            color: '#202020',
            fontSize: 10
          }, {
            text: drug.note,
            color: '#202020',
            fontSize: 10
          }
        ];
      });

      const diagnosticTests = pdfData.indications_and_notes.split(',').map(test => (
        { text: test, bold: true }
      ));
      body = [
        { text: 'Chief Complaint', margin: [0, 20, 0, 10], fontSize: 11, color: '#202020' },
        {
          text: [{ text: 'Symptoms: ', fontSize: 11, color: '#202020' }, {
            text: pdfData.symptoms,
            fontSize: 11,
            bold: true
          }]
        },
        {
          text: [{ text: 'Allergies: ', fontSize: 11, color: '#202020' }, { text: allergies, fontSize: 11, bold: true }],
          margin: [0, 0, 0, 30]
        },
        { text: 'Vitals', fontSize: 11, margin: [0, 0, 0, 5] },
        {
          style: 'tableExample',
          fontSize: 11,
          table: {
            widths: ['*', '*', '*'],
            body: [
              [{
                text: [{ text: 'SPO2: ' }, {
                  text: pdfData.bp,
                  bold: true
                }, {}]
              }, { text: [{ text: 'Pulse: ' }, { text: pdfData.pulse, bold: true }, { text: ' bpm' }] }, { text: [{ text: 'Weight: ' }, { text: pdfData.weight + ' kg', bold: true }, {}] }],
              // 	['BP: 142/85 mmHg', 'Pulse: 83 bpm', 'Height: 165 cm'],
              [{
                text: [{ text: 'Temperature: ' }, {
                  text: pdfData.temp,
                  bold: true
                }, { text: ' °C' }]
              }, { text: [{ text: 'Steps Count: ' }, { text: pdfData.imc, bold: true }, {}] }, { text: [{ text: 'Height: ' }, { text: pdfData.height + ' cm', bold: true }, {}] }],
            ]
          }
        },
        { margin: [0, 20, 0, 20], width: 20, image: rxImageUrl },
        {
          style: 'tableExample',
          margin: [0, 0, 0, 20],
          table: {
            widths: ['*', 75, 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Medicine Name', fillColor: '#c9c9c9' },
                { text: 'Quantity', fillColor: '#c9c9c9' },
                { text: 'Duration', fillColor: '#c9c9c9' },
                { text: 'Takes', fillColor: '#c9c9c9' },
                { text: 'Notes', fillColor: '#c9c9c9' }
              ],
              ...medicines
            ]
          }
        },
        { text: 'Advised Investigation', margin: [0, 10, 0, 5] },
        ...diagnosticTests,
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

    const docDefinition = {
      content: [
        {
          margin: [0, 0, 0, 20],
          alignment: 'center',
          table: {
            widths: ['auto'],
            body: [
              [
                {width: 60, alignment: 'left', image: logoImageUrl},
                // {text: 'Dr. LaBike', alignment: 'left', fontSize: 25, style: 'header', margin: [0, 0, 0, 0]}
              ]
            ]
          },
          layout: 'noBorders'
        },
        {
          style: 'tableExample',
          fontSize: 11,
          table: {
            widths: [300, '*', 150],
            body: [
              [{ text: pdfData.p_name, alignment: 'left' }, {}, { text: pdfData.date, alignment: 'right' }],
              [{ text: pdfData.p_address }, {}, {}],
              [{
                text: [{ text: 'Mobile: ', fontSize: 11, color: '#202020' }, {
                  text: pdfData.p_phone,
                  color: '#202020',
                  fontSize: 11,
                  bold: true
                }]
              }, {}, {}],
            ]
          },
          layout: 'noBorders'
        },
        ...body,
        {text: 'Digitally Signed', margin: [0, 60, 0, 0], color: '#0b3ba7'},
        {text: pdfData.d_name},
        {text: pdfData.speciality, margin: [0, 0, 0, 30], bold: true}
      ],
      footer: function (currentPage, pageCount) {
        return {
          table: {
            widths: ['*', 90],
            body: [
              [
                {},
                [{
                  text: currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right',
                  margin: [0, 0, 40, 0],
                  fontSize: 9
                }]
              ],
            ]
          },
          layout: 'noBorders'
        }
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
    writeStream.on('error', function () {
      // do stuff with the PDF file
      rej();
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
