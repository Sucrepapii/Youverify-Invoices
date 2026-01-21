import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/api';
import {
  Close,
  Mail,
  ContentCopy,
  Link,
  Person,
  Phone,
  CheckCircle,
  MoreVert,
  Business
} from '@mui/icons-material';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceFormData {
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
  discountRate: number;
  accountName: string;
  accountNumber: string;
  bankAddress: string;
  achRoutingNo: string;
}

interface InvoiceFormProps {
  onClose: () => void;
}

export default function InvoiceForm({ onClose }: InvoiceFormProps) {
  // Helper function to get current date in required format
  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  };

  // Helper function to get date 30 days from now
  const getDueDateDefault = () => {
    const now = new Date();
    now.setDate(now.getDate() + 30);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  };

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNo: '',
    sender: {
      name: '',
      phone1: '',
      phone2: '',
      email: ''
    },
    customer: {
      name: '',
      phone: '',
      email: ''
    },
    invoiceDate: getCurrentDate(),
    dueDate: getDueDateDefault(),
    billingCurrency: 'USD ($)',
    items: [
      {
        id: 1,
        description: '',
        quantity: 1,
        price: 0,
        total: 0
      }
    ],
    notes: '',
    discountRate: 0,
    accountName: '',
    accountNumber: '',
    bankAddress: '',
    achRoutingNo: ''
  });

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const handleItemChange = (
    id: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updatedItems = formData.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }

        return updatedItem;
      }
      return item;
    });

    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Date.now(),
          description: '',
          quantity: 1,
          price: 0,
          total: 0
        }
      ]
    });
  };

  const removeItem = (id: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter(item => item.id !== id)
      });
    }
  };

  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (formData.discountRate / 100);
  const totalAmount = subtotal - discountAmount;

  const validateForm = (): boolean => {

    // Check sender information
    if (!formData.sender.name.trim()) {
      toast.error('Please enter sender name');
      return false;
    }
    if (!formData.sender.email.trim()) {
      toast.error('Please enter sender email');
      return false;
    }

    // Check customer information
    if (!formData.customer.name.trim()) {
      toast.error('Please enter customer name');
      return false;
    }
    if (!formData.customer.email.trim()) {
      toast.error('Please enter customer email');
      return false;
    }

    // Check if at least one item has a description
    const hasValidItem = formData.items.some(item => item.description.trim() !== '');
    if (!hasValidItem) {
      toast.error('Please add at least one item with a description');
      return false;
    }

    return true;
  };

  const createInvoice = async (action: 'save' | 'send') => {
    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.EVENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Invoice ${formData.invoiceNo}`,
          description: `Invoice for ${formData.customer.name}`,
          date: formData.invoiceDate,
          image: 'https://via.placeholder.com/300',
          location: 'Online',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const message = action === 'send' ? 'Invoice sent successfully!' : 'Invoice saved successfully!';
      toast.success(message);
      onClose();
    } catch (error) {
      toast.error('Failed to process invoice');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createInvoice('save');
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClose();
  };

  const handleSendInvoice = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await createInvoice('send');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDuplicateInvoice = () => {
    toast.success('Invoice duplicated successfully!');
    setIsMoreMenuOpen(false);
  };

  const handleGetShareableLink = () => {
    const shareableLink = `${window.location.origin}/invoice/${formData.invoiceNo || 'draft'}`;
    navigator.clipboard.writeText(shareableLink);
    toast.success('Shareable link copied to clipboard!');
    setIsMoreMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl my-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Invoice - 1023494 - 2304</h1>
              <p className="text-gray-500 text-sm mt-1">View the details and activity of this invoice</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
                DOWNLOAD AS PDF
              </button>

              <button
                type='button'
                onClick={handleSendInvoice}
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                <span>{isSubmitting ? 'SENDING...' : 'SEND INVOICE'}</span>
              </button>

              {/* More Dropdown Menu */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium border border-gray-300"
                >
                  MORE
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={handleDuplicateInvoice}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition text-left"
                      >
                        <ContentCopy sx={{ fontSize: 16 }} />
                        <span>Duplicate Invoice</span>
                      </button>
                      <button
                        onClick={handleGetShareableLink}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition text-left"
                      >
                        <Link sx={{ fontSize: 16 }} />
                        <span>Get Shareable Link</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <Close sx={{ fontSize: 24 }} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* PARTIAL PAYMENT Badge and REMINDERS */}
          <div className="mb-6">
            <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded text-xs font-medium inline-block mb-4">
              PARTIAL PAYMENT
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600 font-medium">REMINDERS</span>
              <div className="flex items-center space-x-3">
                {[
                  { days: '14', label: '14 days before due date' },
                  { days: '7', label: '7 days before due date' },
                  { days: '3', label: '3 days before due date' },
                  { days: '24', label: '24 hrs before due date' }
                ].map((reminder, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">{reminder.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Left Column - Main Invoice Content (2/3 width) */}
            <div className="col-span-1 lg:col-span-2 space-y-6">

              {/* Sender, Customer & Invoice Details - Pink Background Section */}
              <div className="bg-pink-50 rounded-lg p-6">
                <div className="mb-6 md:mb-8">
                  <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4">INVOICE DETAILS</h2>

                  {/* Invoice Number */}
                  <div className="mb-4 md:mb-6">
                    <p className="text-sm text-gray-500 mb-1">INVOICE NO</p>
                    <p className="text-lg font-semibold">{formData.invoiceNo}</p>
                  </div>

                  {/* Sender and Customer Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6">
                    {/* Sender Column */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-700 font-medium">SENDER</h3>
                        <Business sx={{ fontSize: 16 }} className="text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Sender Name"
                          value={formData.sender.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            sender: { ...formData.sender, name: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="flex items-center space-x-2">
                          <Phone sx={{ fontSize: 14 }} className="text-gray-400" />
                          <input
                            type="tel"
                            placeholder="Phone 1"
                            value={formData.sender.phone1}
                            onChange={(e) => setFormData({
                              ...formData,
                              sender: { ...formData.sender, phone1: e.target.value }
                            })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone sx={{ fontSize: 14 }} className="text-gray-400" />
                          <input
                            type="tel"
                            placeholder="Phone 2"
                            value={formData.sender.phone2}
                            onChange={(e) => setFormData({
                              ...formData,
                              sender: { ...formData.sender, phone2: e.target.value }
                            })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail sx={{ fontSize: 14 }} className="text-gray-400" />
                          <input
                            type="email"
                            placeholder="Email"
                            value={formData.sender.email}
                            onChange={(e) => setFormData({
                              ...formData,
                              sender: { ...formData.sender, email: e.target.value }
                            })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Customer Column */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-700 font-medium">CUSTOMER</h3>
                        <Person sx={{ fontSize: 16 }} className="text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Customer Name"
                          value={formData.customer.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            customer: { ...formData.customer, name: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        />
                        <div className="flex items-center space-x-2">
                          <Phone sx={{ fontSize: 14 }} className="text-gray-400" />
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={formData.customer.phone}
                            onChange={(e) => setFormData({
                              ...formData,
                              customer: { ...formData.customer, phone: e.target.value }
                            })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail sx={{ fontSize: 14 }} className="text-gray-400" />
                          <input
                            type="email"
                            placeholder="Email"
                            value={formData.customer.email}
                            onChange={(e) => setFormData({
                              ...formData,
                              customer: { ...formData.customer, email: e.target.value }
                            })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Dates and Currency */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">INVOICE DATE</p>
                      <p className="font-medium">{formData.invoiceDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">DUE DATE</p>
                      <p className="font-medium">{formData.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">BILLING CURRENCY</p>
                      <p className="font-medium">{formData.billingCurrency}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <div className="overflow-hidden rounded-lg border border-gray-300">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">Items</th>
                        <th className="text-right py-4 px-6 text-gray-600 font-medium text-sm">Quantity</th>
                        <th className="text-right py-4 px-6 text-gray-600 font-medium text-sm">Price</th>
                        <th className="text-right py-4 px-6 text-gray-600 font-medium text-sm">Total</th>
                        <th className="w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-6 px-6">
                            <textarea
                              value={item.description}
                              onChange={(e) =>
                                handleItemChange(item.id, 'description', e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
                              rows={item.description.includes('\n') ? 3 : 2}
                              placeholder="Item description"
                            />
                          </td>
                          <td className="py-6 px-6">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(item.id, 'quantity', Number(e.target.value))
                              }
                              className="w-full text-right border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="1"
                            />
                          </td>
                          <td className="py-6 px-6">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) =>
                                handleItemChange(item.id, 'price', Number(e.target.value))
                              }
                              className="w-full text-right border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              step="0.01"
                            />
                          </td>
                          <td className="py-6 px-6 text-right font-semibold text-gray-800">
                            ${item.total.toLocaleString()}.00
                          </td>
                          <td className="py-6 px-3">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                            >
                              <Close sx={{ fontSize: 20 }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="mt-5 text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2 text-sm"
                >
                  <span className="text-lg">+</span>
                  <span>Add Item</span>
                </button>
              </div>

              {/* Totals Section */}
              <div className="mb-6 md:mb-8">
                <div className="space-y-3 max-w-md ml-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">SUBTOTAL</span>
                    <span className="font-semibold text-lg">${subtotal.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">DISCOUNT ({formData.discountRate}%)</span>
                    <span className="text-red-600 font-semibold">${discountAmount.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="font-bold text-xl">TOTAL AMOUNT DUE</span>
                    <span className="font-bold text-xl">${totalAmount.toLocaleString()}.00</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">PAYMENT INFORMATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ACCOUNT NAME</p>
                      <input
                        type="text"
                        value={formData.accountName}
                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">BANK ADDRESS</p>
                      <input
                        type="text"
                        value={formData.bankAddress}
                        onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ACCOUNT NUMBER</p>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ACH ROUTING NO</p>
                      <input
                        type="text"
                        value={formData.achRoutingNo}
                        onChange={(e) => setFormData({ ...formData, achRoutingNo: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">NOTE</h3>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg p-4 text-gray-700 min-h-[100px]"
                  placeholder="Add a note..."
                />
              </div>
            </div>

            {/* Right Column - Invoice Activity (1/3 width) */}
            <div className="space-y-6">
              {/* Invoice Activity */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-800">INVOICE Activity</h3>
                  <MoreVert sx={{ fontSize: 16 }} className="text-gray-400" />
                </div>
                <div className="relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {[
                      {
                        user: 'You',
                        time: 'Today, 12:20 PM',
                        action: 'Created Invoice 00239434/Olaniyi Ojo Adewale',
                        status: 'completed'
                      },
                      {
                        user: 'You',
                        time: 'Today, 12:20 PM',
                        action: 'Sent Invoice 00239434/Olaniyi Ojo Adewale to Olaniyi Ojo Adewale',
                        status: 'completed'
                      },
                      {
                        user: 'Payment Confirmed',
                        time: 'Today, 12:20 PM',
                        action: 'You manually confirmed a partial payment of $503,000.00',
                        status: 'payment'
                      },
                      {
                        user: 'Payment Confirmed',
                        time: 'Today, 12:20 PM',
                        action: 'You manually confirmed a full payment of $6,000,000.00',
                        status: 'payment'
                      },
                      {
                        user: 'You',
                        time: 'Today, 12:20 PM',
                        action: 'Sent Invoice 00239434/Olaniyi Ojo Adewale to Olaniyi Ojo Adewale',
                        status: 'completed'
                      }
                    ].map((activity, idx) => (
                      <div key={idx} className="relative flex items-start space-x-3">
                        {/* Timeline dot with connector */}
                        <div className="flex-shrink-0 relative z-10">
                          <div className={`
              w-8 h-8 rounded-full flex items-center justify-center border-2
              ${activity.status === 'payment'
                              ? 'bg-green-100 border-green-500'
                              : 'bg-blue-100 border-blue-500'
                            }
            `}>
                            {activity.status === 'payment' ? (
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            ) : (
                              <CheckCircle sx={{ fontSize: 16 }} className={activity.status === 'payment' ? 'text-green-600' : 'text-blue-600'} />
                            )}
                          </div>
                        </div>

                        {/* Activity content */}
                        <div className="flex-1">
                          {/* Bubble/card container */}
                          <div className={`
              p-3 rounded-lg border
              ${activity.status === 'payment'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                            }
            `}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm text-gray-800">{activity.user}</span>
                                  {activity.status === 'payment' && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                      Payment
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700 text-sm mt-1 leading-tight">{activity.action}</p>
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions - Below the grid */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{isSubmitting ? 'Saving...' : 'Save Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}