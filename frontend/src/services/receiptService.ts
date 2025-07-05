export interface ReceiptData {
  order: {
    id: number;
    order_number: string;
    customer_name?: string;
    customer_email?: string;
    table_number?: number;
    table_name?: string;
    total: number;
    subtotal: number;
    tax: number;
    discount: number;
    status: string;
    payment_status?: string;
    notes?: string;
    created_at: string;
    created_by_user?: string;
    items: Array<{
      id: number;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      notes?: string;
    }>;
  };
  paymentDetails?: {
    payment_received: number;
    change: number;
    payment_method: string;
  };
}

export class ReceiptService {
  private static instance: ReceiptService;
  private receiptQueue: ReceiptData[] = [];

  static getInstance(): ReceiptService {
    if (!ReceiptService.instance) {
      ReceiptService.instance = new ReceiptService();
    }
    return ReceiptService.instance;
  }

  // Generate customer receipt
  generateCustomerReceipt(receiptData: ReceiptData): void {
    this.addToQueue({ ...receiptData, type: 'customer' });
  }

  // Generate kitchen receipt
  generateKitchenReceipt(receiptData: ReceiptData): void {
    this.addToQueue({ ...receiptData, type: 'kitchen' });
  }

  // Generate both receipts
  generateBothReceipts(receiptData: ReceiptData): void {
    this.generateCustomerReceipt(receiptData);
    this.generateKitchenReceipt(receiptData);
  }

  private addToQueue(receiptData: ReceiptData & { type: 'customer' | 'kitchen' }): void {
    this.receiptQueue.push(receiptData);
  }

  // Print all receipts in queue
  printAllReceipts(): void {
    if (this.receiptQueue.length === 0) {
      console.log('No receipts to print');
      return;
    }

    this.receiptQueue.forEach((receiptData, index) => {
      setTimeout(() => {
        this.printReceipt(receiptData);
      }, index * 1000); // Print each receipt with 1 second delay
    });

    this.receiptQueue = []; // Clear queue after printing
  }

  // Print single receipt
  private printReceipt(receiptData: ReceiptData): void {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    const receiptHTML = this.generateReceiptHTML(receiptData);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none !important; }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .receipt {
              max-width: 300px;
              margin: 0 auto;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .restaurant-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .restaurant-info {
              font-size: 10px;
              color: #666;
            }
            .order-info {
              margin-bottom: 15px;
            }
            .order-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .items {
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 10px 0;
              margin-bottom: 15px;
            }
            .item {
              margin-bottom: 8px;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
            }
            .item-details {
              font-size: 10px;
              color: #666;
              margin-left: 10px;
            }
            .totals {
              margin-bottom: 15px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .total-final {
              font-weight: bold;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .payment-info {
              border-top: 1px solid #000;
              padding-top: 10px;
              margin-bottom: 15px;
            }
            .footer {
              text-align: center;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            .kitchen-instructions {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 10px;
              margin: 10px 0;
              font-size: 10px;
            }
            .kitchen-instructions h4 {
              margin: 0 0 5px 0;
              font-weight: bold;
            }
            .kitchen-instructions ul {
              margin: 0;
              padding-left: 15px;
            }
            .kitchen-instructions li {
              margin-bottom: 2px;
            }
          </style>
        </head>
        <body>
          ${receiptHTML}
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Print Receipt</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  private generateReceiptHTML(receiptData: ReceiptData): string {
    const { order, paymentDetails } = receiptData;
    const isKitchen = !paymentDetails; // Kitchen receipts don't have payment details

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const restaurantInfo = {
      name: 'RESTAURANT POS',
      address: '123 Main Street, City, State 12345',
      phone: '(555) 123-4567',
      website: 'www.restaurantpos.com',
    };

    return `
      <div class="receipt">
        <div class="header">
          <div class="restaurant-name">${restaurantInfo.name}</div>
          <div class="restaurant-info">
            ${restaurantInfo.address}<br>
            Phone: ${restaurantInfo.phone}<br>
            ${restaurantInfo.website}<br>
            ${formatDate(order.created_at)}
          </div>
        </div>

        <div class="order-info">
          <div class="order-row">
            <span>Order #:</span>
            <span>${order.order_number}</span>
          </div>
          ${order.customer_name ? `
            <div class="order-row">
              <span>Customer:</span>
              <span>${order.customer_name}</span>
            </div>
          ` : ''}
          ${order.table_number ? `
            <div class="order-row">
              <span>Table:</span>
              <span>${order.table_number}${order.table_name ? ` (${order.table_name})` : ''}</span>
            </div>
          ` : ''}
          <div class="order-row">
            <span>Server:</span>
            <span>${order.created_by_user || 'N/A'}</span>
          </div>
          ${order.notes ? `
            <div class="order-row">
              <span>Notes:</span>
              <span>${order.notes}</span>
            </div>
          ` : ''}
        </div>

        <div class="items">
          <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
            ${isKitchen ? 'KITCHEN ITEMS' : 'ITEMS ORDERED'}
          </div>
          ${order.items.map(item => `
            <div class="item">
              <div class="item-header">
                <span>${item.quantity}x ${item.product_name}</span>
                <span>${formatCurrency(item.total_price)}</span>
              </div>
              ${item.notes ? `
                <div class="item-details">Note: ${item.notes}</div>
              ` : ''}
              ${isKitchen ? `
                <div class="item-details">@ ${formatCurrency(item.unit_price)} each</div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        ${!isKitchen ? `
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(order.subtotal)}</span>
            </div>
            ${order.tax > 0 ? `
              <div class="total-row">
                <span>Tax:</span>
                <span>${formatCurrency(order.tax)}</span>
              </div>
            ` : ''}
            ${order.discount > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>-${formatCurrency(order.discount)}</span>
              </div>
            ` : ''}
            <div class="total-row total-final">
              <span>Total:</span>
              <span>${formatCurrency(order.total)}</span>
            </div>
          </div>
        ` : ''}

        ${!isKitchen && paymentDetails ? `
          <div class="payment-info">
            <div class="total-row">
              <span>Payment Method:</span>
              <span>${paymentDetails.payment_method.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div class="total-row">
              <span>Amount Received:</span>
              <span>${formatCurrency(paymentDetails.payment_received)}</span>
            </div>
            ${paymentDetails.change > 0 ? `
              <div class="total-row">
                <span>Change:</span>
                <span>${formatCurrency(paymentDetails.change)}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${isKitchen ? `
          <div class="kitchen-instructions">
            <h4>Kitchen Instructions:</h4>
            <ul>
              <li>Prepare items in order of priority</li>
              <li>Check for special notes on each item</li>
              <li>Notify server when order is ready</li>
              <li>Maintain food quality standards</li>
            </ul>
          </div>
        ` : ''}

        <div class="footer">
          ${isKitchen ? `
            <div style="font-weight: bold;">KITCHEN COPY</div>
            <div style="font-size: 10px; color: #666;">Order time: ${formatDate(order.created_at)}</div>
          ` : `
            <div>Thank you for dining with us!</div>
            <div>Please come again</div>
            <div style="font-size: 10px; color: #666; margin-top: 10px;">
              Receipt generated on ${new Date().toLocaleString()}
            </div>
          `}
        </div>
      </div>
    `;
  }

  // Clear receipt queue
  clearQueue(): void {
    this.receiptQueue = [];
  }

  // Get queue length
  getQueueLength(): number {
    return this.receiptQueue.length;
  }
}

export default ReceiptService.getInstance(); 