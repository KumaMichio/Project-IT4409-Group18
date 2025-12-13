const crypto = require('crypto');
const querystring = require('qs'); // Use 'qs' package like VNPay example

class VNPay {
  constructor(config) {
    this.tmnCode = config.tmnCode;
    this.hashSecret = config.hashSecret;
    this.url = config.url;
    this.returnUrl = config.returnUrl;
  }

  /**
   * Format date to VNPay format (yyyyMMddHHmmss)
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Sort object by keys (alphabetically) - VNPay format
   * This matches the official VNPay sortObject function
   */
  sortObject(obj) {
    const sorted = {};
    const str = [];
    let key;
    
    // Get all keys and encode them
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    
    // Sort keys
    str.sort();
    
    // Build sorted object with encoded values
    for (key = 0; key < str.length; key++) {
      const decodedKey = decodeURIComponent(str[key]);
      const value = obj[decodedKey];
      if (value !== null && value !== undefined && value !== '') {
        // Encode value and replace %20 with + (VNPay requirement)
        sorted[str[key]] = encodeURIComponent(value).replace(/%20/g, "+");
      }
    }
    
    return sorted;
  }

  /**
   * Create payment URL from order
   */
  createPaymentUrl(order, ipAddress = '127.0.0.1') {
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 minutes

    const orderId = order.order_number;
    const amount = order.total_amount_cents;
    
    // Validate amount - must be > 0
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount: amount must be greater than 0');
    }

    // VNPay requires amount in smallest unit (multiply by 100 for VND)
    const vnpAmount = amount * 100;
    
    // Order description - limit to 255 characters, remove special chars
    // VNPay requires order info to be URL-safe
    const orderDescription = `Thanh toan don hang ${orderId}`.substring(0, 255);
    const orderType = 'other';
    const locale = 'vn';
    const currCode = 'VND';
    
    // Normalize IP address - convert IPv6 localhost to IPv4
    let normalizedIp = ipAddress;
    if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
      normalizedIp = '127.0.0.1';
    } else if (ipAddress && ipAddress.includes('::')) {
      // Extract IPv4 from IPv6-mapped IPv4
      const ipv4Match = ipAddress.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
      if (ipv4Match) {
        normalizedIp = ipv4Match[1];
      } else {
        normalizedIp = '127.0.0.1'; // Fallback to localhost
      }
    }

    // Build params object
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = String(orderId); // Ensure it's a string
    vnp_Params['vnp_OrderInfo'] = orderDescription;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = String(vnpAmount); // Convert to string
    vnp_Params['vnp_ReturnUrl'] = this.returnUrl;
    vnp_Params['vnp_IpAddr'] = normalizedIp; // Use normalized IP
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = expireDate;

    // Sort params alphabetically using VNPay's sortObject (which encodes keys and values)
    vnp_Params = this.sortObject(vnp_Params);

    // Create query string for signature using querystring.stringify with encode: false
    // Note: sortObject has already encoded the values, so we use encode: false
    const signData = querystring.stringify(vnp_Params, { encode: false });
    
    console.log('=== VNPay Payment URL Generation ===');
    console.log('Order ID:', orderId);
    console.log('Amount (cents):', amount);
    console.log('VNPay Amount (x100):', vnpAmount);
    console.log('Original IP:', ipAddress);
    console.log('Normalized IP:', normalizedIp);
    console.log('Return URL:', this.returnUrl);
    console.log('Sign data (for signature):', signData);
    console.log('Hash secret length:', this.hashSecret ? this.hashSecret.length : 0);
    
    // Validate hash secret
    if (!this.hashSecret || this.hashSecret.length === 0) {
      throw new Error('VNPay hash secret is missing or empty');
    }
    
    // Validate return URL
    if (!this.returnUrl || !this.returnUrl.startsWith('http')) {
      throw new Error('VNPay return URL is invalid: ' + this.returnUrl);
    }
    
    // Create signature (HMAC SHA512)
    const hmac = crypto.createHmac("sha512", this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    
    console.log('Generated signature:', signed);
    
    // Add signature to params (need to add to sorted object)
    vnp_Params['vnp_SecureHash'] = signed;

    // Create final payment URL with querystring.stringify (encode: false)
    // sortObject has already encoded values, so we use encode: false
    const paymentUrl = this.url + '?' + querystring.stringify(vnp_Params, { encode: false });
    
    console.log('Final payment URL length:', paymentUrl.length);
    console.log('Payment URL preview:', paymentUrl.substring(0, 200) + '...');
    
    return paymentUrl;
  }

  /**
   * Verify signature from VNPay return URL
   */
  verifyReturnUrl(vnp_Params) {
    const secureHash = vnp_Params['vnp_SecureHash'];
    
    // Remove signature fields
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sort params using VNPay's sortObject
    vnp_Params = this.sortObject(vnp_Params);
    
    // Create query string using querystring.stringify with encode: false
    // sortObject has already encoded the values
    const signData = querystring.stringify(vnp_Params, { encode: false });

    // Create signature
    const hmac = crypto.createHmac("sha512", this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    // Compare signatures
    return secureHash === signed;
  }

  /**
   * Extract order info from VNPay return params
   */
  extractOrderInfo(vnp_Params) {
    return {
      orderNumber: vnp_Params['vnp_TxnRef'],
      transactionNo: vnp_Params['vnp_TransactionNo'],
      responseCode: vnp_Params['vnp_ResponseCode'],
      amount: parseInt(vnp_Params['vnp_Amount']) / 100, // Convert back from smallest unit
      bankCode: vnp_Params['vnp_BankCode'],
      payDate: vnp_Params['vnp_PayDate'],
      rawData: vnp_Params
    };
  }
}

module.exports = VNPay;

