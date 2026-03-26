import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define types for invoice data
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

export const generateInvoicePDF = (invoiceData: InvoiceData) => {
  try {
    const doc = new jsPDF();
    const { sender, customer, invoiceNo, invoiceDate, dueDate, items, billingCurrency, notes, accountName, accountNumber, bankAddress, achRoutingNo, discountRate } = invoiceData;

    // Helper to extract currency symbol or use default
    const getCurrencySymbol = (currencyStr: string) => {
      const match = currencyStr.match(/\((.*?)\)/);
      if (match && match[1]) return match[1];
      if (currencyStr.includes('$')) return '$';
      if (currencyStr.includes('€')) return '€';
      if (currencyStr.includes('£')) return '£';
      if (currencyStr.includes('₦')) return '₦';
      return '';
    };

    const currencySymbol = getCurrencySymbol(billingCurrency);

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
    if (sender.email) doc.text(sender.email, 140, 34);
    if (sender.phone1) doc.text(sender.phone1, 140, 40);

    // Customer Details (Left)
    doc.setFontSize(10);
    doc.text('BILL TO:', 14, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(customer.name || 'Client Name', 14, 66);
    doc.setFont('helvetica', 'normal');
    if (customer.email) doc.text(customer.email, 14, 72);
    if (customer.phone) doc.text(customer.phone, 14, 78);

    // Table header
    const tableColumn = ["Description", "Quantity", "Price", "Total"];
    const tableRows: any[] = [];

    items.forEach((item: InvoiceItem) => {
      const itemData = [
        item.description,
        item.quantity,
        `${currencySymbol}${Number(item.price).toFixed(2)}`,
        `${currencySymbol}${Number(item.total).toFixed(2)}`
      ];
      tableRows.push(itemData);
    });

    // Generate Table
    autoTable(doc, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Totals
    const subtotal = items.reduce((sum: number, item: InvoiceItem) => sum + (Number(item.total) || 0), 0);
    const discount = subtotal * ((Number(discountRate) || 0) / 100);
    const total = subtotal - discount;

    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 150;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: ${currencySymbol}${subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Discount (${discountRate}%): ${currencySymbol}${discount.toFixed(2)}`, 140, finalY + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Due: ${currencySymbol}${total.toFixed(2)}`, 140, finalY + 14);

    // Payment Info
    const paymentY = finalY + 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INFORMATION', 14, paymentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Account Name: ${accountName || 'N/A'}`, 14, paymentY + 6);
    doc.text(`Account Number: ${accountNumber || 'N/A'}`, 14, paymentY + 12);
    doc.text(`Bank Address: ${bankAddress || 'N/A'}`, 14, paymentY + 18);
    doc.text(`Routing / SWIFT: ${achRoutingNo || 'N/A'}`, 14, paymentY + 24);

    // Notes
    if (notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES:', 14, paymentY + 32);
      doc.setFont('helvetica', 'normal');
      doc.text(notes, 14, paymentY + 38, { maxWidth: 180 });
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', 105, 285, { align: 'center' });

    // Save the PDF
    doc.save(`invoice_${invoiceNo || 'draft'}.pdf`);
  } catch (error) {
    console.error('PDF Generation failed:', error);
    alert('Failed to generate PDF. Please check your data.');
  }
};
