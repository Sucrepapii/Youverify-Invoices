import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

// Define types for invoice data to fix lint errors
export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceData {
  invoiceNo: string;
  sender: {
    name: string;
    phone1: string;
    phone2: string;
    email: string;
  };
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  invoiceDate: string;
  dueDate: string;
  billingCurrency: string;
  items: InvoiceItem[];
  notes: string;
  accountName: string;
  accountNumber: string;
  bankAddress: string;
  achRoutingNo: string;
  discountRate: number;
}

// Extend jsPDF with autotable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => void;
  lastAutoTable: {
      finalY: number;
  };
}

export const generateInvoicePDF = (invoiceData: InvoiceData) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const { sender, customer, invoiceNo, invoiceDate, dueDate, items, billingCurrency, notes, accountName, accountNumber, bankAddress, achRoutingNo, discountRate } = invoiceData;

  // Header - Brand Name
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('YOUVERIFY INVOICE', 14, 22);

  // Invoice Title & Number
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`INVOICE NO: ${invoiceNo || 'DRAFT'}`, 14, 32);
  doc.text(`DATE: ${invoiceDate}`, 14, 38);
  doc.text(`DUE DATE: ${dueDate}`, 14, 44);

  // Sender Details (Top Right)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('FROM:', 140, 22);
  doc.setFont('helvetica', 'bold');
  doc.text(sender.name || 'Your Company', 140, 28);
  doc.setFont('helvetica', 'normal');
  doc.text(sender.email || '', 140, 34);
  doc.text(sender.phone1 || '', 140, 40);

  // Customer Details (Left)
  doc.setFontSize(10);
  doc.text('BILL TO:', 14, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.name || 'Client Name', 14, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.email || '', 14, 72);
  doc.text(customer.phone || '', 14, 78);

  // Table header
  const tableColumn = ["Description", "Quantity", "Price", "Total"];
  const tableRows: any[] = [];

  items.forEach((item: InvoiceItem) => {
    const itemData = [
      item.description,
      item.quantity,
      `${billingCurrency.split(' ')[1]}${item.price.toFixed(2)}`,
      `${billingCurrency.split(' ')[1]}${item.total.toFixed(2)}`
    ];
    tableRows.push(itemData);
  });

  // Generate Table
  doc.autoTable({
    startY: 90,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Totals
  const subtotal = items.reduce((sum: number, item: InvoiceItem) => sum + item.total, 0);
  const discount = subtotal * (discountRate / 100);
  const total = subtotal - discount;

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: ${billingCurrency.split(' ')[1]}${subtotal.toFixed(2)}`, 140, finalY);
  doc.text(`Discount (${discountRate}%): ${billingCurrency.split(' ')[1]}${discount.toFixed(2)}`, 140, finalY + 7);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Due: ${billingCurrency.split(' ')[1]}${total.toFixed(2)}`, 140, finalY + 14);

  // Payment Info
  const paymentY = finalY + 30;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INFORMATION', 14, paymentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Account Name: ${accountName}`, 14, paymentY + 6);
  doc.text(`Account Number: ${accountNumber}`, 14, paymentY + 12);
  doc.text(`Bank Agent: ${bankAddress}`, 14, paymentY + 18);
  doc.text(`ACH Routing No: ${achRoutingNo}`, 14, paymentY + 24);

  // Notes
  if (notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', 14, paymentY + 36);
    doc.setFont('helvetica', 'normal');
    doc.text(notes, 14, paymentY + 42, { maxWidth: 180 });
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  // Save the PDF
  doc.save(`invoice_${invoiceNo || 'draft'}.pdf`);
};
