const PDFDocument = require('pdfkit');

function generate80GPdf(donationData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Headers
      doc.fontSize(20).font('Helvetica-Bold').text('HELPING HANDS FOUNDATION', { align: 'center' });
      doc.fontSize(9).font('Helvetica').text('Head office: H.No: 4/211/2, SHAKTHI GUDI, ADONI 518301, ADONI MANDAL, KURNOOL DISTRICT, A.P.', { align: 'center' });
      doc.fontSize(9).font('Helvetica').text('Working present: H.No: 4-187/4, AMBABHAVANI PET, GOWLI PET, ADONI 518301, ADONI MANDAL, KURNOOL DISTRICT, A.P.', { align: 'center' });
      doc.text('Email: helpinghandsffoundation@gmail.com | Phone: +91 77993 73766 | WhatsApp: +91 70934 26966', { align: 'center' });
      doc.text('Website: helpinghandsfoundation1.org', { align: 'center' });
      
      doc.moveDown();
      doc.lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Registration Details
      doc.fontSize(12).font('Helvetica-Bold').text('TAX EXEMPTION RECEIPT (U/S 80G OF IT ACT)', { align: 'center' });
      doc.moveDown();

      const regBoxTop = doc.y;
      doc.fontSize(9).font('Helvetica');
      doc.text(`Reg No: Book- 4, No. 89/2026`, 50, regBoxTop);
      doc.text(`12A URN: AADTH6132RE20261`, 50, regBoxTop + 15);
      doc.text(`80G URN: AADTH6132RF20261`, 50, regBoxTop + 30);
      
      doc.text(`PAN: AADTH6132R`, 350, regBoxTop);
      doc.text(`TAN: VPNH03043F`, 350, regBoxTop + 15);
      doc.text(`DARPAN ID: AP/2026/1183749`, 350, regBoxTop + 30);

      doc.moveDown(3);
      doc.lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Receipt Details
      const receiptDate = new Date().toLocaleDateString('en-IN');
      doc.fontSize(11).font('Helvetica-Bold').text('Receipt Details', { underline: true });
      doc.moveDown(0.5);
      
      doc.font('Helvetica').text(`Receipt No: ${donationData.txn_id}`);
      doc.text(`Date: ${receiptDate}`);
      
      doc.moveDown();
      doc.font('Helvetica').text(`Received with thanks from: `).font('Helvetica-Bold').text(donationData.name, { continued: false });
      if (donationData.pan_number) {
        doc.font('Helvetica').text(`Donor PAN: `).font('Helvetica-Bold').text(donationData.pan_number, { continued: false });
      }
      if (donationData.email) {
        doc.font('Helvetica').text(`Email: ${donationData.email}`);
      }
      if (donationData.phone) {
        doc.font('Helvetica').text(`Phone: ${donationData.phone}`);
      }
      if (donationData.address) {
        doc.font('Helvetica').text(`Address: ${donationData.address}`);
      }

      doc.moveDown();
      doc.font('Helvetica').text(`A sum of Rupees: `).font('Helvetica-Bold').text(`Rs. ${donationData.amount}/-`, { continued: false });
      doc.font('Helvetica').text(`Towards: `).font('Helvetica-Bold').text(donationData.designation || 'Donation');
      doc.font('Helvetica').text(`Payment Mode: `).font('Helvetica-Bold').text(donationData.payment_method || 'Online');

      doc.moveDown(2);
      
      // Footer Declaration
      doc.fontSize(10).font('Helvetica-Oblique').text('Note: Donations to Helping Hands Foundation are exempt from Income Tax under Section 80G of the IT Act, 1961.', { align: 'center' });
      doc.moveDown(2);

      doc.font('Helvetica').text('For Helping Hands Foundation,', { align: 'right' });
      doc.moveDown(3);
      doc.font('Helvetica-Bold').text('Authorized Signatory', { align: 'right' });
      
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generate80GPdf };
