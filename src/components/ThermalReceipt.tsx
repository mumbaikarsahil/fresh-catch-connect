import React from 'react';

interface ThermalReceiptProps {
  orderData: {
    customerName: string;
    phone: string;
    address: string;
    items: any[];
    deliveryFee: number;
    finalTotal: number;
    paymentMethod: string;
    orderId?: string;
  };
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ orderData }) => {
  const date = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div id="thermal-receipt-content" style={{ width: '58mm', margin: '0 auto', background: 'white', color: 'black', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.2' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>THE FISHY MART</h2>
        <p style={{ margin: '0' }}>Fresh Catch Delivery</p>
        <p style={{ margin: '0' }}>Tel: +91 9082165743</p>
      </div>

      <div style={{ borderTop: '1px dashed black', margin: '8px 0' }}></div>

      {/* Order Info */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ margin: '2px 0' }}>Date: {date}</p>
        {orderData.orderId && <p style={{ margin: '2px 0' }}>Order #: {orderData.orderId}</p>}
        <p style={{ margin: '2px 0' }}>Pay Mode: {orderData.paymentMethod === 'upi_paid' ? 'UPI (PAID)' : 'CASH ON DELIVERY'}</p>
      </div>

      <div style={{ borderTop: '1px dashed black', margin: '8px 0' }}></div>

      {/* Customer Info */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Customer: {orderData.customerName || 'Guest'}</p>
        <p style={{ margin: '2px 0' }}>Ph: {orderData.phone}</p>
        <p style={{ margin: '2px 0', whiteSpace: 'pre-wrap' }}>Add: {orderData.address}</p>
      </div>

      <div style={{ borderTop: '1px dashed black', margin: '8px 0' }}></div>

      {/* Items Table */}
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <thead>
          <tr>
            <th style={{ fontWeight: 'bold', paddingBottom: '4px', width: '60%' }}>Item</th>
            <th style={{ fontWeight: 'bold', paddingBottom: '4px', textAlign: 'center', width: '15%' }}>Qty</th>
            <th style={{ fontWeight: 'bold', paddingBottom: '4px', textAlign: 'right', width: '25%' }}>Amt</th>
          </tr>
        </thead>
        <tbody>
          {orderData.items.map((item, idx) => (
            <tr key={idx}>
              <td style={{ padding: '2px 0', paddingRight: '4px' }}>{item.name}</td>
              <td style={{ padding: '2px 0', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '2px 0', textAlign: 'right' }}>{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed black', margin: '8px 0' }}></div>

      {/* Totals */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
          <span>Subtotal:</span>
          <span>{orderData.finalTotal - orderData.deliveryFee}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
          <span>Delivery:</span>
          <span>{orderData.deliveryFee}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          <span>TOTAL:</span>
          <span>Rs. {orderData.finalTotal}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed black', margin: '8px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '24px' }}>
        <p style={{ margin: '0 0 4px 0' }}>Thank you for shopping!</p>
        <p style={{ margin: '0' }}>Powered by Biillo</p>
      </div>
    </div>
  );
};