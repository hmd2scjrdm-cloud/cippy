(function (root) {
  const states = [
    ['Negeri Sembilan', /negeri\s+sembilan/i], ['Kuala Lumpur', /(?:kuala\s+lumpur|wilayah\s+persekutuan\s+kuala\s+lumpur)/i],
    ['Pulau Pinang', /(?:pulau\s+pinang|penang)/i], ['Johor', /johor/i], ['Kedah', /kedah/i],
    ['Kelantan', /kelantan/i], ['Melaka', /(?:melaka|malacca)/i], ['Pahang', /pahang/i],
    ['Perak', /perak/i], ['Perlis', /perlis/i], ['Sabah', /sabah/i], ['Sarawak', /sarawak/i],
    ['Selangor', /selangor/i], ['Terengganu', /terengganu/i], ['Putrajaya', /putrajaya/i], ['Labuan', /labuan/i],
  ];
  const labels = [
    ['name', /^(?:收件人|收货人|顾客姓名|姓名|name|recipient|receiver)\s*[:：-]\s*(.*)$/i],
    ['phone', /^(?:电话|手机|联络号码|联系电话|phone|mobile|contact|tel)\s*[:：-]\s*(.*)$/i],
    ['email', /^(?:邮箱|电子邮件|email|e-mail)\s*[:：-]\s*(.*)$/i],
    ['address', /^(?:收货地址|收件地址|配送地址|地址|address|shipping address)\s*[:：-]\s*(.*)$/i],
    ['postcode', /^(?:邮编|邮政编码|postcode|postal code|zip)\s*[:：-]\s*(.*)$/i],
    ['city', /^(?:城市|city|town)\s*[:：-]\s*(.*)$/i],
    ['state', /^(?:州属|州|state)\s*[:：-]\s*(.*)$/i],
    ['item', /^(?:商品|产品|货品|item|product|sku)\s*[:：-]\s*(.*)$/i],
    ['qty', /^(?:数量|qty|quantity)\s*[:：-]\s*(\d+)$/i],
    ['size', /^(?:尺码|size)\s*[:：-]\s*(.*)$/i],
    ['color', /^(?:颜色|color|colour)\s*[:：-]\s*(.*)$/i],
  ];

  function parseCippyOrderText(input) {
    const text = String(input || '').slice(0, 5000);
    const lines = text.split(/\r?\n/).map(line => line.trim().replace(/^[•*]\s*/, '')).filter(Boolean);
    const found = { name: '', phone: '', email: '', address: '', street: '', city: '', state: '', postcode: '', items: [], warnings: [] };
    const addressLines = [];
    const otherLines = [];
    let readingAddress = false;
    for (const line of lines) {
      const match = labels.map(([key, regex]) => [key, line.match(regex)]).find(([, result]) => result);
      if (match) {
        const [key, result] = match;
        const value = result[1].trim();
        readingAddress = key === 'address';
        if (key === 'address') addressLines.push(value);
        else if (key === 'item') {
          if (value) found.items.push(parseItem(value));
        } else if (['qty', 'size', 'color'].includes(key) && found.items.length) {
          const item = found.items[found.items.length - 1];
          if (key === 'qty') item.qty = Math.max(1, Number(value) || 1);
          else item[key] = value;
        } else if (value) found[key] = value;
      } else if (readingAddress) addressLines.push(line);
      else otherLines.push(line);
    }

    if (!found.phone) found.phone = (text.match(/(?:\+?60|0)[\s.-]?(?:\d[\s.-]?){8,10}/) || [])[0] || '';
    found.phone = found.phone.replace(/[^+\d]/g, '');
    if (found.phone && !/^(?:\+?60|0)\d{8,10}$/.test(found.phone)) {
      found.warnings.push('电话号码格式不明确，请手动检查');
      found.phone = '';
    }
    if (!found.email) found.email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || '';
    if (found.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(found.email)) {
      found.warnings.push('邮箱格式不明确，请手动检查');
      found.email = '';
    }
    if (!found.name) {
      found.name = otherLines.find(line => line.length <= 50 && !/[\d@]/.test(line) && !/^(?:malaysia|sku|rm\b)/i.test(line)) || '';
    }

    if (!addressLines.length) {
      const candidate = otherLines.filter(line => line !== found.name && line !== found.phone && line !== found.email && !/^(?:\+?60|0)[\d\s.-]{8,}$/.test(line));
      if (candidate.some(line => /\d{5}|jalan|jln\b|lorong|taman|no\.?\s*\d/i.test(line))) addressLines.push(...candidate);
    }
    found.address = addressLines.join(', ').replace(/,\s*,/g, ',').trim();
    const postalSource = [found.postcode, found.address].filter(Boolean).join(' ');
    found.postcode = (postalSource.match(/\b\d{5}\b/) || [])[0] || '';
    const stateSource = [found.state, found.address].filter(Boolean).join(' ');
    const stateMatch = states.find(([, regex]) => regex.test(stateSource));
    found.state = stateMatch ? (stateMatch[0] === 'Pulau Pinang' ? 'Penang' : stateMatch[0]) : '';
    if (!found.city && found.postcode) {
      const afterPostcode = found.address.match(new RegExp(`\\b${found.postcode}\\b[\\s,]+([^,]+)`));
      if (afterPostcode) found.city = afterPostcode[1].replace(/\bMalaysia\b/i, '').trim();
    }
    if (found.city && found.state && found.city.toLowerCase() === found.state.toLowerCase()) found.city = '';
    found.street = found.address;
    if (found.postcode) found.street = found.street.split(found.postcode)[0].replace(/[,\s]+$/, '').trim();
    if (!found.street && found.address) found.street = found.address;
    if (!found.name) found.warnings.push('未找到收件人姓名');
    if (!found.phone) found.warnings.push('未找到有效电话号码');
    if (!found.address) found.warnings.push('未找到收货地址');
    if (found.address && (!found.city || !found.state || !found.postcode)) found.warnings.push('城市、州属或邮编未能完整识别，请手动补齐');
    return found;
  }

  function parseItem(value) {
    const qty = value.match(/(?:\bx\s*|数量\s*[:：]?\s*|qty\s*[:：]?\s*)(\d+)/i);
    const size = value.match(/(?:尺码|size)\s*[:：]?\s*([A-Za-z0-9]+)/i);
    const color = value.match(/(?:颜色|color|colour)\s*[:：]?\s*([^,;/]+)/i);
    const query = value.split(/\s+x\s*\d+|\s+(?:数量|qty|尺码|size|颜色|color|colour)\s*[:：]?/i)[0].split('/')[0].trim().replace(/[,;/]+$/, '');
    const slashParts = value.split('/').map(part => part.trim()).filter(Boolean);
    const inferredSize = slashParts.slice(1).find(part => /^(?:XXS|XS|S|M|L|XL|XXL|[2-9]XL|FREE\s*SIZE)$/i.test(part));
    const inferredColor = slashParts.slice(1).find(part => part !== inferredSize);
    return { query, qty: qty ? Math.max(1, Number(qty[1])) : 1, size: size?.[1] || inferredSize || '', color: color?.[1]?.trim() || inferredColor || '' };
  }

  root.parseCippyOrderText = parseCippyOrderText;
})(globalThis);
